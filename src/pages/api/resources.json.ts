import { getResourceGraph } from "../../lib/resourceGraph";

export async function GET() {
  const graph = await getResourceGraph();

  return new Response(JSON.stringify(graph, null, 2) + "\n", {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
}
