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

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where: {
        createdBy: authResult.user.id,
        isPublished: true,
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.book.count({
      where: {
        createdBy: authResult.user.id,
        isPublished: true,
      },
    }),
  ]);

  return new Response(JSON.stringify({
    books,
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

