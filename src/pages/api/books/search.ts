import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const books = await prisma.book.findMany({
    where: {
      isPublished: true,
      title: { contains: query, mode: "insensitive" },
    },
    select: {
      id: true,
      title: true,
      authors: true,
      thumbnailUrl: true,
    },
    take: 10,
    orderBy: { title: "asc" },
  });

  return new Response(JSON.stringify(books), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
