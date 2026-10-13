import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

interface NotaryEnv {
    INTAKE_DB?: D1Database;
}

interface RegisterPayload {
    action: "register";
    workspaceHash: string;
    publicKeyJwk: JsonWebKey;
}

interface RecordPayload {
    action: "append";
    recordId: string;
    savedAt: string;
    previousHash: string;
    iv: string;
    ciphertext: string;
    paperCopySha256: string;
    idempotencyKey: string;
}

const textEncoder = new TextEncoder();
const FIVE_MINUTES = 5 * 60 * 1000;

function json(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store"
        }
    });
}

function clean(value: unknown, limit: number) {
    return String(value ?? "").trim().slice(0, limit);
}

function base64UrlToBytes(value: string) {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const binary = atob(padded);
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function bytesToHex(bytes: ArrayBuffer) {
    return Array.from(new Uint8Array(bytes))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

async function sha256(value: string) {
    return bytesToHex(await crypto.subtle.digest("SHA-256", textEncoder.encode(value)));
}

const ACCESS_ISSUER = "https://civicbrands.cloudflareaccess.com";
const ACCESS_API_AUD = "792d260d41bb7a2dfe92d7d7d550fbc1ab11c4a33893b1c1d91a38800e002a9d";
async function accessIdentity(request: Request): Promise<string | null> {
    const token = request.headers.get("cf-access-jwt-assertion");
    if (!token) return null;
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const header = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[0])));
        const claims = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[1])));
        if (header.alg !== "RS256" || typeof header.kid !== "string") return null;
        if (claims.iss !== ACCESS_ISSUER || !Array.isArray(claims.aud) || !claims.aud.includes(ACCESS_API_AUD)) return null;
        const now = Math.floor(Date.now() / 1000);
        if (typeof claims.exp !== "number" || claims.exp <= now || typeof claims.iat !== "number" || claims.iat > now + 60) return null;
        if (typeof claims.email !== "string" || claims.email.toLowerCase() !== "brian@meansandmeasures.com") return null;
        const certs = await fetch(ACCESS_ISSUER + "/cdn-cgi/access/certs");
        if (!certs.ok) return null;
        const jwks = await certs.json() as { keys?: JsonWebKey[] };
        const jwk = jwks.keys?.find((key) => key.kid === header.kid);
        if (!jwk) return null;
        const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
        const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, base64UrlToBytes(parts[2]), textEncoder.encode(parts[0] + "." + parts[1]));
        return valid ? claims.email.toLowerCase() : null;
    } catch { return null; }
}

function authHeaders(request: Request) {
    return {
        workspaceHash: clean(request.headers.get("x-mm-workspace"), 128),
        requestId: clean(request.headers.get("x-mm-request-id"), 128),
        timestamp: clean(request.headers.get("x-mm-timestamp"), 64),
        signature: clean(request.headers.get("x-mm-signature"), 2048)
    };
}

function canonicalRequest(request: Request, timestamp: string, requestId: string, bodyHash: string) {
    const url = new URL(request.url);
    return [request.method.toUpperCase(), url.pathname, timestamp, requestId, bodyHash].join("\n");
}

async function verifySignature(publicKeyJwk: JsonWebKey, signature: string, canonical: string) {
    const key = await crypto.subtle.importKey(
        "jwk",
        publicKeyJwk,
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["verify"]
    );

    return crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        key,
        base64UrlToBytes(signature),
        textEncoder.encode(canonical)
    );
}

async function consumeRequestId(db: D1Database, workspaceHash: string, requestId: string, timestamp: string) {
    try {
        await db.prepare(`
            INSERT INTO notary_auth_requests (workspace_hash, request_id, request_timestamp)
            VALUES (?, ?, ?)
        `).bind(workspaceHash, requestId, timestamp).run();
        return true;
    } catch {
        return false;
    }
}

async function requireSignedRequest(request: Request, db: D1Database, bodyHash: string, identity: string) {
    const headers = authHeaders(request);
    if (!headers.workspaceHash || !headers.requestId || !headers.timestamp || !headers.signature) {
        return { ok: false as const, response: json({ ok: false, error: "Signed request headers are required." }, 401) };
    }

    const timestampMs = Date.parse(headers.timestamp);
    if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > FIVE_MINUTES) {
        return { ok: false as const, response: json({ ok: false, error: "Request timestamp is outside the allowed window." }, 401) };
    }

    const row = await db.prepare(`
        SELECT public_key_jwk, owner_identity
        FROM notary_workspaces
        WHERE workspace_hash = ?
    `).bind(headers.workspaceHash).first<{ public_key_jwk: string; owner_identity: string | null }>();

    if (!row) {
        return { ok: false as const, response: json({ ok: false, error: "Unknown notary workspace." }, 401) };
    }

    if (!row.owner_identity || row.owner_identity !== identity) {
        return { ok: false as const, response: json({ ok: false, error: "This journal key is not authorized for the authenticated owner." }, 403) };
    }

    let publicKeyJwk: JsonWebKey;
    try {
        publicKeyJwk = JSON.parse(row.public_key_jwk);
    } catch {
        return { ok: false as const, response: json({ ok: false, error: "Workspace key is invalid." }, 500) };
    }

    const canonical = canonicalRequest(request, headers.timestamp, headers.requestId, bodyHash);
    if (!(await verifySignature(publicKeyJwk, headers.signature, canonical))) {
        return { ok: false as const, response: json({ ok: false, error: "Request signature verification failed." }, 401) };
    }

    if (!(await consumeRequestId(db, headers.workspaceHash, headers.requestId, headers.timestamp))) {
        return { ok: false as const, response: json({ ok: false, error: "Request replay detected." }, 409) };
    }

    await db.prepare(`
        UPDATE notary_workspaces SET last_seen_at = CURRENT_TIMESTAMP WHERE workspace_hash = ?
    `).bind(headers.workspaceHash).run();

    return { ok: true as const, workspaceHash: headers.workspaceHash };
}

export const GET: APIRoute = async ({ request }) => {
    const identity = await accessIdentity(request);
    if (!identity) {
        return json({ ok: false, error: "Cloudflare Access authentication is required." }, 401);
    }

    const notaryEnv = env as unknown as NotaryEnv;
    const db = notaryEnv.INTAKE_DB;
    if (!db) return json({ ok: false, error: "Notary storage is unavailable." }, 503);

    const auth = await requireSignedRequest(request, db, await sha256(""), identity);
    if (!auth.ok) return auth.response;

    const result = await db.prepare(`
        SELECT record_id, saved_at, entry_hash, previous_hash, iv, ciphertext,
               paper_copy_sha256, idempotency_key, body_sha256, created_at
        FROM notary_journal_records
        WHERE workspace_hash = ?
        ORDER BY rowid DESC
        LIMIT 10000
    `).bind(auth.workspaceHash).all();

    const records = result.results ?? [];
    if (records.length === 10000) return json({ ok: false, error: "Journal exceeds current verification window; pagination is required before use." }, 409);
    for (let i = records.length - 1; i >= 0; i--) {
        const record = records[i] as { previous_hash: string; entry_hash: string; record_id: string; saved_at: string; iv: string; ciphertext: string; paper_copy_sha256: string; body_sha256?: string };
        const previous = i === records.length - 1 ? "GENESIS" : (records[i + 1] as { entry_hash: string }).entry_hash;
        if (record.previous_hash !== previous) return json({ ok: false, error: "Journal hash-chain continuity verification failed." }, 409);
        if (!record.body_sha256) return json({ ok: false, error: "Journal record missing integrity digest." }, 409);
        const expected = await sha256([auth.workspaceHash,record.record_id,record.saved_at,record.previous_hash,record.iv,record.ciphertext,record.paper_copy_sha256,record.body_sha256].join("|"));
        if (expected !== record.entry_hash) return json({ ok: false, error: "Journal record integrity verification failed." }, 409);
    }
    return json({ ok: true, records });
};

export const POST: APIRoute = async ({ request }) => {
    const identity = await accessIdentity(request);
    if (!identity) {
        return json({ ok: false, error: "Cloudflare Access authentication is required." }, 401);
    }

    const notaryEnv = env as unknown as NotaryEnv;
    const db = notaryEnv.INTAKE_DB;
    if (!db) return json({ ok: false, error: "Notary storage is unavailable." }, 503);

    const rawBody = await request.text();
    const bodyHash = await sha256(rawBody);

    let body: RegisterPayload | RecordPayload;
    try {
        body = JSON.parse(rawBody);
    } catch {
        return json({ ok: false, error: "Invalid JSON payload." }, 400);
    }

    if (body.action === "register") {
        const workspaceHash = clean(body.workspaceHash, 128);
        const headers = authHeaders(request);
        if (!workspaceHash || headers.workspaceHash !== workspaceHash || !headers.requestId || !headers.timestamp || !headers.signature) {
            return json({ ok: false, error: "Workspace registration headers are incomplete." }, 400);
        }

        const timestampMs = Date.parse(headers.timestamp);
        if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > FIVE_MINUTES) {
            return json({ ok: false, error: "Registration timestamp is outside the allowed window." }, 401);
        }

        if (!body.publicKeyJwk || typeof body.publicKeyJwk !== "object") return json({ ok: false, error: "Missing public signing key." }, 400);
        if (await sha256(JSON.stringify(body.publicKeyJwk)) !== workspaceHash) return json({ ok: false, error: "Workspace identifier does not match signing key." }, 400);
        const canonical = canonicalRequest(request, headers.timestamp, headers.requestId, bodyHash);
        let validRegistration = false;
        try { validRegistration = await verifySignature(body.publicKeyJwk, headers.signature, canonical); } catch { return json({ ok: false, error: "Invalid registration key or signature." }, 400); }
        if (!validRegistration) {
            return json({ ok: false, error: "Workspace key proof failed." }, 401);
        }

        const existing = await db.prepare(`
            SELECT public_key_jwk, owner_identity FROM notary_workspaces WHERE workspace_hash = ?
        `).bind(workspaceHash).first<{ public_key_jwk: string; owner_identity: string | null }>();

        const serializedKey = JSON.stringify(body.publicKeyJwk);
        if (existing && existing.public_key_jwk !== serializedKey) {
            return json({ ok: false, error: "Workspace is already bound to another signing key." }, 409);
        }

        if (existing && existing.owner_identity !== identity) {
            return json({ ok: false, error: "Workspace belongs to another identity or requires an explicit owner migration." }, 403);
        }

        if (!existing) {
            await db.prepare(`
                INSERT INTO notary_workspaces (workspace_hash, public_key_jwk, owner_identity, last_seen_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(workspaceHash, serializedKey, identity).run();
        }

        if (!(await consumeRequestId(db, workspaceHash, headers.requestId, headers.timestamp))) {
            return json({ ok: false, error: "Registration replay detected." }, 409);
        }

        return json({ ok: true, workspaceHash });
    }

    if (body.action !== "append") {
        return json({ ok: false, error: "Unsupported notary action." }, 400);
    }

    const auth = await requireSignedRequest(request, db, bodyHash, identity);
    if (!auth.ok) return auth.response;

    const recordId = clean(body.recordId, 128);
    const savedAt = clean(body.savedAt, 64);
    const previousHash = clean(body.previousHash, 128);
    const iv = clean(body.iv, 256);
    const ciphertext = clean(body.ciphertext, 1_500_000);
    const paperCopySha256 = clean(body.paperCopySha256, 128);
    const idempotencyKey = clean(body.idempotencyKey, 128);

    if (!recordId || !savedAt || !previousHash || !iv || !ciphertext || !paperCopySha256 || !idempotencyKey) {
        return json({ ok: false, error: "Notary record payload is incomplete." }, 400);
    }

    if (previousHash !== "GENESIS" && !/^[a-f0-9]{64}$/.test(previousHash)) return json({ ok: false, error: "Invalid previous journal hash." }, 400);
    if (!/^[a-f0-9]{64}$/.test(paperCopySha256) || !/^[A-Za-z0-9_-]{12,256}$/.test(iv)) return json({ ok: false, error: "Invalid integrity or encryption fields." }, 400);

    const existing = await db.prepare(`
        SELECT record_id, entry_hash, body_sha256, previous_hash, paper_copy_sha256, saved_at
        FROM notary_journal_records
        WHERE workspace_hash = ? AND idempotency_key = ?
    `).bind(auth.workspaceHash, idempotencyKey).first<{ record_id: string; entry_hash: string; body_sha256: string; previous_hash: string; paper_copy_sha256: string; saved_at: string }>();

    if (existing) {
        if (existing.body_sha256 !== bodyHash) {
            return json({ ok: false, error: "Idempotency key was reused with a different payload." }, 409);
        }
        return json({ ok: true, idempotent: true, recordId: existing.record_id, entryHash: existing.entry_hash, previousHash: existing.previous_hash, paperCopySha256: existing.paper_copy_sha256, savedAt: existing.saved_at });
    }

    const head = await db.prepare(`
        SELECT entry_hash
        FROM notary_journal_records
        WHERE workspace_hash = ?
        ORDER BY rowid DESC
        LIMIT 1
    `).bind(auth.workspaceHash).first<{ entry_hash: string }>();

    const expectedPrevious = head?.entry_hash ?? "GENESIS";
    if (previousHash !== expectedPrevious) {
        return json({
            ok: false,
            error: "Journal head changed. Refresh before sealing this act.",
            expectedPreviousHash: expectedPrevious
        }, 409);
    }

    const entryHash = await sha256([
        auth.workspaceHash,
        recordId,
        savedAt,
        previousHash,
        iv,
        ciphertext,
        paperCopySha256,
        bodyHash
    ].join("|"));

    try {
        await db.prepare(`
            INSERT INTO notary_journal_records (
                workspace_hash, record_id, saved_at, entry_hash, previous_hash,
                iv, ciphertext, idempotency_key, body_sha256, paper_copy_sha256,
                access_identity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            auth.workspaceHash,
            recordId,
            savedAt,
            entryHash,
            previousHash,
            iv,
            ciphertext,
            idempotencyKey,
            bodyHash,
            paperCopySha256,
            identity
        ).run();
    } catch {
        return json({ ok: false, error: "Journal append conflicted with the current chain." }, 409);
    }

    return json({ ok: true, recordId, entryHash, previousHash, paperCopySha256, savedAt });
};
