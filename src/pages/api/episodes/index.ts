import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";

export const GET: APIRoute = async ({ url }) => {
  const podcastId = url.searchParams.get("podcastId");

  const where: any = { isPublished: true };
  if (podcastId) {
    where.podcastId = podcastId;
  }

  const episodes = await prisma.episode.findMany({
    where,
    orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
    include: {
      podcast: { select: { id: true, name: true, slug: true, thumbnailUrl: true } },
    },
  });

  return new Response(JSON.stringify(episodes), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const body = await context.request.json();
  const { title, description, audioUrl, duration, publishedAt, thumbnailUrl, episodeNumber, seasonNumber, externalUrl, tags, pros, cons, podcastId } = body;

  if (!title || !podcastId) {
    return new Response(JSON.stringify({ error: "Title and podcast are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const podcast = await prisma.podcast.findUnique({ where: { id: podcastId } });
  if (!podcast) {
    return new Response(JSON.stringify({ error: "Podcast not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const episode = await prisma.episode.create({
    data: {
      title,
      description: description || "",
      audioUrl: audioUrl || null,
      duration: duration || null,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      thumbnailUrl: thumbnailUrl || null,
      episodeNumber: episodeNumber || null,
      seasonNumber: seasonNumber || null,
      externalUrl: externalUrl || null,
      tags: tags || [],
      pros: pros || [],
      cons: cons || [],
      podcastId,
      createdBy: authResult.user.id,
    },
  });

  return new Response(JSON.stringify(episode), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
