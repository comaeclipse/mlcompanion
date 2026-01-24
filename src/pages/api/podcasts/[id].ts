import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";

export const GET: APIRoute = async ({ params }) => {
  const podcast = await prisma.podcast.findUnique({
    where: { id: params.id },
    include: {
      episodes: {
        where: { isPublished: true },
        orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
      },
    },
  });

  if (!podcast) {
    return new Response(JSON.stringify({ error: "Podcast not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(podcast), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const PUT: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const { params, request } = context;
  const body = await request.json();

  const existing = await prisma.podcast.findUnique({ where: { id: params.id } });
  if (!existing) {
    return new Response(JSON.stringify({ error: "Podcast not found" }), {
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

  const podcast = await prisma.podcast.update({
    where: { id: params.id },
    data: {
      name: body.name,
      description: body.description,
      thumbnailUrl: body.thumbnailUrl,
      feedUrl: body.feedUrl,
      websiteUrl: body.websiteUrl,
      spotifyUrl: body.spotifyUrl,
      appleUrl: body.appleUrl,
      soundcloudUrl: body.soundcloudUrl,
      author: body.author,
      tags: body.tags,
      isPublished: body.isPublished,
    },
  });

  return new Response(JSON.stringify(podcast), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const { params } = context;

  const existing = await prisma.podcast.findUnique({ where: { id: params.id } });
  if (!existing) {
    return new Response(JSON.stringify({ error: "Podcast not found" }), {
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

  await prisma.podcast.update({
    where: { id: params.id },
    data: { isPublished: false },
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
