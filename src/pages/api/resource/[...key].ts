export const prerender = false;
import {
  chooseRepresentation,
  getResourceGraph,
  resourceToJson,
  resourceToMarkdown
} from "../../../lib/resourceGraph";

export async function GET({
  params,
  request
}: {
  params: { key?: string };
  request: Request;
}) {
  const graph = await getResourceGraph();
  const key = params.key ?? "";
  const resource = graph.byKey[key];

  if (!resource) {
    return new Response(
      JSON.stringify({ error: "not_found", key }, null, 2) + "\n",
      {
        status: 404,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );
  }

  const representation = chooseRepresentation(request.headers.get("accept"));

  if (representation === "markdown") {
    const markdown = resourceToMarkdown(resource);
    const tokens = markdown.split(/\s+/).filter(Boolean).length;

    return new Response(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Vary": "Accept",
        "X-Markdown-Tokens": String(tokens),
        "Link": `<${resource.url}>; rel="canonical", </api/resources.json>; rel="collection"`
      }
    });
  }

  return new Response(resourceToJson(resource), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Vary": "Accept",
      "Link": `<${resource.url}>; rel="canonical", </api/resources.json>; rel="collection"`
    }
  });
}
