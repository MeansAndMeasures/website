import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { staticEntries, type FinderEntry } from "../data/finder";

export const prerender = true;

// The finder index: hand-kept routes plus everything in the content
// collections, so new work, research and records become
// findable without touching the finder.
export const GET: APIRoute = async () => {
    const [work, research, artifacts] = await Promise.all([
        getCollection("work"),
        getCollection("research"),
        getCollection("artifacts")
    ]);

    const entries: FinderEntry[] = [
        ...staticEntries,
        ...work.map((entry) => ({
            href: `/work/${entry.id}`,
            label: entry.data.title,
            note: entry.data.summary,
            kind: "work" as const,
            keywords: entry.data.tags.join(" ")
        })),
        ...research.map((entry) => ({
            href: `/research/${entry.id}`,
            label: entry.data.title,
            note: entry.data.summary,
            kind: "research" as const,
            keywords: entry.data.tags.join(" ")
        })),
        ...artifacts.map((entry) => ({
            href: `/artifacts/${entry.id}`,
            label: entry.data.title,
            note: entry.data.summary,
            kind: "record" as const,
            keywords: [entry.data.artifactType, entry.data.agency, entry.data.docket, ...entry.data.tags]
                .filter(Boolean)
                .join(" ")
        }))
    ];

    return new Response(JSON.stringify({ version: 1, count: entries.length, entries }), {
        headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "public, max-age=3600"
        }
    });
};
