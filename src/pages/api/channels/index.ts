import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";

export const GET: APIRoute = async () => {
  const channels = await prisma.channel.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { videos: true } },
    },
  });

  return new Response(JSON.stringify(channels), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const body = await context.request.json();
  const {
    channelId,
    name,
    slug,
    url,
    description,
    thumbnailUrl,
    subscriberCount,
    videoCount,
    viewCount,
    customUrl,
    country,
    publishedAt,
  } = body;

  if (!channelId || !name || !slug) {
    return new Response(
      JSON.stringify({ error: "Channel ID, name, and slug are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Check for duplicate channelId
  const existing = await prisma.channel.findUnique({
    where: { channelId },
  });
  if (existing) {
    return new Response(
      JSON.stringify({ error: "Channel with this ID already exists" }),
      {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Check for duplicate slug
  const existingSlug = await prisma.channel.findUnique({
    where: { slug },
  });
  if (existingSlug) {
    return new Response(
      JSON.stringify({ error: "Channel with this slug already exists" }),
      {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const channel = await prisma.channel.create({
    data: {
      channelId,
      name,
      slug,
      url: url || null,
      description: description || null,
      thumbnailUrl: thumbnailUrl || null,
      subscriberCount: subscriberCount ? parseInt(subscriberCount, 10) : null,
      videoCount: videoCount ? parseInt(videoCount, 10) : null,
      viewCount: viewCount ? parseInt(viewCount, 10) : null,
      customUrl: customUrl || null,
      country: country || null,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      createdBy: authResult.user.id,
    },
  });

  return new Response(JSON.stringify(channel), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
