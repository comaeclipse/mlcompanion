import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";

export const GET: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  // Show all authors (global editing model)
  const authors = await prisma.author.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { books: true } }
    }
  });

  return new Response(JSON.stringify(authors), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
