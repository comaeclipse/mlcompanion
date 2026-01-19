import { useState } from "react";
import { ManageBooksWrapper } from "./ManageBooksWrapper";

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
  language?: string | null;
  previewLink?: string | null;
  infoLink?: string | null;
  tags: string[];
  goodreadsRating?: number | null;
  goodreadsReviews?: number | null;
  externalReviews?: Array<{
    authorUsername: string;
    reviewDate: string;
    contentHtml: string;
    score?: number;
    sourceUrl: string;
  }>;
}

interface ManageBooksPageProps {
  books: Book[];
}

export function ManageBooksPage({ books }: ManageBooksPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Expose functions to window for script access
  if (typeof window !== "undefined") {
    (window as any).openAddBookModal = () => {
      setEditingBook(null);
      setModalOpen(true);
    };
    (window as any).openEditBookModal = (bookId: string) => {
      const book = books.find(b => b.id === bookId);
      if (book) {
        setEditingBook(book);
        setModalOpen(true);
      }
    };
  }

  return (
    <ManageBooksWrapper
      book={editingBook}
      isOpen={modalOpen}
      onClose={() => {
        setModalOpen(false);
        setEditingBook(null);
      }}
    />
  );
}
