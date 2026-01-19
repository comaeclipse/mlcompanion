import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "Channel ID required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const channel = await prisma.channel.findUnique({
    where: { id },
    include: {
      _count: { select: { videos: true } },
    },
  });

  if (!channel) {
    return new Response(JSON.stringify({ error: "Channel not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(channel), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const PUT: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const { id } = context.params;
  if (!id) {
    return new Response(JSON.stringify({ error: "Channel ID required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const channel = await prisma.channel.findUnique({ where: { id } });
  if (!channel) {
    return new Response(JSON.stringify({ error: "Channel not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (channel.createdBy !== authResult.user.id) {
    return new Response(JSON.stringify({ error: "Not authorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await context.request.json();
  const {
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

  // Check for duplicate slug if changing
  if (slug && slug !== channel.slug) {
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
  }

  const updated = await prisma.channel.update({
    where: { id },
    data: {
      name: name || channel.name,
      slug: slug || channel.slug,
      url: url !== undefined ? url : channel.url,
      description: description !== undefined ? description : channel.description,
      thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : channel.thumbnailUrl,
      subscriberCount: subscriberCount !== undefined ? (subscriberCount ? parseInt(subscriberCount, 10) : null) : channel.subscriberCount,
      videoCount: videoCount !== undefined ? (videoCount ? parseInt(videoCount, 10) : null) : channel.videoCount,
      viewCount: viewCount !== undefined ? (viewCount ? parseInt(viewCount, 10) : null) : channel.viewCount,
      customUrl: customUrl !== undefined ? customUrl : channel.customUrl,
      country: country !== undefined ? country : channel.country,
      publishedAt: publishedAt !== undefined ? (publishedAt ? new Date(publishedAt) : null) : channel.publishedAt,
    },
  });

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const { id } = context.params;
  if (!id) {
    return new Response(JSON.stringify({ error: "Channel ID required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const channel = await prisma.channel.findUnique({ where: { id } });
  if (!channel) {
    return new Response(JSON.stringify({ error: "Channel not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (channel.createdBy !== authResult.user.id) {
    return new Response(JSON.stringify({ error: "Not authorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  await prisma.channel.delete({ where: { id } });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
