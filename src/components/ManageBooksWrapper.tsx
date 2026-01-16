import { BookForm } from "./BookForm";

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
}

interface ManageBooksWrapperProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ManageBooksWrapper({ book, isOpen, onClose }: ManageBooksWrapperProps) {

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="panel"
        style={{
          maxWidth: "700px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>{book ? "Edit Book" : "Add Book"}</h2>
        <BookForm
          book={book || undefined}
          onSuccess={() => window.location.reload()}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
