import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

const GENERIC_RECIPIENT = "contact@mail.civicbrands.org";
const PROCUREMENT_RECIPIENT = "procurement@mail.civicbrands.org";
const TOPICS = new Set([
    "General inquiry",
    "Public comment",
    "Research or artifact",
    "Work inquiry",
    "Procurement"
]);

interface IntakePayload {
    name?: string;
    email?: string;
    topic?: string;
    message?: string;
    company?: string;
}

interface IntakeEnv {
    INTAKE_DB?: D1Database;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "content-type": "application/json"
        }
    });
}

function clean(value: unknown, limit: number) {
    return String(value ?? "").trim().slice(0, limit);
}

async function saveSubmission(payload: {
    submittedAt: string;
    recipient: string;
    name: string;
    email: string;
    topic: string;
    message: string;
    userAgent: string;
    remoteAddress: string;
}) {
    const intakeEnv = env as unknown as IntakeEnv;

    if (!intakeEnv.INTAKE_DB) {
        return false;
    }

    await intakeEnv.INTAKE_DB
        .prepare(`
            INSERT INTO intake_submissions (
                submitted_at,
                recipient,
                name,
                email,
                topic,
                message,
                user_agent,
                remote_address
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
            payload.submittedAt,
            payload.recipient,
            payload.name,
            payload.email,
            payload.topic,
            payload.message,
            payload.userAgent,
            payload.remoteAddress
        )
        .run();

    return true;
}

export const POST: APIRoute = async ({ request }) => {
    let body: IntakePayload;

    try {
        body = await request.json();
    } catch {
        return jsonResponse({ ok: false, error: "Invalid submission payload." }, 400);
    }

    if (clean(body.company, 120)) {
        return jsonResponse({ ok: true });
    }

    const name = clean(body.name, 160);
    const email = clean(body.email, 240);
    const topic = TOPICS.has(clean(body.topic, 80)) ? clean(body.topic, 80) : "General inquiry";
    const message = clean(body.message, 6000);

    if (!message) {
        return jsonResponse({ ok: false, error: "Message is required." }, 400);
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return jsonResponse({ ok: false, error: "Email address is invalid." }, 400);
    }

    const recipient = topic === "Procurement" ? PROCUREMENT_RECIPIENT : GENERIC_RECIPIENT;
    const deliveryPayload = {
        submittedAt: new Date().toISOString(),
        recipient,
        name,
        email,
        topic,
        message,
        userAgent: request.headers.get("user-agent") ?? "",
        remoteAddress: request.headers.get("cf-connecting-ip") ?? ""
    };

    try {
        const delivered = await saveSubmission(deliveryPayload);

        if (!delivered) {
            if (import.meta.env.DEV) {
                console.info("[intake:dry-run]", deliveryPayload);
                return jsonResponse({ ok: true });
            }

            return jsonResponse({
                ok: false,
                error: "Submission storage is temporarily unavailable."
            }, 503);
        }
    } catch {
        return jsonResponse({
            ok: false,
            error: "Submission storage failed."
        }, 502);
    }

    return jsonResponse({ ok: true });
};
