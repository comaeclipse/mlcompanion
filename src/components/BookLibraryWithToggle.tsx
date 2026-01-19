import { useState, useEffect, type KeyboardEvent } from "react";
import { LayoutList, Grid2x2, ArrowUpAZ, ArrowDownAZ, CalendarArrowDown, CalendarArrowUp } from "lucide-react";
import { BookCard } from "./BookCard";
import { slugifyTitle } from "@/lib/book-utils";
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

  const getBookHref = (book: Book) => `/book/${slugifyTitle(book.title)}`;
  const handleCardKey = (event: KeyboardEvent, href: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.location.href = href;
    }
  };

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
            <div
              key={book.id}
              role="link"
              tabIndex={0}
              onClick={() => {
                window.location.href = getBookHref(book);
              }}
              onKeyDown={(event) => handleCardKey(event, getBookHref(book))}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <BookCard book={book} />
            </div>
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
              role="link"
              tabIndex={0}
              onClick={() => {
                window.location.href = getBookHref(book);
              }}
              onKeyDown={(event) => handleCardKey(event, getBookHref(book))}
              style={{
                textDecoration: "none",
                color: "inherit",
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
                    src={book.thumbnailUrl}
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

    </>
  );
}
