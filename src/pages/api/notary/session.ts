import type { APIRoute } from "astro";

export const prerender = false;

// Cloudflare Access protects this entire API prefix. Navigating here establishes
// the API application's session before the browser opens the separate UI app.
// This route reads no journal data and creates no signing/encryption identity.
export const GET: APIRoute = ({ request }) => {
    const origin = new URL(request.url).origin;
    const trusted = new Set(["https://meansandmeasures.com", "https://www.meansandmeasures.com"]);
    return new Response(null, {
        status: 303,
        headers: {
            location: `${trusted.has(origin) ? origin : "https://meansandmeasures.com"}/notary/`,
            "cache-control": "no-store"
        }
    });
};
