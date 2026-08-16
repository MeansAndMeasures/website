import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { publicServiceData } from "../../lib/servicePresentation";
import { buildKcMachine, publicMachineFields } from "../../lib/kcMachine";

export const prerender = true;

export const GET: APIRoute = async () => {
    const allServices = await getCollection("kcServices");
    const services = allServices.filter(({ data }) => data.emergency === true);
    const machine = buildKcMachine(allServices);

    const payload = {
        schema: "https://civicbrands.org/schemas/kc-services.v2.json",
        license: "Free to use, redistribute, and mirror.",
        count: services.length,
        services: services.map((entry) => ({
            slug: entry.id,
            ...publicServiceData(entry.data as Record<string, unknown>),
            ...publicMachineFields(machine, entry.id)
        }))
    };

    return new Response(JSON.stringify(payload, null, 2), {
        headers: {
            "content-type": "application/json; charset=utf-8"
        }
    });
};
