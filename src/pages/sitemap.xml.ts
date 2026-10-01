import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async () => {
    const staticPaths = [
        "",
        "about",
        "capabilities",
        "systems",
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
        "kc/crisis.json",
        "kc/crisis.txt",
        "kc/data",
        "kc/directory",
        "kc/food",
        "kc/give-help",
        "kc/government",
        "kc/healthcare",
        "kc/housing",
        "kc/legal",
        "kc/libraries",
        "kc/local-knowledge",
        "kc/map",
        "kc/neighborhoods",
        "kc/newcomers",
        "kc/property",
        "kc/services.csv",
        "kc/services.json",
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

    const urls = [
        ...staticPaths,
        ...work.map((entry) => `work/${entry.id}`),
        ...research.map((entry) => `research/${entry.id}`),
        ...artifacts.map((entry) => `artifacts/${entry.id}`)
    ].map((path) => `https://meansandmeasures.com/${path}`);

    return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n") +
        `\n</urlset>\n`,
        {
            headers: {
                "content-type": "application/xml"
            }
        }
    );
};
