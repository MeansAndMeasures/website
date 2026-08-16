import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { publicServiceData } from "../../lib/servicePresentation";
import { buildKcMachine, publicMachineFields } from "../../lib/kcMachine";

export const prerender = true;

function csvEscape(value: unknown): string {
    if (value === null || value === undefined) return "";
    const str = Array.isArray(value)
        ? value.map((item) => typeof item === "object" ? JSON.stringify(item) : String(item)).join("; ")
        : typeof value === "object"
            ? JSON.stringify(value)
            : String(value);
    if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export const GET: APIRoute = async () => {
    const services = await getCollection("kcServices");
    const machine = buildKcMachine(services);

    const columns = [
        "slug", "name", "categories", "phone", "sms", "website", "address",
        "hours", "hours24", "languages", "states", "counties",
        "immigrationDocumentsRequired", "eligibility", "expect", "practicalNotes",
        "walkIn", "appointmentRequired",
        "idRequired", "insuranceRequired", "veteranOnly", "petsAllowed",
        "reachableWithoutCar", "nearestBusRoute", "emergency", "relatedServices", "journeys"
    ];

    const lines = [columns.join(",")];

    for (const entry of services) {
        const publicData = {
            ...publicServiceData(entry.data as Record<string, unknown>),
            ...publicMachineFields(machine, entry.id)
        };
        const row = columns.map((col) => {
            if (col === "slug") return csvEscape(entry.id);
            return csvEscape(publicData[col]);
        });
        lines.push(row.join(","));
    }

    const csv = lines.join("\n") + "\n";

    return new Response(csv, {
        headers: {
            "content-type": "text/csv; charset=utf-8",
            "access-control-allow-origin": "*",
            "content-disposition": "inline; filename=\"kc-services.csv\""
        }
    });
};
