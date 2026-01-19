import { useState } from "react";
import { BookCard } from "./BookCard";
import { getProxiedImageUrl } from "@/lib/image-utils";

interface Book {
  id: string;
  title: string;
  description: string;
  isbn?: string | null;
  isbn13?: string | null;
  authors: string[];
  publisher?: string | null;
  publishedDate?: string | null;
  thumbnailUrl?: string | null;
  pageCount?: number | null;
  categories: string[];
  tags: string[];
  goodreadsRating?: number | null;
  goodreadsReviews?: number | null;
  externalReviews?: Array<{
    authorUsername: string;
    reviewDate: string;
    contentHtml: string;
    score?: number;
    sourceUrl: string;
  }> | null;
}

interface BookLibraryProps {
  books: Book[];
}

export function BookLibrary({ books }: BookLibraryProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const selectedCoverUrl = getProxiedImageUrl(selectedBook?.thumbnailUrl, { width: 400, quality: 80 });
  const formatCount = (value?: number | null) => {
    if (value === null || value === undefined) return "";
    return value.toLocaleString();
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onClick={() => setSelectedBook(book)}
          />
        ))}
      </div>

      {/* Book Detail Modal */}
      {selectedBook && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="panel"
            style={{
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
              {selectedCoverUrl ? (
                <img
                  src={selectedCoverUrl}
                  alt={selectedBook.title}
                  style={{
                    width: "200px",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "200px",
                    height: "300px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "1.2rem",
                    padding: "2rem",
                    textAlign: "center",
                    fontWeight: 700,
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  {selectedBook.title}
                </div>
              )}
              
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: "0 0 0.5rem 0" }}>{selectedBook.title}</h2>
                {selectedBook.authors.length > 0 && (
                  <p style={{ fontSize: "1.1rem", color: "var(--accent-color)", fontWeight: 500, margin: "0 0 0.5rem 0" }}>
                    {selectedBook.authors.join(", ")}
                  </p>
                )}
                {selectedBook.publisher && (
                  <p style={{ fontSize: "0.9rem", color: "var(--muted-color)", margin: "0 0 0.5rem 0" }}>
                    {selectedBook.publisher}
                    {selectedBook.publishedDate && ` • ${selectedBook.publishedDate}`}
                    {selectedBook.pageCount && ` • ${selectedBook.pageCount} pages`}
                  </p>
                )}
                {(selectedBook.isbn || selectedBook.isbn13) && (
                  <p style={{ fontSize: "0.85rem", color: "var(--muted-color)", margin: "0 0 1rem 0" }}>
                    {selectedBook.isbn13 && `ISBN-13: ${selectedBook.isbn13}`}
                    {selectedBook.isbn13 && selectedBook.isbn && " • "}
                    {selectedBook.isbn && `ISBN-10: ${selectedBook.isbn}`}
                  </p>
                )}
                {(selectedBook.goodreadsRating !== null && selectedBook.goodreadsRating !== undefined) ||
                (selectedBook.goodreadsReviews !== null && selectedBook.goodreadsReviews !== undefined) ? (
                  <p style={{ fontSize: "0.85rem", color: "var(--muted-color)", margin: "0 0 1rem 0" }}>
                    Goodreads: {selectedBook.goodreadsRating ?? "N/A"}
                    {selectedBook.goodreadsReviews !== null && selectedBook.goodreadsReviews !== undefined
                      ? ` / ${formatCount(selectedBook.goodreadsReviews)} reviews`
                      : ""}
                  </p>
                ) : null}
                
                {/* Tags and Categories */}
                {(selectedBook.tags.length > 0 || selectedBook.categories.length > 0) && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                    {selectedBook.tags.map((tag) => (
                      <a
                        key={tag}
                        href={`/books/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                        style={{
                          fontSize: "0.8rem",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          background: "rgba(156, 92, 46, 0.12)",
                          color: "var(--accent-color)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          textDecoration: "none",
                          fontWeight: 500,
                        }}
                      >
                        {tag}
                      </a>
                    ))}
                    {selectedBook.categories.map((category) => (
                      <span
                        key={category}
                        style={{
                          fontSize: "0.8rem",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          background: "rgba(102, 126, 234, 0.12)",
                          color: "#667eea",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          fontWeight: 500,
                        }}
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ lineHeight: 1.7 }}>
              <h3 style={{ marginTop: 0 }}>Description</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>{selectedBook.description}</p>
            </div>

            {Array.isArray(selectedBook.externalReviews) && selectedBook.externalReviews.length > 0 && (
              <div style={{
                marginTop: "1.5rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid var(--border-color)"
              }}>
                <h3 style={{ marginTop: 0 }}>External Reviews</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {selectedBook.externalReviews.map((review, index) => (
                    <div key={`review-${index}`} style={{ background: "#fbf7f1", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1rem" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "baseline" }}>
                        <strong>{review.authorUsername || "Anonymous"}</strong>
                        {review.reviewDate && (
                          <span style={{ fontSize: "0.85rem", color: "var(--muted-color)" }}>
                            {review.reviewDate}
                          </span>
                        )}
                        {review.score !== undefined && review.score !== null && (
                          <span style={{ fontSize: "0.85rem", color: "var(--muted-color)" }}>
                            Score: {review.score}
                          </span>
                        )}
                        {review.sourceUrl && (
                          <a
                            href={review.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--accent-color)",
                              textDecoration: "none",
                              borderBottom: "1px solid transparent",
                              transition: "border-color 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLElement).style.borderBottomColor = "var(--accent-color)";
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLElement).style.borderBottomColor = "transparent";
                            }}
                          >
                            Source
                          </a>
                        )}
                      </div>
                      {review.contentHtml && (
                        <div
                          style={{ marginTop: "0.75rem", color: "var(--muted-color)" }}
                          dangerouslySetInnerHTML={{ __html: review.contentHtml }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
              <button
                className="button"
                onClick={() => setSelectedBook(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
