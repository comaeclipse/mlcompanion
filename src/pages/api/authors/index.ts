import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";

export const GET: APIRoute = async () => {
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

export const POST: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const body = await context.request.json();
  const { name, bio, photoUrl, slug } = body;

  if (!name || !slug) {
    return new Response(
      JSON.stringify({ error: "Name and slug are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const existing = await prisma.author.findUnique({ where: { slug } });
  if (existing) {
    return new Response(
      JSON.stringify({ error: "An author with this slug already exists" }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  const author = await prisma.author.create({
    data: {
      name,
      slug,
      bio: bio || null,
      photoUrl: photoUrl || null,
      createdBy: authResult.user.id,
    },
  });

  return new Response(JSON.stringify(author), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
