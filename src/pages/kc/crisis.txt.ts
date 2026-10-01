import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async () => {
    const services = await getCollection("kcServices", ({ data }) => data.emergency === true);

    const lines: string[] = [];
    lines.push("KANSAS CITY METRO — CRISIS NUMBERS");
    lines.push("Plain text. Save or print. Use any number on either side of the state line.");
    lines.push("");
    lines.push("IMMEDIATE DANGER: 911 (call or text — say where you are)");
    lines.push("");

    for (const entry of services) {
        lines.push(entry.data.name);
        if (entry.data.phone) lines.push(`  Phone: ${entry.data.phone}`);
        if (entry.data.sms) lines.push(`  Text:  ${entry.data.sms}`);
        if (entry.data.website) lines.push(`  Web:   ${entry.data.website}`);
        if (entry.data.address) lines.push(`  Where: ${entry.data.address}`);
        if (entry.data.hours) lines.push(`  Hours: ${entry.data.hours}`);
        if (entry.data.expect) lines.push(`  Note:  ${entry.data.expect}`);
        lines.push("");
    }

    lines.push("Full directory: https://meansandmeasures.com/kc/crisis");
    lines.push("");

    return new Response(lines.join("\n"), {
        headers: {
            "content-type": "text/plain; charset=utf-8"
        }
    });
};
