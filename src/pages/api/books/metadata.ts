import type { APIRoute } from "astro";
import { parseISBN, validateISBN, getOpenLibraryCover } from "../../../lib/book-utils";

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

    // Fetch from Google Books API
    const googleApiKey = process.env.GOOGLE_BOOKS_API_KEY;
    let googleData = null;

    if (googleApiKey) {
      try {
        const googleUrl = new URL("https://www.googleapis.com/books/v1/volumes");
        googleUrl.searchParams.set("q", searchQuery);
        googleUrl.searchParams.set("key", googleApiKey);

        const googleRes = await fetch(googleUrl.toString());
        if (googleRes.ok) {
          const data = await googleRes.json();
          if (data.items && data.items.length > 0) {
            googleData = data.items[0];
          }
        }
      } catch (err) {
        console.error("[GOOGLE BOOKS API] Error:", err);
      }
    } else {
      // Try without API key (limited quota)
      try {
        const googleUrl = new URL("https://www.googleapis.com/books/v1/volumes");
        googleUrl.searchParams.set("q", searchQuery);

        const googleRes = await fetch(googleUrl.toString());
        if (googleRes.ok) {
          const data = await googleRes.json();
          if (data.items && data.items.length > 0) {
            googleData = data.items[0];
          }
        }
      } catch (err) {
        console.error("[GOOGLE BOOKS API] Error:", err);
      }
    }

    // Fetch from Open Library API as fallback/supplement
    let openLibraryData = null;
    if (isbn13 || isbn10) {
      try {
        const olIsbn = isbn13 || isbn10;
        const olUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${olIsbn}&format=json&jscmd=data`;
        const olRes = await fetch(olUrl);
        if (olRes.ok) {
          const data = await olRes.json();
          const key = `ISBN:${olIsbn}`;
          if (data[key]) {
            openLibraryData = data[key];
          }
        }
      } catch (err) {
        console.error("[OPEN LIBRARY API] Error:", err);
      }
    }

    // Merge data from both sources, preferring Google Books
    const volumeInfo = googleData?.volumeInfo;
    
    // Extract ISBNs from Google Books
    let finalIsbn = isbn10;
    let finalIsbn13 = isbn13;
    
    if (volumeInfo?.industryIdentifiers) {
      for (const id of volumeInfo.industryIdentifiers) {
        if (id.type === "ISBN_10") finalIsbn = id.identifier;
        if (id.type === "ISBN_13") finalIsbn13 = id.identifier;
      }
    }

    // Get thumbnail - prefer Google Books, fallback to Open Library
    let thumbnailUrl = volumeInfo?.imageLinks?.thumbnail || 
                       volumeInfo?.imageLinks?.smallThumbnail ||
                       openLibraryData?.cover?.large ||
                       openLibraryData?.cover?.medium ||
                       null;
    
    // If we have ISBN but no thumbnail, generate Open Library cover URL
    if (!thumbnailUrl && (finalIsbn13 || finalIsbn)) {
      thumbnailUrl = getOpenLibraryCover(finalIsbn13 || finalIsbn || "", "L");
    }

    // Extract authors
    const authors = volumeInfo?.authors || 
                   (openLibraryData?.authors ? openLibraryData.authors.map((a: any) => a.name) : []) ||
                   [];

    // Extract categories
    const categories = volumeInfo?.categories || [];

    return new Response(
      JSON.stringify({
        title: volumeInfo?.title || openLibraryData?.title || null,
        description: volumeInfo?.description || openLibraryData?.notes || null,
        isbn: finalIsbn,
        isbn13: finalIsbn13,
        authors,
        publisher: volumeInfo?.publisher || openLibraryData?.publishers?.[0]?.name || null,
        publishedDate: volumeInfo?.publishedDate || openLibraryData?.publish_date || null,
        thumbnailUrl,
        pageCount: volumeInfo?.pageCount || openLibraryData?.number_of_pages || null,
        categories,
        language: volumeInfo?.language || null,
        previewLink: volumeInfo?.previewLink || openLibraryData?.url || null,
        infoLink: volumeInfo?.infoLink || openLibraryData?.url || null,
      }),
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
