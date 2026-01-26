import { useState, useEffect, useCallback } from "react";
import { formatAuthors } from "../../lib/book-utils";
import { ManageBooksWrapper } from "../ManageBooksWrapper";

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

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface BooksTabProps {
    initialBooks?: Book[] | null;
    initialPagination?: PaginationInfo | null;
}

const PAGE_SIZE = 20;

export function BooksTab({ initialBooks, initialPagination }: BooksTabProps) {
    const [books, setBooks] = useState<Book[] | null>(initialBooks ?? null);
    const [pagination, setPagination] = useState<PaginationInfo | null>(initialPagination ?? null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [selectedAuthor, setSelectedAuthor] = useState<string>("");

    const fetchBooks = useCallback(async (page = 1) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`/api/manage/books?page=${page}&limit=${PAGE_SIZE}`, { credentials: "include" });
            if (response.status === 401) {
                window.location.href = "/login";
                return;
            }
            if (!response.ok) {
                throw new Error("Failed to load books");
            }
            const data = await response.json();
            setBooks(Array.isArray(data.books) ? data.books : Array.isArray(data) ? data : []);
            if (data.pagination) {
                setPagination(data.pagination);
            }
        } catch (err) {
            setError("Failed to load books. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (books === null && !loading) {
            void fetchBooks();
        }
    }, [books, loading, fetchBooks]);

    const handleEdit = (bookId: string) => {
        const book = books?.find((item) => item.id === bookId);
        if (book) {
            setEditingBook(book);
            setModalOpen(true);
        }
    };

    const handleDelete = async (bookId: string) => {
        if (!confirm("Are you sure you want to delete this book?")) return;
        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (response.ok) {
                setBooks((prev) => prev?.filter((b) => b.id !== bookId) ?? null);
                if (pagination) {
                    setPagination({ ...pagination, total: pagination.total - 1 });
                }
                return;
            }
            const data = await response.json().catch(() => ({}));
            alert(`Failed to delete book: ${data.error || "Unknown error"}`);
        } catch (err) {
            alert("Failed to delete book. Please try again.");
        }
    };

    const handleAddClick = () => {
        setEditingBook(null);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingBook(null);
    };

    const handleSuccess = () => {
        setModalOpen(false);
        setEditingBook(null);
        void fetchBooks(pagination?.page ?? 1);
    };

    const handlePageChange = (newPage: number) => {
        void fetchBooks(newPage);
    };

    if (loading && books === null) {
        return (
            <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
                <p className="muted">Loading books...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
                <p className="muted">{error}</p>
            </div>
        );
    }

    if (!books || books.length === 0) {
        return (
            <>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                    <button className="button" onClick={handleAddClick}>
                        + Add Book
                    </button>
                </div>
                <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
                    <p className="muted">No books yet. Click "+ Add Book" to get started!</p>
                </div>
                <ManageBooksWrapper
                    book={editingBook}
                    isOpen={modalOpen}
                    onClose={handleModalClose}
                    onSuccess={handleSuccess}
                />
            </>
        );
    }

    // Get unique authors for filter
    const allAuthors = new Set<string>();
    books.forEach((book) => {
        book.authors.forEach((author) => allAuthors.add(author));
    });
    const uniqueAuthors = Array.from(allAuthors).sort();

    // Filter books by selected author
    const filteredBooks = selectedAuthor
        ? books.filter((book) => book.authors.includes(selectedAuthor))
        : books;

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <label htmlFor="author-filter" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                        Filter:
                    </label>
                    <select
                        id="author-filter"
                        value={selectedAuthor}
                        onChange={(e) => setSelectedAuthor(e.target.value)}
                        style={{
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.9rem",
                            borderRadius: "8px",
                            border: "1px solid var(--border-color)",
                            background: "var(--background-color)",
                            color: "var(--text-color)",
                            cursor: "pointer",
                            minWidth: "200px",
                        }}
                    >
                        <option value="">All Authors ({books.length} books)</option>
                        {uniqueAuthors.map((author) => {
                            const count = books.filter((b) => b.authors.includes(author)).length;
                            return (
                                <option key={author} value={author}>
                                    {author} ({count} {count === 1 ? "book" : "books"})
                                </option>
                            );
                        })}
                    </select>
                    {pagination && (
                        <span className="muted" style={{ marginLeft: "0.5rem" }}>
                            ({pagination.total} total)
                        </span>
                    )}
                </div>
                <button className="button" onClick={handleAddClick}>
                    + Add Book
                </button>
            </div>

            {filteredBooks.length === 0 ? (
                <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
                    <p className="muted">No books found for selected author.</p>
                </div>
            ) : (
                <div className="video-admin-list">
                    {filteredBooks.map((book) => (
                        <div key={book.id} className="panel" style={{ padding: "0.75rem" }}>
                            <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
                                <div style={{ flexShrink: 0, position: "relative" }}>
                                    {book.thumbnailUrl ? (
                                        <img
                                            src={book.thumbnailUrl}
                                            alt={book.title}
                                            loading="lazy"
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

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem" }}>{book.title}</h3>
                                    {book.authors.length > 0 && (
                                        <p
                                            className="muted"
                                            style={{
                                                margin: "0 0 0.25rem 0",
                                                fontSize: "0.9rem",
                                                color: "var(--accent-color)",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {formatAuthors(book.authors)}
                                        </p>
                                    )}
                                    {book.publisher && (
                                        <p className="muted" style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem" }}>
                                            {book.publisher}
                                            {book.publishedDate ? ` - ${book.publishedDate}` : ""}
                                        </p>
                                    )}
                                    <p
                                        className="muted"
                                        style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", lineHeight: 1.4 }}
                                    >
                                        {book.description.length > 150 ? `${book.description.slice(0, 147)}...` : book.description}
                                    </p>
                                    {book.tags.length > 0 && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                                            {book.tags.slice(0, 4).map((tag) => (
                                                <a
                                                    key={tag}
                                                    href={`/books/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        fontSize: "0.7rem",
                                                        padding: "2px 6px",
                                                        borderRadius: "4px",
                                                        background: "rgba(156, 92, 46, 0.12)",
                                                        color: "var(--accent-color)",
                                                        textDecoration: "none",
                                                    }}
                                                >
                                                    {tag}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                                    <button className="button button-sm" onClick={() => handleEdit(book.id)}>
                                        Edit
                                    </button>
                                    <button className="button button-sm button-danger" onClick={() => handleDelete(book.id)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
                    <button
                        className="button button-sm"
                        disabled={pagination.page <= 1 || loading}
                        onClick={() => handlePageChange(pagination.page - 1)}
                    >
                        Previous
                    </button>
                    <span style={{ display: "flex", alignItems: "center", padding: "0 1rem" }}>
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        className="button button-sm"
                        disabled={pagination.page >= pagination.totalPages || loading}
                        onClick={() => handlePageChange(pagination.page + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            <ManageBooksWrapper
                book={editingBook}
                isOpen={modalOpen}
                onClose={handleModalClose}
                onSuccess={handleSuccess}
            />
        </>
    );
}
