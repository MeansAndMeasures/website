import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

const GENERIC_RECIPIENT = "contact@meansandmeasures.com";
const PROCUREMENT_RECIPIENT = "procurement@meansandmeasures.com";
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

type IntakeEnv = Partial<Pick<Cloudflare.Env, "INTAKE_DB" | "INTAKE_EMAIL">>;

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

    const result = await intakeEnv.INTAKE_DB
        .prepare(`
            INSERT INTO intake_submissions (
                submitted_at,
                recipient,
                name,
                email,
                topic,
                message,
                user_agent,
                remote_address,
                email_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
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

    return result.meta.last_row_id;
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
        const submissionId = await saveSubmission(deliveryPayload);

        if (!submissionId) {
            if (import.meta.env.DEV) {
                console.info("[intake:dry-run] No storage binding; no message stored or emailed.");
                return jsonResponse({ ok: true });
            }

            return jsonResponse({
                ok: false,
                error: "Submission storage is temporarily unavailable."
            }, 503);
        }

        const intakeEnv = env as unknown as IntakeEnv;
        let messageId: string;
        try {
            if (!intakeEnv.INTAKE_EMAIL) throw new Error("Email binding unavailable");
            const text = [
                `Website intake #${submissionId}`,
                `Received: ${deliveryPayload.submittedAt}`,
                `Topic: ${topic}`,
                `Name: ${name || "Not provided"}`,
                `Reply email: ${email || "Not provided"}`,
                "", message
            ].join("\n");
            const escaped = text.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!));
            const receipt = await intakeEnv.INTAKE_EMAIL.send({
                from: { email: "website@contact.meansandmeasures.com", name: "Means+Measures website" },
                to: recipient,
                subject: `Website intake: ${topic} (#${submissionId})`,
                ...(email ? { replyTo: email } : {}),
                text,
                html: `<pre style="white-space:pre-wrap;font:inherit">${escaped}</pre>`
            });
            messageId = receipt.messageId;
        } catch {
            await intakeEnv.INTAKE_DB!.prepare("UPDATE intake_submissions SET email_status = 'failed' WHERE id = ?").bind(submissionId).run();
            console.error("[intake:email-failed] submission", submissionId);
            // The durable submission remains available to the intake export/review process.
            return jsonResponse({ ok: true, notified: false }, 202);
        }
        try {
            await intakeEnv.INTAKE_DB!.prepare("UPDATE intake_submissions SET email_status = 'sent', email_message_id = ?, email_sent_at = ? WHERE id = ?")
                .bind(messageId, new Date().toISOString(), submissionId).run();
        } catch {
            // Do not tell a person to resubmit a message already stored and emailed.
            console.error("[intake:email-receipt-save-failed] submission", submissionId);
        }
    } catch {
        return jsonResponse({
            ok: false,
            error: "Submission storage failed."
        }, 502);
    }

    return jsonResponse({ ok: true });
};
