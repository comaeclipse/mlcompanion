import { formatAuthors } from "@/lib/book-utils";

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

interface BookCardProps {
  book: Book;
  onClick?: () => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  // Truncate description to ~150 chars
  const shortDesc = book.description.length > 150
    ? book.description.slice(0, 147) + "..."
    : book.description;

  // Format authors for display
  const authorText = formatAuthors(book.authors);

  return (
    <div
      onClick={handleClick}
      style={{
        display: "flex",
        gap: "1rem",
        padding: "0.75rem",
        borderRadius: "12px",
        background: "var(--paper-color)",
        border: "1px solid var(--border-color)",
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      className="video-card-hover"
    >
      {/* Book Cover */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {book.thumbnailUrl ? (
          <img
            src={book.thumbnailUrl}
            alt={book.title}
            style={{
              width: "120px",
              height: "180px",
              objectFit: "cover",
              borderRadius: "8px",
              background: "#222",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          />
        ) : (
          <div
            style={{
              width: "120px",
              height: "180px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "0.8rem",
              padding: "1rem",
              textAlign: "center",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            {book.title.substring(0, 30)}
          </div>
        )}
        {book.pageCount && (
          <span
            style={{
              position: "absolute",
              bottom: "4px",
              right: "4px",
              background: "rgba(0,0,0,0.8)",
              color: "white",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "0.7rem",
              fontWeight: 500,
            }}
          >
            {book.pageCount}p
          </span>
        )}
      </div>

      {/* Book Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            margin: "0 0 0.25rem 0",
            fontSize: "1.05rem",
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
        
        <p
          style={{
            margin: "0 0 0.25rem 0",
            fontSize: "0.9rem",
            color: "var(--accent-color)",
            fontWeight: 500,
          }}
        >
          {authorText}
        </p>

        {book.publisher && (
          <p
            style={{
              margin: "0 0 0.25rem 0",
              fontSize: "0.8rem",
              color: "var(--muted-color)",
            }}
          >
            {book.publisher}{book.publishedDate && ` • ${book.publishedDate}`}
          </p>
        )}

        <p
          style={{
            margin: "0 0 0.5rem 0",
            fontSize: "0.85rem",
            color: "var(--muted-color)",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {shortDesc}
        </p>

        {/* Tags and Categories */}
        {(book.tags.length > 0 || book.categories.length > 0) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
            {book.tags.slice(0, 3).map((tag) => (
              <a
                key={tag}
                href={`/books/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontSize: "0.7rem",
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
            {book.categories.slice(0, 2).map((category) => (
              <span
                key={category}
                style={{
                  fontSize: "0.7rem",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: "rgba(102, 126, 234, 0.12)",
                  color: "#667eea",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                {category}
              </span>
            ))}
            {(book.tags.length + book.categories.length) > 5 && (
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--muted-color)",
                }}
              >
                +{(book.tags.length + book.categories.length) - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
