#!/usr/bin/env tsx

import dotenv from "dotenv";
import { parseISBN, getOpenLibraryCover } from "../src/lib/book-utils.js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Load environment variables
dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Fetches book metadata from Google Books API and Open Library API
 */
async function fetchBookMetadata(query: string) {
  const { isbn10, isbn13 } = parseISBN(query);
  const searchQuery = isbn13 || isbn10 || query;

  let finalData: any = {
    title: null,
    description: null,
    isbn: null,
    isbn13: null,
    authors: [],
    publisher: null,
    publishedDate: null,
    thumbnailUrl: null,
    pageCount: null,
    categories: [],
    language: null,
    previewLink: null,
    infoLink: null,
  };

  // ========== GOOGLE BOOKS API ==========
  console.log("[GOOGLE BOOKS] Searching for:", searchQuery);

  try {
    const googleUrl = new URL("https://www.googleapis.com/books/v1/volumes");
    googleUrl.searchParams.set("q", searchQuery);

    const googleApiKey = process.env.GOOGLE_BOOKS_API_KEY;
    if (googleApiKey) {
      googleUrl.searchParams.set("key", googleApiKey);
    }

    const googleRes = await fetch(googleUrl.toString());

    if (googleRes.ok) {
      const data = await googleRes.json();

      if (data.items && data.items.length > 0) {
        const volumeInfo = data.items[0].volumeInfo;

        console.log("[GOOGLE BOOKS] Found:", volumeInfo.title);

        // Extract all data from Google Books
        finalData.title = volumeInfo.title || finalData.title;
        finalData.description = volumeInfo.description || finalData.description;
        finalData.authors = volumeInfo.authors || finalData.authors;
        finalData.publisher = volumeInfo.publisher || finalData.publisher;
        finalData.publishedDate = volumeInfo.publishedDate || finalData.publishedDate;
        finalData.pageCount = volumeInfo.pageCount || finalData.pageCount;
        finalData.categories = volumeInfo.categories || finalData.categories;
        finalData.language = volumeInfo.language || finalData.language;
        finalData.previewLink = volumeInfo.previewLink || finalData.previewLink;
        finalData.infoLink = volumeInfo.infoLink || finalData.infoLink;

        // Extract ISBNs from industryIdentifiers
        if (volumeInfo.industryIdentifiers) {
          for (const id of volumeInfo.industryIdentifiers) {
            if (id.type === "ISBN_10") {
              finalData.isbn = id.identifier;
            } else if (id.type === "ISBN_13") {
              finalData.isbn13 = id.identifier;
            }
          }
        }

        // Get thumbnail from imageLinks (prefer larger sizes)
        if (volumeInfo.imageLinks) {
          finalData.thumbnailUrl =
            volumeInfo.imageLinks.extraLarge ||
            volumeInfo.imageLinks.large ||
            volumeInfo.imageLinks.medium ||
            volumeInfo.imageLinks.small ||
            volumeInfo.imageLinks.thumbnail ||
            volumeInfo.imageLinks.smallThumbnail ||
            null;

          // Ensure HTTPS
          if (finalData.thumbnailUrl) {
            finalData.thumbnailUrl = finalData.thumbnailUrl.replace('http://', 'https://');
          }
        }
      } else {
        console.log("[GOOGLE BOOKS] No results found");
      }
    } else {
      console.error("[GOOGLE BOOKS] API error:", googleRes.status);
    }
  } catch (err) {
    console.error("[GOOGLE BOOKS] Error:", err);
  }

  // ========== OPEN LIBRARY API ==========
  // Only query Open Library if we're missing key data
  const needsOpenLibrary = !finalData.title || !finalData.description || finalData.authors.length === 0;

  if (needsOpenLibrary) {
    console.log("[OPEN LIBRARY] Searching for:", searchQuery);

    try {
      // Step 1: Search Open Library
      const olSearchUrl = new URL("https://openlibrary.org/search.json");

      // If we have ISBN, search by ISBN for best results
      if (finalData.isbn13 || finalData.isbn || isbn13 || isbn10) {
        const isbnToSearch = finalData.isbn13 || isbn13 || finalData.isbn || isbn10;
        olSearchUrl.searchParams.set("isbn", isbnToSearch || "");
      } else {
        olSearchUrl.searchParams.set("q", searchQuery);
      }

      olSearchUrl.searchParams.set("limit", "5"); // Get top 5 results

      const olSearchRes = await fetch(olSearchUrl.toString());

      if (olSearchRes.ok) {
        const searchData = await olSearchRes.json();

        if (searchData.docs && searchData.docs.length > 0) {
          const firstResult = searchData.docs[0];

          console.log("[OPEN LIBRARY] Found:", firstResult.title);

          // Fill in missing basic data from search results
          if (!finalData.title) finalData.title = firstResult.title;
          if (finalData.authors.length === 0 && firstResult.author_name) {
            finalData.authors = firstResult.author_name;
          }
          if (!finalData.publishedDate && firstResult.first_publish_year) {
            finalData.publishedDate = firstResult.first_publish_year.toString();
          }
          if (!finalData.publisher && firstResult.publisher && firstResult.publisher.length > 0) {
            finalData.publisher = firstResult.publisher[0];
          }
          if (!finalData.pageCount && firstResult.number_of_pages_median) {
            finalData.pageCount = firstResult.number_of_pages_median;
          }

          // Extract ISBNs from search results if missing
          if (!finalData.isbn && !finalData.isbn13 && firstResult.isbn) {
            for (const isbn of firstResult.isbn) {
              if (isbn.length === 13 && !finalData.isbn13) {
                finalData.isbn13 = isbn;
              } else if (isbn.length === 10 && !finalData.isbn) {
                finalData.isbn = isbn;
              }
            }
          }

          // Step 2: Try to get description from edition details
          if (!finalData.description && firstResult.edition_key) {
            for (let i = 0; i < Math.min(3, firstResult.edition_key.length); i++) {
              try {
                const editionKey = firstResult.edition_key[i];
                const editionUrl = `https://openlibrary.org/books/${editionKey}.json`;
                const editionRes = await fetch(editionUrl);

                if (editionRes.ok) {
                  const edition = await editionRes.json();

                  // Extract description
                  if (edition.description) {
                    if (typeof edition.description === 'string') {
                      finalData.description = edition.description;
                      console.log("[OPEN LIBRARY] Got description from edition:", editionKey);
                      break;
                    } else if (edition.description.value) {
                      finalData.description = edition.description.value;
                      console.log("[OPEN LIBRARY] Got description from edition:", editionKey);
                      break;
                    }
                  }

                  // Also fill in other missing data from edition
                  if (!finalData.publishedDate && edition.publish_date) {
                    finalData.publishedDate = edition.publish_date;
                  }
                  if (!finalData.pageCount && edition.number_of_pages) {
                    finalData.pageCount = edition.number_of_pages;
                  }
                  if (!finalData.publisher && edition.publishers && edition.publishers.length > 0) {
                    finalData.publisher = edition.publishers[0];
                  }
                  if (finalData.categories.length === 0 && edition.subjects) {
                    finalData.categories = edition.subjects.slice(0, 5);
                  }
                }
              } catch (err) {
                console.error(`[OPEN LIBRARY] Error fetching edition ${i}:`, err);
              }
            }
          }

          // Step 3: Try to get description from work if still missing
          if (!finalData.description && firstResult.key) {
            try {
              const workUrl = `https://openlibrary.org${firstResult.key}.json`;
              const workRes = await fetch(workUrl);

              if (workRes.ok) {
                const work = await workRes.json();

                if (work.description) {
                  if (typeof work.description === 'string') {
                    finalData.description = work.description;
                    console.log("[OPEN LIBRARY] Got description from work");
                  } else if (work.description.value) {
                    finalData.description = work.description.value;
                    console.log("[OPEN LIBRARY] Got description from work");
                  }
                }

                // Get subjects as categories if missing
                if (finalData.categories.length === 0 && work.subjects) {
                  finalData.categories = work.subjects.slice(0, 5);
                }
              }
            } catch (err) {
              console.error("[OPEN LIBRARY] Error fetching work:", err);
            }
          }

          // Step 4: Get cover image if we don't have one
          if (!finalData.thumbnailUrl) {
            if (firstResult.cover_i) {
              finalData.thumbnailUrl = `https://covers.openlibrary.org/b/id/${firstResult.cover_i}-L.jpg`;
            } else if (finalData.isbn13 || finalData.isbn) {
              finalData.thumbnailUrl = getOpenLibraryCover(finalData.isbn13 || finalData.isbn || "", "L");
            }
          }
        } else {
          console.log("[OPEN LIBRARY] No results found");
        }
      }
    } catch (err) {
      console.error("[OPEN LIBRARY] Error:", err);
    }
  }

  // Final fallback for cover image using ISBNs
  if (!finalData.thumbnailUrl && (finalData.isbn13 || finalData.isbn)) {
    finalData.thumbnailUrl = getOpenLibraryCover(finalData.isbn13 || finalData.isbn || "", "L");
  }

  return finalData;
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed: any = {
    query: null,
    title: null,
    description: null,
    isbn: null,
    isbn13: null,
    authors: [],
    publisher: null,
    publishedDate: null,
    thumbnailUrl: null,
    pageCount: null,
    categories: [],
    language: null,
    tags: [],
    sourceType: null,
    functions: [],
    difficulty: null,
    traditions: [],
    userId: null,
    force: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "--query":
      case "-q":
        parsed.query = nextArg;
        i++;
        break;
      case "--title":
      case "-t":
        parsed.title = nextArg;
        i++;
        break;
      case "--description":
      case "-d":
        parsed.description = nextArg;
        i++;
        break;
      case "--isbn":
        parsed.isbn = nextArg;
        i++;
        break;
      case "--isbn13":
        parsed.isbn13 = nextArg;
        i++;
        break;
      case "--authors":
      case "-a":
        parsed.authors = nextArg.split(",").map((a: string) => a.trim());
        i++;
        break;
      case "--publisher":
        parsed.publisher = nextArg;
        i++;
        break;
      case "--publishedDate":
        parsed.publishedDate = nextArg;
        i++;
        break;
      case "--thumbnailUrl":
        parsed.thumbnailUrl = nextArg;
        i++;
        break;
      case "--pageCount":
        parsed.pageCount = parseInt(nextArg, 10);
        i++;
        break;
      case "--categories":
        parsed.categories = nextArg.split(",").map((c: string) => c.trim());
        i++;
        break;
      case "--language":
        parsed.language = nextArg;
        i++;
        break;
      case "--tags":
        parsed.tags = nextArg.split(",").map((t: string) => t.trim());
        i++;
        break;
      case "--sourceType":
        parsed.sourceType = nextArg;
        i++;
        break;
      case "--functions":
        parsed.functions = nextArg.split(",").map((f: string) => f.trim());
        i++;
        break;
      case "--difficulty":
        parsed.difficulty = nextArg;
        i++;
        break;
      case "--traditions":
        parsed.traditions = nextArg.split(",").map((t: string) => t.trim());
        i++;
        break;
      case "--userId":
      case "-u":
        parsed.userId = nextArg;
        i++;
        break;
      case "--force":
      case "-f":
        parsed.force = true;
        break;
      case "--help":
      case "-h":
        console.log(`
Usage: npm run add-book -- [OPTIONS]

Options:
  --query, -q <query>           ISBN or title to search for metadata
  --title, -t <title>           Book title (required if not using --query)
  --description, -d <desc>      Book description (required if not using --query)
  --isbn <isbn>                 ISBN-10
  --isbn13 <isbn13>             ISBN-13
  --authors, -a <authors>       Comma-separated list of authors
  --publisher <publisher>       Publisher name
  --publishedDate <date>        Publication date
  --thumbnailUrl <url>          Cover image URL
  --pageCount <pages>           Number of pages
  --categories <categories>     Comma-separated list of categories
  --language <language>         Language code (e.g., "en")
  --tags <tags>                 Comma-separated list of tags
  --sourceType <type>           primary or secondary
  --functions <functions>       Comma-separated: foundational, theory, introductory, educational, historical, commentary, polemic
  --difficulty <difficulty>     beginner, intermediate, or advanced
  --traditions <traditions>     Comma-separated: classical_marxism, leninism, trotskyism, maoism, western_marxism, marxism_leninism, other
  --userId, -u <userId>         User ID to assign book to (defaults to first user)
  --force, -f                   Skip duplicate check and add anyway
  --help, -h                    Show this help message

Examples:
  # Fetch metadata by ISBN
  npm run add-book -- --query "978-0140445688"

  # Fetch metadata by title
  npm run add-book -- --query "Capital Marx"

  # Create book manually
  npm run add-book -- --title "Capital" --description "..." --authors "Karl Marx"

  # With classification
  npm run add-book -- --query "Capital Marx" --sourceType primary --difficulty advanced --tags "economics,capitalism"
        `);
        process.exit(0);
        break;
    }
  }

  return parsed;
}

async function main() {
  const args = parseArgs();

  // Fetch metadata if query provided
  let metadata = null;
  if (args.query) {
    console.log("\nFetching metadata for:", args.query);
    metadata = await fetchBookMetadata(args.query);
    console.log("\nMetadata fetched successfully!\n");
  }

  // Merge manual args with metadata (manual args override metadata)
  const bookData: any = {
    title: args.title || metadata?.title || null,
    description: args.description || metadata?.description || "",
    isbn: args.isbn || metadata?.isbn || null,
    isbn13: args.isbn13 || metadata?.isbn13 || null,
    authors: args.authors.length > 0 ? args.authors : (metadata?.authors || []),
    publisher: args.publisher || metadata?.publisher || null,
    publishedDate: args.publishedDate || metadata?.publishedDate || null,
    thumbnailUrl: args.thumbnailUrl || metadata?.thumbnailUrl || null,
    pageCount: args.pageCount || metadata?.pageCount || null,
    categories: args.categories.length > 0 ? args.categories : (metadata?.categories || []),
    language: args.language || metadata?.language || null,
    previewLink: metadata?.previewLink || null,
    infoLink: metadata?.infoLink || null,
    tags: args.tags,
    sourceType: args.sourceType || null,
    functions: args.functions,
    difficulty: args.difficulty || null,
    traditions: args.traditions,
  };

  // Validate required fields
  if (!bookData.title) {
    console.error("\nError: Book title is required. Use --title or --query to provide one.\n");
    process.exit(1);
  }

  if (!bookData.description) {
    console.error("\nError: Book description is required. Use --description or --query to provide one.\n");
    process.exit(1);
  }

  // Get user ID (default to first user if not specified)
  let userId = args.userId;
  if (!userId) {
    const firstUser = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (!firstUser) {
      console.error("\nError: No users found in database. Create a user first.\n");
      await prisma.$disconnect();
      await pool.end();
      process.exit(1);
    }
    userId = firstUser.id;
    console.log(`Using user: ${firstUser.email} (${firstUser.id})`);
  }

  // Check for duplicates (unless --force flag is used)
  if (!args.force) {
    console.log("\n🔍 Checking for duplicates...");

    // Check by ISBN first (most reliable)
    if (bookData.isbn || bookData.isbn13) {
      const existingByIsbn = await prisma.book.findFirst({
        where: {
          OR: [
            bookData.isbn ? { isbn: bookData.isbn } : {},
            bookData.isbn13 ? { isbn13: bookData.isbn13 } : {},
          ],
        },
        select: {
          id: true,
          title: true,
          authors: true,
          isbn: true,
          isbn13: true,
          isPublished: true,
          createdAt: true,
        },
      });

      if (existingByIsbn) {
        console.log("\n⚠️  DUPLICATE FOUND (by ISBN):");
        console.log("  ID:", existingByIsbn.id);
        console.log("  Title:", existingByIsbn.title);
        console.log("  Authors:", existingByIsbn.authors.join(", "));
        console.log("  ISBN-10:", existingByIsbn.isbn || "(none)");
        console.log("  ISBN-13:", existingByIsbn.isbn13 || "(none)");
        console.log("  Published:", existingByIsbn.isPublished ? "Yes" : "No");
        console.log("  Created:", existingByIsbn.createdAt.toISOString());
        console.log("  View at: /books/" + existingByIsbn.id);
        console.log("\n❌ Book already exists. Use --force to add anyway.\n");
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
      }
    }

    // Check by title (case-insensitive)
    const existingByTitle = await prisma.book.findFirst({
      where: {
        title: {
          equals: bookData.title,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        title: true,
        authors: true,
        isbn: true,
        isbn13: true,
        isPublished: true,
        createdAt: true,
      },
    });

    if (existingByTitle) {
      console.log("\n⚠️  DUPLICATE FOUND (by title):");
      console.log("  ID:", existingByTitle.id);
      console.log("  Title:", existingByTitle.title);
      console.log("  Authors:", existingByTitle.authors.join(", "));
      console.log("  ISBN-10:", existingByTitle.isbn || "(none)");
      console.log("  ISBN-13:", existingByTitle.isbn13 || "(none)");
      console.log("  Published:", existingByTitle.isPublished ? "Yes" : "No");
      console.log("  Created:", existingByTitle.createdAt.toISOString());
      console.log("  View at: /books/" + existingByTitle.id);
      console.log("\n❌ Book already exists. Use --force to add anyway.\n");
      await prisma.$disconnect();
      await pool.end();
      process.exit(1);
    }

    console.log("✅ No duplicates found.\n");
  } else {
    console.log("\n⚠️  Skipping duplicate check (--force flag used)\n");
  }

  // Display book data
  console.log("\n=== Book to be created ===");
  console.log("Title:", bookData.title);
  console.log("Authors:", bookData.authors.join(", ") || "(none)");
  console.log("ISBN-10:", bookData.isbn || "(none)");
  console.log("ISBN-13:", bookData.isbn13 || "(none)");
  console.log("Publisher:", bookData.publisher || "(none)");
  console.log("Published:", bookData.publishedDate || "(none)");
  console.log("Pages:", bookData.pageCount || "(none)");
  console.log("Language:", bookData.language || "(none)");
  console.log("Categories:", bookData.categories.join(", ") || "(none)");
  console.log("Tags:", bookData.tags.join(", ") || "(none)");
  console.log("Source Type:", bookData.sourceType || "(none)");
  console.log("Functions:", bookData.functions.join(", ") || "(none)");
  console.log("Difficulty:", bookData.difficulty || "(none)");
  console.log("Traditions:", bookData.traditions.join(", ") || "(none)");
  console.log("Description:", bookData.description.substring(0, 100) + "...");
  console.log("Cover URL:", bookData.thumbnailUrl || "(none)");
  console.log("========================\n");

  // Create book
  try {
    const book = await prisma.book.create({
      data: {
        title: bookData.title,
        description: bookData.description,
        isbn: bookData.isbn,
        isbn13: bookData.isbn13,
        authors: bookData.authors,
        publisher: bookData.publisher,
        publishedDate: bookData.publishedDate,
        thumbnailUrl: bookData.thumbnailUrl,
        pageCount: bookData.pageCount,
        categories: bookData.categories,
        language: bookData.language,
        previewLink: bookData.previewLink,
        infoLink: bookData.infoLink,
        tags: bookData.tags,
        sourceType: bookData.sourceType,
        functions: bookData.functions,
        difficulty: bookData.difficulty,
        traditions: bookData.traditions,
        createdBy: userId,
        isPublished: true,
      },
    });

    console.log("\n✅ Book created successfully!");
    console.log("Book ID:", book.id);
    console.log("View at: /books/" + book.id);
    console.log();
  } catch (error) {
    console.error("\n❌ Error creating book:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
