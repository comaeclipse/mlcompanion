import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";

export const GET: APIRoute = async ({ params }) => {
  const author = await prisma.author.findUnique({
    where: { id: params.id },
    include: {
      books: {
        include: { book: { where: { isPublished: true } } },
        orderBy: { order: "asc" }
      },
      _count: { select: { books: true } }
    }
  });

  if (!author) {
    return new Response(JSON.stringify({ error: "Author not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(author), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const PUT: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const { params, request } = context;
  const body = await request.json();

  const existing = await prisma.author.findUnique({ where: { id: params.id } });
  if (!existing) {
    return new Response(JSON.stringify({ error: "Author not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Global editing: any authenticated user can edit
  const author = await prisma.author.update({
    where: { id: params.id },
    data: {
      name: body.name,
      slug: body.slug,
      bio: body.bio || null,
      photoUrl: body.photoUrl || null,
    },
  });

  return new Response(JSON.stringify(author), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const { params } = context;
  const existing = await prisma.author.findUnique({
    where: { id: params.id },
    include: { _count: { select: { books: true } } }
  });

  if (!existing) {
    return new Response(JSON.stringify({ error: "Author not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (existing._count.books > 0) {
    return new Response(
      JSON.stringify({
        error: `Cannot delete author with ${existing._count.books} book(s). Remove all books first.`
      }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  await prisma.author.delete({ where: { id: params.id } });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
