import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

const TYPES = new Set(["suggest", "correct"]);

interface SuggestPayload {
    type?: string;
    orgName?: string;
    description?: string;
    url?: string;
    category?: string;
    urgent?: boolean;
    submitterName?: string;
    submitterContact?: string;
    translationContribution?: string;
    company?: string; // honeypot
}

interface SuggestEnv {
    INTAKE_DB?: D1Database;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" }
    });
}

function clean(value: unknown, limit: number) {
    return String(value ?? "").trim().slice(0, limit);
}

export const POST: APIRoute = async ({ request }) => {
    let body: SuggestPayload;

    try {
        body = await request.json();
    } catch {
        return jsonResponse({ ok: false, error: "Invalid submission." }, 400);
    }

    // Honeypot — silently accept and discard.
    if (clean(body.company, 120)) {
        return jsonResponse({ ok: true });
    }

    const type = TYPES.has(clean(body.type, 16)) ? clean(body.type, 16) : "suggest";
    const orgName = clean(body.orgName, 200);
    const description = clean(body.description, 4000);
    const url = clean(body.url, 400);
    const category = clean(body.category, 80);
    const urgent = body.urgent === true ? 1 : 0;
    const submitterName = clean(body.submitterName, 160);
    const submitterContact = clean(body.submitterContact, 240);
    const translationContribution = clean(body.translationContribution, 4000);

    if (!description && !orgName && !translationContribution) {
        return jsonResponse({ ok: false, error: "Tell us at least one thing — what to add, fix, or translate." }, 400);
    }

    const submittedAt = new Date().toISOString();
    const userAgent = request.headers.get("user-agent") ?? "";
    const remoteAddress = request.headers.get("cf-connecting-ip") ?? "";

    const suggestEnv = env as unknown as SuggestEnv;

    if (!suggestEnv.INTAKE_DB) {
        if (import.meta.env.DEV) {
            console.info("[kc-suggest:dry-run]", {
                submittedAt, type, orgName, description, url, category, urgent,
                submitterName, submitterContact, translationContribution
            });
            return jsonResponse({ ok: true });
        }
        return jsonResponse({ ok: false, error: "Submission storage is temporarily unavailable." }, 503);
    }

    try {
        await suggestEnv.INTAKE_DB
            .prepare(`
                INSERT INTO kc_suggestions (
                    submitted_at, type, org_name, description, url, category, urgent,
                    submitter_name, submitter_contact, translation_contribution,
                    user_agent, remote_address
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
                submittedAt, type, orgName, description, url, category, urgent,
                submitterName, submitterContact, translationContribution,
                userAgent, remoteAddress
            )
            .run();
    } catch {
        return jsonResponse({ ok: false, error: "Submission storage failed." }, 502);
    }

    return jsonResponse({ ok: true });
};
