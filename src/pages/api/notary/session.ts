import type { APIRoute } from "astro";

export const prerender = false;

// Compatibility entry: journal and API now share the website Access application.
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
