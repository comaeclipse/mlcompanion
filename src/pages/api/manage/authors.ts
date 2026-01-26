import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";

export const GET: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const url = new URL(context.request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  const [authors, total] = await Promise.all([
    prisma.author.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { books: true } }
      },
      skip,
      take: limit,
    }),
    prisma.author.count(),
  ]);

  return new Response(JSON.stringify({
    authors,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

