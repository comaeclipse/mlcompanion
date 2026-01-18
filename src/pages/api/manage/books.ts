import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";

export const GET: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const books = await prisma.book.findMany({
    where: {
      createdBy: authResult.user.id,
      isPublished: true,
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return new Response(JSON.stringify(books), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
