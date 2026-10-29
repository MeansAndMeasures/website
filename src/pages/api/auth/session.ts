import type { APIRoute } from "astro";
import { websiteIdentity } from "../../../lib/websiteAuth";
export const prerender = false;
export const GET: APIRoute = async ({ request }) => {
    const identity = await websiteIdentity(request);
    return Response.json(identity ? { authenticated: true, ...identity } : { authenticated: false }, {
        status: identity ? 200 : 401,
        headers: { "cache-control": "no-store", "vary": "Cookie, Cf-Access-Jwt-Assertion" }
    });
};
