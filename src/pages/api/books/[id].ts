import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";
import { cleanPurchaseLinks } from "../../../lib/book-utils";
import { isValidSourceType, isValidFunction, isValidDifficulty, isValidTradition } from "../../../lib/book-facets";

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

  const parsedGoodreadsRating = body.goodreadsRating === "" || body.goodreadsRating === undefined || body.goodreadsRating === null
    ? null
    : Number(body.goodreadsRating);
  if (parsedGoodreadsRating !== null && (Number.isNaN(parsedGoodreadsRating) || parsedGoodreadsRating < 0 || parsedGoodreadsRating > 5)) {
    return new Response(JSON.stringify({ error: "Goodreads rating must be a number between 0 and 5" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsedGoodreadsReviews = body.goodreadsReviews === "" || body.goodreadsReviews === undefined || body.goodreadsReviews === null
    ? null
    : Number(body.goodreadsReviews);
  if (parsedGoodreadsReviews !== null && (!Number.isFinite(parsedGoodreadsReviews) || parsedGoodreadsReviews < 0)) {
    return new Response(JSON.stringify({ error: "Goodreads reviews must be a non-negative number" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const normalizedExternalReviews = Array.isArray(body.externalReviews) ? body.externalReviews : null;

  // Validate facet fields
  if (body.sourceType && !isValidSourceType(body.sourceType)) {
    return new Response(JSON.stringify({ error: `Invalid sourceType: ${body.sourceType}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (body.functions && Array.isArray(body.functions)) {
    const invalidFunctions = body.functions.filter((f: string) => !isValidFunction(f));
    if (invalidFunctions.length > 0) {
      return new Response(JSON.stringify({ error: `Invalid function values: ${invalidFunctions.join(", ")}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (body.difficulty && !isValidDifficulty(body.difficulty)) {
    return new Response(JSON.stringify({ error: `Invalid difficulty: ${body.difficulty}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (body.traditions && Array.isArray(body.traditions)) {
    const invalidTraditions = body.traditions.filter((t: string) => !isValidTradition(t));
    if (invalidTraditions.length > 0) {
      return new Response(JSON.stringify({ error: `Invalid tradition values: ${invalidTraditions.join(", ")}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
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
      goodreadsRating: parsedGoodreadsRating,
      goodreadsReviews: parsedGoodreadsReviews !== null ? Math.floor(parsedGoodreadsReviews) : null,
      externalReviews: normalizedExternalReviews,
      sourceType: body.sourceType !== undefined ? body.sourceType : existing.sourceType,
      functions: body.functions !== undefined ? body.functions : existing.functions,
      difficulty: body.difficulty !== undefined ? body.difficulty : existing.difficulty,
      traditions: body.traditions !== undefined ? body.traditions : existing.traditions,
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
