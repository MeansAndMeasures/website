import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

interface SuggestEnv {
    INTAKE_DB?: D1Database;
    KC_SUGGEST_EXPORT_TOKEN?: string;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" }
    });
}

export const GET: APIRoute = async ({ request }) => {
    const suggestEnv = env as unknown as SuggestEnv;
    const url = new URL(request.url);
    const token = url.searchParams.get("token")
        ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!suggestEnv.INTAKE_DB) {
        return jsonResponse({ ok: false, error: "Submission storage is not configured." }, 503);
    }

    if (!suggestEnv.KC_SUGGEST_EXPORT_TOKEN || token !== suggestEnv.KC_SUGGEST_EXPORT_TOKEN) {
        return jsonResponse({ ok: false, error: "Unauthorized." }, 401);
    }

    const results = await suggestEnv.INTAKE_DB
        .prepare(`
            SELECT
                id,
                submitted_at AS submittedAt,
                type,
                org_name AS orgName,
                description,
                url,
                category,
                urgent,
                submitter_name AS submitterName,
                submitter_contact AS submitterContact,
                translation_contribution AS translationContribution,
                user_agent AS userAgent,
                remote_address AS remoteAddress
            FROM kc_suggestions
            ORDER BY submitted_at DESC
            LIMIT 500
        `)
        .all();

    return jsonResponse({
        ok: true,
        submissions: results.results
    });
};
