import type { APIRoute } from "astro";
import { guideSectionsById } from "../../../lib/guide-content";
import { getGuideRelatedResources } from "../../../lib/guide-related";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const step = url.searchParams.get("step");

  if (!step) {
    return new Response(JSON.stringify({ error: "Missing step parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const section = guideSectionsById.get(step);
  if (!section) {
    return new Response(JSON.stringify({ error: "Unknown step" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const related = await getGuideRelatedResources(section.related);

  return new Response(JSON.stringify(related), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
};
