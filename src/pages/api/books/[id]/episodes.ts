import type { APIRoute } from "astro";
import { requireAuth } from "../../../../lib/auth-utils";
import { prisma } from "../../../../lib/prisma";

/**
 * GET /api/books/:id/episodes - Get linked episodes for a book
 */
export const GET: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const { id } = context.params;

  if (!id) {
    return new Response(JSON.stringify({ error: "Book ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const book = await prisma.book.findUnique({
      where: { id },
      select: {
        id: true,
        createdBy: true,
        linkedEpisodes: {
          include: {
            episode: {
              select: {
                id: true,
                title: true,
                description: true,
                externalUrl: true,
                thumbnailUrl: true,
                duration: true,
                publishedAt: true,
                podcast: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    thumbnailUrl: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!book) {
      return new Response(JSON.stringify({ error: "Book not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check ownership
    if (book.createdBy !== authResult.user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        linkedEpisodes: book.linkedEpisodes.map((le) => ({
          id: le.id,
          episode: le.episode,
        })),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching linked episodes:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch linked episodes" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * POST /api/books/:id/episodes - Link an episode to a book
 * Body: { episodeId: string }
 */
export const POST: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const { id: bookId } = context.params;

  if (!bookId) {
    return new Response(JSON.stringify({ error: "Book ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { episodeId } = body;

  if (!episodeId || typeof episodeId !== "string") {
    return new Response(JSON.stringify({ error: "Episode ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Check book exists and user owns it
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, createdBy: true },
    });

    if (!book) {
      return new Response(JSON.stringify({ error: "Book not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (book.createdBy !== authResult.user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check episode exists
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId, isPublished: true },
      select: { id: true },
    });

    if (!episode) {
      return new Response(JSON.stringify({ error: "Episode not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create link (upsert to handle duplicates)
    const link = await prisma.bookEpisode.upsert({
      where: {
        bookId_episodeId: {
          bookId,
          episodeId,
        },
      },
      create: {
        bookId,
        episodeId,
      },
      update: {},
    });

    return new Response(JSON.stringify({ success: true, link }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error linking episode:", error);
    return new Response(
      JSON.stringify({ error: "Failed to link episode" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * DELETE /api/books/:id/episodes?episodeId=xxx - Unlink an episode from a book
 */
export const DELETE: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const { id: bookId } = context.params;
  const episodeId = context.url.searchParams.get("episodeId");

  if (!bookId) {
    return new Response(JSON.stringify({ error: "Book ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!episodeId) {
    return new Response(JSON.stringify({ error: "Episode ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Check book exists and user owns it
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, createdBy: true },
    });

    if (!book) {
      return new Response(JSON.stringify({ error: "Book not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (book.createdBy !== authResult.user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete link
    await prisma.bookEpisode.deleteMany({
      where: {
        bookId,
        episodeId,
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error unlinking episode:", error);
    return new Response(
      JSON.stringify({ error: "Failed to unlink episode" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
