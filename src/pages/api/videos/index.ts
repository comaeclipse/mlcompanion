import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";
import { validateVideoUrl, parseYouTubeUrl, getYouTubeThumbnail } from "../../../lib/video-utils";

export const GET: APIRoute = async () => {
  const videos = await prisma.video.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { creator: { select: { name: true } } },
  });

  return new Response(JSON.stringify(videos), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const body = await context.request.json();
  const { title, description, url, tags, category, duration, channelName, publishedAt, thumbnailUrl: providedThumbnail } = body;

  if (!title || !url) {
    return new Response(JSON.stringify({ error: "Title and URL required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!validateVideoUrl(url)) {
    return new Response(JSON.stringify({ error: "Invalid video URL" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check for duplicate URL
  const existing = await prisma.video.findFirst({
    where: { url, isPublished: true },
  });
  if (existing) {
    return new Response(JSON.stringify({ error: "This video has already been added" }), {
      status: 409,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Use provided thumbnail from metadata API, or fallback to generating one
  let thumbnailUrl = providedThumbnail;
  if (!thumbnailUrl) {
    const youtubeId = parseYouTubeUrl(url);
    if (youtubeId) {
      thumbnailUrl = getYouTubeThumbnail(youtubeId);
    }
  }

  const video = await prisma.video.create({
    data: {
      title,
      description: description || "",
      url,
      thumbnailUrl,
      channelName,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      tags: tags || [],
      category,
      duration,
      createdBy: authResult.user.id,
    },
  });

  return new Response(JSON.stringify(video), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
