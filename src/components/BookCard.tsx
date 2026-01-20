import { formatAuthors } from "@/lib/book-utils";
import { getProxiedImageUrl } from "@/lib/image-utils";
import {
  SOURCE_TYPE_LABELS,
  FUNCTION_LABELS,
  DIFFICULTY_LABELS,
  TRADITION_LABELS,
  getFacetColor,
} from "@/lib/book-facets";

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
  readFreeLinks?: string[];
  purchaseLinks?: {
    amazon?: string;
    custom?: Array<{ label: string; url: string }>;
  } | null;
  // Faceted classification fields
  sourceType?: string | null;
  functions?: string[];
  difficulty?: string | null;
  traditions?: string[];
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

  // Convert author name to URL slug
  const authorToSlug = (author: string) => {
    return author.toLowerCase().replace(/\s+/g, "-");
  };

  // Use direct URL for all images (Vercel proxy has issues with external URLs)
  const coverUrl = book.thumbnailUrl;

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
        {coverUrl ? (
          <img
            src={coverUrl}
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
        
        {book.authors.length > 0 && (
          <p
            style={{
              margin: "0 0 0.25rem 0",
              fontSize: "0.9rem",
              color: "var(--accent-color)",
              fontWeight: 500,
            }}
          >
            {book.authors.map((author, index) => (
              <span key={author}>
                {index > 0 && ", "}
                <a
                  href={`/books/author/${authorToSlug(author)}`}
                  onClick={(e) => e.stopPropagation()}
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

        {/* Facet Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
          {/* Source Type */}
          {book.sourceType && (
            <span
              style={{
                fontSize: "0.7rem",
                padding: "2px 6px",
                borderRadius: "4px",
                background: getFacetColor("sourceType", book.sourceType).bg,
                color: getFacetColor("sourceType", book.sourceType).text,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                fontWeight: 600,
              }}
            >
              {SOURCE_TYPE_LABELS[book.sourceType as keyof typeof SOURCE_TYPE_LABELS]}
            </span>
          )}

          {/* Difficulty */}
          {book.difficulty && (
            <span
              style={{
                fontSize: "0.7rem",
                padding: "2px 6px",
                borderRadius: "4px",
                background: getFacetColor("difficulty", book.difficulty).bg,
                color: getFacetColor("difficulty", book.difficulty).text,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                fontWeight: 600,
              }}
            >
              {DIFFICULTY_LABELS[book.difficulty as keyof typeof DIFFICULTY_LABELS]}
            </span>
          )}

          {/* Functions (show up to 2) */}
          {book.functions?.slice(0, 2).map((func) => (
            <span
              key={func}
              style={{
                fontSize: "0.7rem",
                padding: "2px 6px",
                borderRadius: "4px",
                background: getFacetColor("function", func).bg,
                color: getFacetColor("function", func).text,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              {FUNCTION_LABELS[func as keyof typeof FUNCTION_LABELS]}
            </span>
          ))}

          {/* Traditions (show up to 1) */}
          {book.traditions?.slice(0, 1).map((trad) => (
            <span
              key={trad}
              style={{
                fontSize: "0.7rem",
                padding: "2px 6px",
                borderRadius: "4px",
                background: getFacetColor("tradition", trad).bg,
                color: getFacetColor("tradition", trad).text,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              {TRADITION_LABELS[trad as keyof typeof TRADITION_LABELS]}
            </span>
          ))}

          {/* User Tags (show up to 2) */}
          {book.tags.slice(0, 2).map((tag) => (
            <a
              key={tag}
              href={`/topic/${tag.toLowerCase().replace(/\s+/g, "-")}`}
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

          {/* "+X more" counter */}
          {(() => {
            const totalFacets =
              (book.sourceType ? 1 : 0) +
              (book.difficulty ? 1 : 0) +
              (book.functions?.length || 0) +
              (book.traditions?.length || 0) +
              book.tags.length;
            const shownFacets =
              (book.sourceType ? 1 : 0) +
              (book.difficulty ? 1 : 0) +
              Math.min(book.functions?.length || 0, 2) +
              Math.min(book.traditions?.length || 0, 1) +
              Math.min(book.tags.length, 2);

            return totalFacets > shownFacets ? (
              <span style={{ fontSize: "0.7rem", color: "var(--muted-color)" }}>
                +{totalFacets - shownFacets}
              </span>
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );
}
