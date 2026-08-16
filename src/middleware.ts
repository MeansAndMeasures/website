import { defineMiddleware } from "astro:middleware";
import { NodeHtmlMarkdown } from "node-html-markdown";

const htmlToMarkdown = new NodeHtmlMarkdown({
  bulletMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "_",
  strongDelimiter: "**"
});

const DISCOVERY_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</api/resources.json>; rel="collection"',
  '</.well-known/agent-skills/index.json>; rel="service-desc"',
  '</.well-known/mcp/server-card.json>; rel="service-desc"'
];

function wantsMarkdown(request: Request) {
  return (request.headers.get("accept") ?? "")
    .toLowerCase()
    .includes("text/markdown");
}

function tokenCount(markdown: string) {
  return String(markdown.split(/\s+/).filter(Boolean).length);
}

function stripHtmlNoise(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "");
}

function addDiscoveryHeaders(headers: Headers) {
  for (const link of DISCOVERY_LINKS) {
    headers.append("Link", link);
  }

  headers.append("Vary", "Accept");
}

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const headers = new Headers(response.headers);

  addDiscoveryHeaders(headers);

  if (!wantsMarkdown(context.request)) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  const contentType = headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("text/html")) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  if (context.request.method === "HEAD") {
    headers.set("Content-Type", "text/markdown; charset=utf-8");
    headers.set("X-Markdown-Tokens", "0");
    headers.delete("Content-Length");

    return new Response(null, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  const html = await response.text();
  const markdown = htmlToMarkdown.translate(stripHtmlNoise(html)).trim() + "\n";

  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set("X-Markdown-Tokens", tokenCount(markdown));
  headers.delete("Content-Length");
  headers.delete("Content-Security-Policy");

  return new Response(markdown, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
});
