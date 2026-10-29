import type { APIRoute } from "astro";
import { safeReturnPath } from "../../lib/websiteAuth";
export const prerender = false;
export const GET: APIRoute = ({ request }) => new Response(null, {
    status: 303,
    headers: { location: safeReturnPath(new URL(request.url).searchParams.get("returnTo")), "cache-control": "no-store" }
});
