import { useState, useEffect } from "react";
import { LayoutList, Grid2x2, ArrowUpAZ, ArrowDownAZ, CalendarArrowDown, CalendarArrowUp, BookOpenText, ShoppingCart } from "lucide-react";
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
  readFreeLinks?: string[];
  purchaseLinks?: {
    amazon?: string;
    custom?: Array<{ label: string; url: string }>;
  } | null;
}

interface BookLibraryWithToggleProps {
  books: Book[];
}

export function BookLibraryWithToggle({ books }: BookLibraryWithToggleProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"title" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Load view preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bookViewMode");
    if (saved === "grid" || saved === "list") {
      setViewMode(saved);
    }
  }, []);

  // Save view preference
  const toggleView = (mode: "list" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("bookViewMode", mode);
  };

  // Convert author name to URL slug
  const authorToSlug = (author: string) => {
    return author.toLowerCase().replace(/\s+/g, "-");
  };

  // Extract domain from URL
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const formatCount = (value?: number | null) => {
    if (value === null || value === undefined) return "";
    return value.toLocaleString();
  };

  // Toggle sort
  const toggleSort = (type: "title" | "date") => {
    if (sortBy === type) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(type);
      setSortOrder(type === "title" ? "asc" : "desc");
    }
  };

  // Sort books
  const sortedBooks = [...books].sort((a, b) => {
    if (sortBy === "title") {
      const comparison = a.title.localeCompare(b.title);
      return sortOrder === "asc" ? comparison : -comparison;
    } else {
      const dateA = a.publishedDate || "";
      const dateB = b.publishedDate || "";
      const comparison = dateA.localeCompare(dateB);
      return sortOrder === "asc" ? comparison : -comparison;
    }
  });

  const selectedCoverUrl = getProxiedImageUrl(selectedBook?.thumbnailUrl, { width: 400, quality: 80 });

  return (
    <>
      {/* View Toggle and Sort Controls */}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginBottom: "1rem" }}>
        {/* Sort by Title */}
        <button
          onClick={() => toggleSort("title")}
          style={{
            padding: "0.5rem",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            background: sortBy === "title" ? "var(--accent-color)" : "var(--paper-color)",
            color: sortBy === "title" ? "white" : "var(--ink-color)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={`Sort by title (${sortBy === "title" && sortOrder === "asc" ? "A-Z" : "Z-A"})`}
        >
          {sortBy === "title" && sortOrder === "asc" ? <ArrowUpAZ size={20} /> : <ArrowDownAZ size={20} />}
        </button>

        {/* Sort by Date */}
        <button
          onClick={() => toggleSort("date")}
          style={{
            padding: "0.5rem",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            background: sortBy === "date" ? "var(--accent-color)" : "var(--paper-color)",
            color: sortBy === "date" ? "white" : "var(--ink-color)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={`Sort by date (${sortBy === "date" && sortOrder === "desc" ? "newest first" : "oldest first"})`}
        >
          {sortBy === "date" && sortOrder === "desc" ? <CalendarArrowDown size={20} /> : <CalendarArrowUp size={20} />}
        </button>

        {/* View Toggle */}
        <button
          onClick={() => toggleView("list")}
          style={{
            padding: "0.5rem",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            background: viewMode === "list" ? "var(--accent-color)" : "var(--paper-color)",
            color: viewMode === "list" ? "white" : "var(--ink-color)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="List view"
        >
          <LayoutList size={20} />
        </button>
        <button
          onClick={() => toggleView("grid")}
          style={{
            padding: "0.5rem",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            background: viewMode === "grid" ? "var(--accent-color)" : "var(--paper-color)",
            color: viewMode === "grid" ? "white" : "var(--ink-color)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Grid view"
        >
          <Grid2x2 size={20} />
        </button>
      </div>

      {/* Books Display */}
      {viewMode === "list" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {sortedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => setSelectedBook(book)}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {sortedBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => setSelectedBook(book)}
              style={{
                cursor: "pointer",
                borderRadius: "12px",
                overflow: "hidden",
                background: "var(--paper-color)",
                border: "1px solid var(--border-color)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              className="book-card-hover"
            >
              {/* Cover */}
              <div style={{ position: "relative" }}>
                {book.thumbnailUrl ? (
                  <img
                    src={getProxiedImageUrl(book.thumbnailUrl, { width: 400, quality: 75 }) || book.thumbnailUrl}
                    alt={book.title}
                    style={{
                      width: "100%",
                      aspectRatio: "2/3",
                      objectFit: "cover",
                      display: "block",
                      background: "#222",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "2/3",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "0.9rem",
                      padding: "1rem",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    {book.title}
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "1rem" }}>
                <h3
                  style={{
                    margin: "0 0 0.25rem 0",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    lineHeight: 1.3,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {book.title}
                </h3>
                
                {book.authors.length > 0 && (
                  <p
                    style={{
                      margin: "0 0 0.5rem 0",
                      fontSize: "0.8rem",
                      color: "var(--muted-color)",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {book.authors.map((author, index) => (
                      <span key={author}>
                        {index > 0 && ", "}
                        <a
                          href={`/books/author/${authorToSlug(author)}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: "var(--muted-color)",
                            textDecoration: "none",
                            borderBottom: "1px solid transparent",
                            transition: "border-color 0.15s, color 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.borderBottomColor = "var(--accent-color)";
                            (e.target as HTMLElement).style.color = "var(--accent-color)";
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.borderBottomColor = "transparent";
                            (e.target as HTMLElement).style.color = "var(--muted-color)";
                          }}
                        >
                          {author}
                        </a>
                      </span>
                    ))}
                  </p>
                )}

                {book.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginTop: "0.5rem" }}>
                    {book.tags.slice(0, 2).map((tag) => (
                      <a
                        key={tag}
                        href={`/books/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: "0.65rem",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "rgba(156, 92, 46, 0.12)",
                          color: "var(--accent-color)",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          textDecoration: "none",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.background = "rgba(156, 92, 46, 0.25)";
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.background = "rgba(156, 92, 46, 0.12)";
                        }}
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
                    {selectedBook.authors.map((author, index) => (
                      <span key={author}>
                        {index > 0 && ", "}
                        <a
                          href={`/books/author/${authorToSlug(author)}`}
                          style={{
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
                          {author}
                        </a>
                      </span>
                    ))}
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

            {/* Availability Links Section */}
            {(selectedBook.readFreeLinks?.length > 0 || selectedBook.purchaseLinks) && (
              <div style={{
                marginTop: "1.5rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid var(--border-color)"
              }}>
                {/* Read Free Links */}
                {selectedBook.readFreeLinks && selectedBook.readFreeLinks.length > 0 && (
                  <p style={{
                    fontSize: "0.95rem",
                    margin: "0 0 0.5rem 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flexWrap: "wrap"
                  }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "var(--ink-color)"
                    }}>
                      <BookOpenText size={18} style={{ color: "#27ae60" }} />
                      <span>Read at</span>
                    </span>
                    {selectedBook.readFreeLinks.map((link, index) => (
                      <span key={index}>
                        {index > 0 && <span style={{ color: "var(--muted-color)" }}>, </span>}
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
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
                          {getDomain(link)}
                        </a>
                      </span>
                    ))}
                  </p>
                )}

                {/* Purchase Links */}
                {selectedBook.purchaseLinks && (() => {
                  const links: Array<{ url: string; domain: string }> = [];

                  if (selectedBook.purchaseLinks.amazon) {
                    links.push({
                      url: selectedBook.purchaseLinks.amazon,
                      domain: getDomain(selectedBook.purchaseLinks.amazon),
                    });
                  }

                  selectedBook.purchaseLinks.custom?.forEach((custom) => {
                    if (custom.url) {
                      links.push({
                        url: custom.url,
                        domain: getDomain(custom.url),
                      });
                    }
                  });

                  return links.length > 0 ? (
                    <p style={{
                      fontSize: "0.95rem",
                      margin: "0.5rem 0 0 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      flexWrap: "wrap"
                    }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--ink-color)"
                      }}>
                        <ShoppingCart size={18} style={{ color: "#2980b9" }} />
                        <span>Purchase at</span>
                      </span>
                      {links.map((link, index) => (
                        <span key={index}>
                          {index > 0 && <span style={{ color: "var(--muted-color)" }}>, </span>}
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
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
                            {link.domain}
                          </a>
                        </span>
                      ))}
                    </p>
                  ) : null;
                })()}
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
