import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";
import { parseISBN, validateISBN, validateReadFreeLinks, validatePurchaseLinks, cleanPurchaseLinks } from "../../../lib/book-utils";
import { isValidSourceType, isValidFunction, isValidDifficulty, isValidTradition } from "../../../lib/book-facets";

export const GET: APIRoute = async ({ url }) => {
  // Parse query parameters for facet filtering
  const sourceType = url.searchParams.get("sourceType");
  const functionsParam = url.searchParams.getAll("function");
  const difficulty = url.searchParams.get("difficulty");
  const traditionsParam = url.searchParams.getAll("tradition");

  // Build where clause
  const where: any = { isPublished: true };

  // Validate and apply sourceType filter
  if (sourceType) {
    if (!isValidSourceType(sourceType)) {
      return new Response(JSON.stringify({ error: `Invalid sourceType: ${sourceType}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    where.sourceType = sourceType;
  }

  // Validate and apply functions filter (array - OR logic within functions)
  if (functionsParam.length > 0) {
    const invalidFunctions = functionsParam.filter(f => !isValidFunction(f));
    if (invalidFunctions.length > 0) {
      return new Response(JSON.stringify({ error: `Invalid function values: ${invalidFunctions.join(", ")}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    where.functions = { hasSome: functionsParam };
  }

  // Validate and apply difficulty filter
  if (difficulty) {
    if (!isValidDifficulty(difficulty)) {
      return new Response(JSON.stringify({ error: `Invalid difficulty: ${difficulty}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    where.difficulty = difficulty;
  }

  // Validate and apply traditions filter (array - OR logic within traditions)
  if (traditionsParam.length > 0) {
    const invalidTraditions = traditionsParam.filter(t => !isValidTradition(t));
    if (invalidTraditions.length > 0) {
      return new Response(JSON.stringify({ error: `Invalid tradition values: ${invalidTraditions.join(", ")}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    where.traditions = { hasSome: traditionsParam };
  }

  const books = await prisma.book.findMany({
    where,
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
    goodreadsRating,
    goodreadsReviews,
    externalReviews,
    sourceType,
    functions,
    difficulty,
    traditions,
  } = body;

  if (!title) {
    return new Response(JSON.stringify({ error: "Title is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate facet fields
  if (sourceType && !isValidSourceType(sourceType)) {
    return new Response(JSON.stringify({ error: `Invalid sourceType: ${sourceType}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (functions && Array.isArray(functions)) {
    const invalidFunctions = functions.filter((f: string) => !isValidFunction(f));
    if (invalidFunctions.length > 0) {
      return new Response(JSON.stringify({ error: `Invalid function values: ${invalidFunctions.join(", ")}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (difficulty && !isValidDifficulty(difficulty)) {
    return new Response(JSON.stringify({ error: `Invalid difficulty: ${difficulty}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (traditions && Array.isArray(traditions)) {
    const invalidTraditions = traditions.filter((t: string) => !isValidTradition(t));
    if (invalidTraditions.length > 0) {
      return new Response(JSON.stringify({ error: `Invalid tradition values: ${invalidTraditions.join(", ")}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
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

  const parsedGoodreadsRating = goodreadsRating === "" || goodreadsRating === undefined || goodreadsRating === null
    ? null
    : Number(goodreadsRating);
  if (parsedGoodreadsRating !== null && (Number.isNaN(parsedGoodreadsRating) || parsedGoodreadsRating < 0 || parsedGoodreadsRating > 5)) {
    return new Response(JSON.stringify({ error: "Goodreads rating must be a number between 0 and 5" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsedGoodreadsReviews = goodreadsReviews === "" || goodreadsReviews === undefined || goodreadsReviews === null
    ? null
    : Number(goodreadsReviews);
  if (parsedGoodreadsReviews !== null && (!Number.isFinite(parsedGoodreadsReviews) || parsedGoodreadsReviews < 0)) {
    return new Response(JSON.stringify({ error: "Goodreads reviews must be a non-negative number" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const normalizedExternalReviews = Array.isArray(externalReviews) ? externalReviews : null;

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
      goodreadsRating: parsedGoodreadsRating,
      goodreadsReviews: parsedGoodreadsReviews !== null ? Math.floor(parsedGoodreadsReviews) : null,
      externalReviews: normalizedExternalReviews,
      sourceType: sourceType || null,
      functions: functions || [],
      difficulty: difficulty || null,
      traditions: traditions || [],
      createdBy: authResult.user.id,
    },
  });

  return new Response(JSON.stringify(book), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
