import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { buildKcMachine } from "../../lib/kcMachine";

export const prerender = true;

export const GET: APIRoute = async () => {
    const services = await getCollection("kcServices");
    const machine = buildKcMachine(services);

    return new Response(JSON.stringify({
        schema: "https://meansandmeasures.com/schemas/kc-journeys.v1.json",
        count: machine.publicJourneys.length,
        journeys: machine.publicJourneys
    }, null, 2), {
        headers: {
            "content-type": "application/json; charset=utf-8",
            "access-control-allow-origin": "*"
        }
    });
};
