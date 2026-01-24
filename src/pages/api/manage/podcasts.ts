import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";

export const GET: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const podcasts = await prisma.podcast.findMany({
    where: {
      createdBy: authResult.user.id,
      isPublished: true,
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { episodes: true } },
      episodes: {
        where: { isPublished: true },
        orderBy: [{ order: "asc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          publishedAt: true,
          episodeNumber: true,
          seasonNumber: true,
          audioUrl: true,
          externalUrl: true,
          tags: true,
          pros: true,
          cons: true,
        },
      },
    },
  });

  return new Response(JSON.stringify(podcasts), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
