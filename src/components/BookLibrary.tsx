import { useState } from "react";
import { BookCard } from "./BookCard";

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
}

interface BookLibraryProps {
  books: Book[];
}

export function BookLibrary({ books }: BookLibraryProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

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
              {selectedBook.thumbnailUrl ? (
                <img
                  src={selectedBook.thumbnailUrl}
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
