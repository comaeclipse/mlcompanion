import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";
import { slugifyPodcastName } from "../../../lib/podcast-utils";

export const GET: APIRoute = async () => {
  const podcasts = await prisma.podcast.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { episodes: { where: { isPublished: true } } } },
    },
  });

  return new Response(JSON.stringify(podcasts), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const body = await context.request.json();
  const { name, description, thumbnailUrl, feedUrl, websiteUrl, spotifyUrl, appleUrl, soundcloudUrl, author, tags } = body;

  if (!name) {
    return new Response(JSON.stringify({ error: "Name is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const slug = slugifyPodcastName(name);

  const existing = await prisma.podcast.findUnique({ where: { slug } });
  if (existing) {
    return new Response(JSON.stringify({ error: "A podcast with this name already exists" }), {
      status: 409,
      headers: { "Content-Type": "application/json" },
    });
  }

  const podcast = await prisma.podcast.create({
    data: {
      name,
      slug,
      description: description || "",
      thumbnailUrl: thumbnailUrl || null,
      feedUrl: feedUrl || null,
      websiteUrl: websiteUrl || null,
      spotifyUrl: spotifyUrl || null,
      appleUrl: appleUrl || null,
      soundcloudUrl: soundcloudUrl || null,
      author: author || null,
      tags: tags || [],
      createdBy: authResult.user.id,
    },
  });

  return new Response(JSON.stringify(podcast), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
