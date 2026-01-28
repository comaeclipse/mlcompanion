import type { APIRoute } from "astro";
import { requireAuth } from "../../../lib/auth-utils";
import { prisma } from "../../../lib/prisma";
import { parseEpisodeUrl } from "../../../lib/episode-utils";

/**
 * POST /api/episodes/create-from-url
 * Creates a minimal episode record from a Spotify/Apple Podcasts URL
 * Body: { externalUrl: string, podcastName?: string }
 */
export const POST: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { externalUrl, podcastName } = body;

  if (!externalUrl || typeof externalUrl !== "string") {
    return new Response(JSON.stringify({ error: "External URL is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate URL format
  const embedInfo = parseEpisodeUrl(externalUrl);
  if (!embedInfo) {
    return new Response(
      JSON.stringify({ error: "Invalid Spotify or Apple Podcasts URL" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Check if episode with this URL already exists
    const existingEpisode = await prisma.episode.findFirst({
      where: { externalUrl },
      include: {
        podcast: {
          select: {
            id: true,
            name: true,
            slug: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    if (existingEpisode) {
      return new Response(
        JSON.stringify({ episode: existingEpisode }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Find or create a generic podcast for external links
    const genericPodcastName = podcastName || "External Podcast";
    const genericPodcastSlug = genericPodcastName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    let podcast = await prisma.podcast.findFirst({
      where: { slug: genericPodcastSlug },
    });

    if (!podcast) {
      podcast = await prisma.podcast.create({
        data: {
          name: genericPodcastName,
          slug: genericPodcastSlug,
          description: "External podcast episodes",
          isPublished: true,
          createdBy: authResult.user.id,
        },
      });
    }

    // Create episode with minimal data
    const episode = await prisma.episode.create({
      data: {
        title: `Episode from ${embedInfo.type === "spotify" ? "Spotify" : "Apple Podcasts"}`,
        description: `Listen on ${embedInfo.type === "spotify" ? "Spotify" : "Apple Podcasts"}`,
        externalUrl,
        podcastId: podcast.id,
        isPublished: true,
        createdBy: authResult.user.id,
      },
      include: {
        podcast: {
          select: {
            id: true,
            name: true,
            slug: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({ episode }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating episode from URL:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create episode" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
