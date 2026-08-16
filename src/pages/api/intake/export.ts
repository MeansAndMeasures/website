import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

interface IntakeEnv {
    INTAKE_DB?: D1Database;
    INTAKE_EXPORT_TOKEN?: string;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "content-type": "application/json"
        }
    });
}

export const GET: APIRoute = async ({ request }) => {
    const intakeEnv = env as unknown as IntakeEnv;
    const url = new URL(request.url);
    const token = url.searchParams.get("token") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!intakeEnv.INTAKE_DB) {
        return jsonResponse({ ok: false, error: "Submission storage is not configured." }, 503);
    }

    if (!intakeEnv.INTAKE_EXPORT_TOKEN || token !== intakeEnv.INTAKE_EXPORT_TOKEN) {
        return jsonResponse({ ok: false, error: "Unauthorized." }, 401);
    }

    const results = await intakeEnv.INTAKE_DB
        .prepare(`
            SELECT
                id,
                submitted_at AS submittedAt,
                recipient,
                name,
                email,
                topic,
                message,
                user_agent AS userAgent,
                remote_address AS remoteAddress
            FROM intake_submissions
            ORDER BY submitted_at DESC
            LIMIT 250
        `)
        .all();

    return jsonResponse({
        ok: true,
        submissions: results.results
    });
};
