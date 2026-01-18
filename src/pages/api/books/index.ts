import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";
import { parseISBN, validateISBN, validateReadFreeLinks, validatePurchaseLinks, cleanPurchaseLinks } from "../../../lib/book-utils";

export const GET: APIRoute = async () => {
  const books = await prisma.book.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { creator: { select: { name: true } } },
  });

  return new Response(JSON.stringify(books), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const body = await context.request.json();
  const {
    title,
    description,
    isbn,
    isbn13,
    authors,
    publisher,
    publishedDate,
    thumbnailUrl,
    pageCount,
    categories,
    language,
    previewLink,
    infoLink,
    tags,
    readFreeLinks,
    purchaseLinks,
  } = body;

  if (!title) {
    return new Response(JSON.stringify({ error: "Title is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate ISBN if provided
  if (isbn && !validateISBN(isbn)) {
    return new Response(JSON.stringify({ error: "Invalid ISBN format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (isbn13 && !validateISBN(isbn13)) {
    return new Response(JSON.stringify({ error: "Invalid ISBN-13 format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check for duplicate ISBN
  if (isbn13) {
    const existing = await prisma.book.findFirst({
      where: { isbn13, isPublished: true },
    });
    if (existing) {
      return new Response(
        JSON.stringify({ error: "This book (ISBN-13) has already been added" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Validate read free links
  if (readFreeLinks) {
    const validation = validateReadFreeLinks(readFreeLinks);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Validate and clean purchase links
  const cleanedPurchaseLinks = purchaseLinks ? cleanPurchaseLinks(purchaseLinks) : null;
  if (purchaseLinks) {
    const validation = validatePurchaseLinks(purchaseLinks);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const book = await prisma.book.create({
    data: {
      title,
      description: description || "",
      isbn,
      isbn13,
      authors: authors || [],
      publisher,
      publishedDate,
      thumbnailUrl,
      pageCount: pageCount ? parseInt(pageCount) : null,
      categories: categories || [],
      language,
      previewLink,
      infoLink,
      tags: tags || [],
      readFreeLinks: readFreeLinks || [],
      purchaseLinks: cleanedPurchaseLinks,
      createdBy: authResult.user.id,
    },
  });

  return new Response(JSON.stringify(book), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
