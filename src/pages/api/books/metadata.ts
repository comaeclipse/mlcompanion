import type { APIRoute } from "astro";
import { parseISBN, getOpenLibraryCover } from "../../../lib/book-utils";

/**
 * Fetches book metadata from Google Books API and Open Library API
 * Accepts ISBN-10, ISBN-13, or book title as search query
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const query = body?.query;

    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Missing query parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Try parsing as ISBN first
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
            // Try up to 3 editions to find one with a description
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
                        break; // Found description, stop trying editions
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

    console.log("[METADATA] Final result:", {
      hasTitle: !!finalData.title,
      hasDescription: !!finalData.description,
      hasAuthors: finalData.authors.length > 0,
      hasCover: !!finalData.thumbnailUrl
    });

    return new Response(
      JSON.stringify(finalData),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[BOOK METADATA API] Error:", error);
    return new Response(JSON.stringify({ error: "Metadata fetch failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
