import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";

export const GET: APIRoute = async ({ params }) => {
  const video = await prisma.video.findUnique({
    where: { id: params.id },
    include: {
      creator: { select: { name: true } },
      linkedBooks: {
        include: {
          book: {
            select: { id: true, title: true, authors: true, thumbnailUrl: true, isbn13: true },
          },
        },
      },
    },
  });

  if (!video) {
    return new Response(JSON.stringify({ error: "Video not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(video), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const PUT: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const { params, request } = context;
  const body = await request.json();

  const existing = await prisma.video.findUnique({ where: { id: params.id } });
  if (!existing) {
    return new Response(JSON.stringify({ error: "Video not found" }), {
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

  const video = await prisma.video.update({
    where: { id: params.id },
    data: {
      title: body.title,
      description: body.description,
      url: body.url,
      thumbnailUrl: body.thumbnailUrl,
      channelName: body.channelName,
      channelId: body.channelId !== undefined ? body.channelId : undefined,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      tags: body.tags,
      category: body.category,
      duration: body.duration,
      isPublished: body.isPublished,
    },
  });

  // Update linked books if bookIds provided
  if (Array.isArray(body.bookIds)) {
    await prisma.videoBook.deleteMany({ where: { videoId: video.id } });
    if (body.bookIds.length > 0) {
      await prisma.videoBook.createMany({
        data: body.bookIds.map((bookId: string) => ({
          videoId: video.id,
          bookId,
        })),
      });
    }
  }

  return new Response(JSON.stringify(video), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const { params } = context;
  const existing = await prisma.video.findUnique({ where: { id: params.id } });

  if (!existing) {
    return new Response(JSON.stringify({ error: "Video not found" }), {
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

  await prisma.video.update({
    where: { id: params.id },
    data: { isPublished: false },
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
