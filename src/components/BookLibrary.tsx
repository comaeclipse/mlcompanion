import { BookCard } from "./BookCard";
import { slugifyTitle } from "@/lib/book-utils";
import type { KeyboardEvent } from "react";

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
  const getBookHref = (book: Book) => `/book/${slugifyTitle(book.title)}`;
  const handleCardKey = (event: KeyboardEvent, href: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.location.href = href;
    }
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
    </>
  );
}
