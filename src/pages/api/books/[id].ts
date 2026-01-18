import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";
import { cleanPurchaseLinks } from "../../../lib/book-utils";

export const GET: APIRoute = async ({ params }) => {
  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: { creator: { select: { name: true } } },
  });

  if (!book) {
    return new Response(JSON.stringify({ error: "Book not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(book), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const PUT: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const { params, request } = context;
  const body = await request.json();

  const existing = await prisma.book.findUnique({ where: { id: params.id } });
  if (!existing) {
    return new Response(JSON.stringify({ error: "Book not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (existing.createdBy !== authResult.user.id) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const book = await prisma.book.update({
    where: { id: params.id },
    data: {
      title: body.title,
      description: body.description,
      isbn: body.isbn,
      isbn13: body.isbn13,
      authors: body.authors,
      publisher: body.publisher,
      publishedDate: body.publishedDate,
      thumbnailUrl: body.thumbnailUrl,
      pageCount: body.pageCount ? parseInt(body.pageCount) : null,
      categories: body.categories,
      language: body.language,
      previewLink: body.previewLink,
      infoLink: body.infoLink,
      tags: body.tags,
      readFreeLinks: body.readFreeLinks || [],
      purchaseLinks: body.purchaseLinks ? cleanPurchaseLinks(body.purchaseLinks) : null,
      isPublished: body.isPublished,
    },
  });

  return new Response(JSON.stringify(book), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const { params } = context;
  const existing = await prisma.book.findUnique({ where: { id: params.id } });

  if (!existing) {
    return new Response(JSON.stringify({ error: "Book not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (existing.createdBy !== authResult.user.id) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  await prisma.book.update({
    where: { id: params.id },
    data: { isPublished: false },
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
