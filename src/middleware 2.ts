import type { MiddlewareHandler } from "astro";
import {
  jsonHeaders,
  markdownHeaders,
  negotiateRepresentation,
  resolveResource,
  serializeHtmlResponseAsMarkdown,
  serializeResourceAsJson,
  serializeResourceAsMarkdown,
} from "./lib/representations";

const SKIP_PREFIXES = [
  "/_astro/",
  "/api/",
  "/.well-known/",
];

const SKIP_EXACT = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/kc-sw.js",
]);

const SKIP_EXTENSIONS = [
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".csv",
  ".txt",
  ".xml",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webp",
  ".ico",
  ".woff",
  ".woff2",
];

function shouldSkip(pathname: string): boolean {
  if (SKIP_EXACT.has(pathname)) return true;
  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  if (SKIP_EXTENSIONS.some((extension) => pathname.endsWith(extension))) return true;

  return false;
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request, url } = context;

  if (request.method !== "GET" && request.method !== "HEAD") {
    return next();
  }

  if (shouldSkip(url.pathname)) {
    return next();
  }

  const representation = negotiateRepresentation(request.headers.get("accept"));

  if (representation === "html") {
    return next();
  }

  const resource = await resolveResource(url.pathname);

  if (resource && representation === "json") {
    return new Response(serializeResourceAsJson(resource), {
      headers: jsonHeaders,
    });
  }

  if (resource && representation === "markdown") {
    const markdown = serializeResourceAsMarkdown(resource);

    return new Response(markdown, {
      headers: markdownHeaders(markdown),
    });
  }

  if (representation === "markdown") {
    const response = await next();
    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.toLowerCase().includes("text/html")) {
      return response;
    }

    return serializeHtmlResponseAsMarkdown(response);
  }

  return next();
};
