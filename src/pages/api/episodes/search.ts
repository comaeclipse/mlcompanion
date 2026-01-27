import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const episodes = await prisma.episode.findMany({
    where: {
      isPublished: true,
      title: { contains: query, mode: "insensitive" },
    },
    select: {
      id: true,
      title: true,
      description: true,
      externalUrl: true,
      thumbnailUrl: true,
      duration: true,
      publishedAt: true,
      podcast: {
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnailUrl: true,
        },
      },
    },
    take: 10,
    orderBy: { publishedAt: "desc" },
  });

  return new Response(JSON.stringify(episodes), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
