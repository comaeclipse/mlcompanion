import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";

export const GET: APIRoute = async ({ params }) => {
  const episode = await prisma.episode.findUnique({
    where: { id: params.id },
    include: {
      podcast: { select: { id: true, name: true, slug: true, thumbnailUrl: true, spotifyUrl: true, appleUrl: true } },
    },
  });

  if (!episode) {
    return new Response(JSON.stringify({ error: "Episode not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(episode), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const PUT: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const { params, request } = context;
  const body = await request.json();

  const existing = await prisma.episode.findUnique({ where: { id: params.id } });
  if (!existing) {
    return new Response(JSON.stringify({ error: "Episode not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (existing.createdBy !== authResult.user.id) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const episode = await prisma.episode.update({
    where: { id: params.id },
    data: {
      title: body.title,
      description: body.description,
      audioUrl: body.audioUrl,
      duration: body.duration,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      thumbnailUrl: body.thumbnailUrl,
      episodeNumber: body.episodeNumber,
      seasonNumber: body.seasonNumber,
      externalUrl: body.externalUrl,
      tags: body.tags,
      pros: body.pros,
      cons: body.cons,
      isPublished: body.isPublished,
    },
  });

  return new Response(JSON.stringify(episode), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const { params } = context;

  const existing = await prisma.episode.findUnique({ where: { id: params.id } });
  if (!existing) {
    return new Response(JSON.stringify({ error: "Episode not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (existing.createdBy !== authResult.user.id) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  await prisma.episode.update({
    where: { id: params.id },
    data: { isPublished: false },
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
