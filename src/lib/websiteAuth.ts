// One identity verifier and permission map for the website's private features.
export const ACCESS_ISSUER = "https://civicbrands.cloudflareaccess.com";
// Retain the existing API audience so journal ownership and sessions survive migration.
export const ACCESS_AUDIENCE = "792d260d41bb7a2dfe92d7d7d550fbc1ab11c4a33893b1c1d91a38800e002a9d";
export const OWNER_EMAIL = "brian@meansandmeasures.com";
export const OWNER_PERMISSIONS = ["journal", "intake", "suggestions", "connections", "civicnavigator"] as const;
export type Permission = typeof OWNER_PERMISSIONS[number];
export interface WebsiteIdentity { subject: string; email: string; permissions: readonly Permission[]; expiresAt: number; }

function decode(value: string) {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    return Uint8Array.from(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")), c => c.charCodeAt(0));
}

let cachedKeys: { keys: (JsonWebKey & { kid?: string })[]; until: number } | undefined;
let pendingKeys: Promise<(JsonWebKey & { kid?: string })[]> | undefined;
async function keys() {
    if (cachedKeys && cachedKeys.until > Date.now()) return cachedKeys.keys;
    if (!pendingKeys) pendingKeys = (async () => {
        const response = await fetch(ACCESS_ISSUER + "/cdn-cgi/access/certs", { signal: AbortSignal.timeout(5000) });
        if (!response.ok) throw new Error("Identity keys unavailable");
        const body = await response.json() as { keys?: (JsonWebKey & { kid?: string })[] };
        if (!Array.isArray(body.keys)) throw new Error("Invalid identity keys");
        cachedKeys = { keys: body.keys, until: Date.now() + 5 * 60 * 1000 };
        return body.keys;
    })().finally(() => { pendingKeys = undefined; });
    return pendingKeys;
}

export async function websiteIdentity(request: Request): Promise<WebsiteIdentity | null> {
    // Ungated export routes still receive the site's signed session cookie.
    const cookieToken = request.headers.get("cookie")?.split(";").map(part => part.trim()).find(part => part.startsWith("CF_Authorization="))?.slice("CF_Authorization=".length);
    const token = request.headers.get("cf-access-jwt-assertion") ?? cookieToken;
    if (!token || token.length > 16384) return null;
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const header = JSON.parse(new TextDecoder().decode(decode(parts[0])));
        const claims = JSON.parse(new TextDecoder().decode(decode(parts[1])));
        if (header.alg !== "RS256" || typeof header.kid !== "string") return null;
        if (claims.iss !== ACCESS_ISSUER || !Array.isArray(claims.aud) || !claims.aud.includes(ACCESS_AUDIENCE)) return null;
        const now = Math.floor(Date.now() / 1000);
        if (!Number.isFinite(claims.exp) || claims.exp <= now || !Number.isFinite(claims.iat) || claims.iat > now + 60) return null;
        if (claims.nbf !== undefined && (!Number.isFinite(claims.nbf) || claims.nbf > now + 60)) return null;
        if (typeof claims.sub !== "string" || !claims.sub || typeof claims.email !== "string" || !claims.email.includes("@")) return null;
        const jwk = (await keys()).find(key => key.kid === header.kid);
        if (!jwk) return null;
        const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
        if (!await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, decode(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]))) return null;
        const email = claims.email.toLowerCase();
        return { subject: claims.sub, email, permissions: email === OWNER_EMAIL ? OWNER_PERMISSIONS : [], expiresAt: claims.exp };
    } catch { return null; }
}

export async function authorizedIdentity(request: Request, permission: Permission) {
    const identity = await websiteIdentity(request);
    return identity?.permissions.includes(permission) ? identity : null;
}

export function safeReturnPath(value: string | null) {
    if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return "/account/";
    const url = new URL(value, "https://meansandmeasures.com");
    const allowed = ["/account", "/notary", "/api/notary", "/api/intake/export", "/api/kc-suggest/export"];
    return allowed.some(path => url.pathname === path || url.pathname.startsWith(path + "/")) ? url.pathname + url.search : "/account/";
}
