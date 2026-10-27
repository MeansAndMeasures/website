import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { kcJourneys } from "../data/kcMachine";

export const prerender = true;

export const GET: APIRoute = async () => {
    const staticPaths = [
        "",
        "about",
        "capabilities",
        "systems",
        "civicnavigator",
        "work",
        "research",
        "artifacts",
        "brand",
        "procurement",
        "contact",
        "updates",
        "status",
        "sitemap",
        "privacy",
        "terms",
        "legal",
        "kc",
        "kc/about",
        "kc/crisis",
        "kc/data",
        "kc/directory",
        "kc/food",
        "kc/give-help",
        "kc/government",
        "kc/healthcare",
        "kc/housing",
        "kc/journeys",
        "kc/legal",
        "kc/libraries",
        "kc/local-knowledge",
        "kc/map",
        "kc/neighborhoods",
        "kc/newcomers",
        "kc/property",
        "kc/taxes",
        "kc/transit",
        "kc/utilities",
        "kc/use-the-data",
        "kc/veterans",
        "kc/worldcup",
        "es/kc/crisis",
        "es/kc/food",
        "es/kc/healthcare",
        "es/kc/housing",
        "es/kc/legal",
        "es/kc/newcomers",
        "es/kc/worldcup"
    ];

    const [work, research, artifacts] = await Promise.all([
        getCollection("work"),
        getCollection("research"),
        getCollection("artifacts")
    ]);

    const origin = "https://meansandmeasures.com";
    const translatedPages = [
        "crisis", "food", "healthcare", "housing", "legal", "newcomers", "worldcup"
    ];
    const alternates = new Map<string, { en: string; es: string }>();
    for (const page of translatedPages) {
        const pair = { en: `${origin}/kc/${page}`, es: `${origin}/es/kc/${page}` };
        alternates.set(pair.en, pair);
        alternates.set(pair.es, pair);
    }
    const escapeXml = (value: string) => value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");

    const urls = [...new Set([
        ...staticPaths,
        ...kcJourneys.map((journey) => `kc/journeys/${journey.id}`),
        ...work.map((entry) => `work/${entry.id}`),
        ...research.map((entry) => `research/${entry.id}`),
        ...artifacts.map((entry) => `artifacts/${entry.id}`)
    ].map((path) => `${origin}/${path}`))];

    return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
        urls.map((url) => {
            const pair = alternates.get(url);
            const links = pair ? Object.entries(pair).map(([language, href]) =>
                `<xhtml:link rel="alternate" hreflang="${language}" href="${escapeXml(href)}" />`
            ).join("") : "";
            return `  <url><loc>${escapeXml(url)}</loc>${links}</url>`;
        }).join("\n") +
        `\n</urlset>\n`,
        {
            headers: {
                "content-type": "application/xml"
            }
        }
    );
};
