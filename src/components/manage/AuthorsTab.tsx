import { useState, useEffect, useCallback } from "react";
import { ManageAuthorsWrapper } from "../ManageAuthorsWrapper";

interface Author {
    id: string;
    name: string;
    slug: string;
    bio?: string | null;
    photoUrl?: string | null;
    _count?: {
        books: number;
    };
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface AuthorsTabProps {
    initialAuthors?: Author[] | null;
    initialPagination?: PaginationInfo | null;
}

const PAGE_SIZE = 20;

export function AuthorsTab({ initialAuthors, initialPagination }: AuthorsTabProps) {
    const [authors, setAuthors] = useState<Author[] | null>(initialAuthors ?? null);
    const [pagination, setPagination] = useState<PaginationInfo | null>(initialPagination ?? null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

    const fetchAuthors = useCallback(async (page = 1) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`/api/manage/authors?page=${page}&limit=${PAGE_SIZE}`, { credentials: "include" });
            if (response.status === 401) {
                window.location.href = "/login";
                return;
            }
            if (!response.ok) {
                throw new Error("Failed to load authors");
            }
            const data = await response.json();
            setAuthors(Array.isArray(data.authors) ? data.authors : Array.isArray(data) ? data : []);
            if (data.pagination) {
                setPagination(data.pagination);
            }
        } catch (err) {
            setError("Failed to load authors. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authors === null && !loading) {
            void fetchAuthors();
        }
    }, [authors, loading, fetchAuthors]);

    const handleEdit = (authorId: string) => {
        const author = authors?.find((item) => item.id === authorId);
        if (author) {
            setEditingAuthor(author);
            setModalOpen(true);
        }
    };

    const handleDelete = async (authorId: string) => {
        if (!confirm("Are you sure you want to delete this author?")) return;
        try {
            const response = await fetch(`/api/authors/${authorId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (response.ok) {
                setAuthors((prev) => prev?.filter((a) => a.id !== authorId) ?? null);
                if (pagination) {
                    setPagination({ ...pagination, total: pagination.total - 1 });
                }
                return;
            }
            const data = await response.json().catch(() => ({}));
            alert(`Failed to delete author: ${data.error || "Unknown error"}`);
        } catch (err) {
            alert("Failed to delete author. Please try again.");
        }
    };

    const handleAddClick = () => {
        setEditingAuthor(null);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingAuthor(null);
    };

    const handleSuccess = () => {
        setModalOpen(false);
        setEditingAuthor(null);
        void fetchAuthors(pagination?.page ?? 1);
    };

    const handlePageChange = (newPage: number) => {
        void fetchAuthors(newPage);
    };

    if (loading && authors === null) {
        return (
            <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
                <p className="muted">Loading authors...</p>
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

    if (!authors || authors.length === 0) {
        return (
            <>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                    <button className="button" onClick={handleAddClick}>
                        + Add Author
                    </button>
                </div>
                <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
                    <p className="muted">No authors yet. Click "+ Add Author" to get started!</p>
                </div>
                <ManageAuthorsWrapper
                    author={editingAuthor}
                    isOpen={modalOpen}
                    onClose={handleModalClose}
                    onSuccess={handleSuccess}
                />
            </>
        );
    }

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                {pagination && (
                    <p className="muted" style={{ margin: 0 }}>
                        Showing {authors.length} of {pagination.total} authors
                    </p>
                )}
                <button className="button" onClick={handleAddClick}>
                    + Add Author
                </button>
            </div>

            <div className="video-admin-list">
                {authors.map((author) => (
                    <div key={author.id} className="panel" style={{ padding: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
                            <div style={{ flexShrink: 0, position: "relative" }}>
                                {author.photoUrl ? (
                                    <img
                                        src={author.photoUrl}
                                        alt={author.name}
                                        loading="lazy"
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            objectFit: "cover",
                                            borderRadius: "50%",
                                            border: "2px solid var(--border-color)",
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontSize: "2.5rem",
                                            fontWeight: 600,
                                            border: "2px solid var(--border-color)",
                                        }}
                                    >
                                        {author.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem" }}>{author.name}</h3>
                                <p className="muted" style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem" }}>
                                    Slug: {author.slug}
                                </p>
                                {author._count && (
                                    <p className="muted" style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem" }}>
                                        {author._count.books} {author._count.books === 1 ? "book" : "books"}
                                    </p>
                                )}
                                {author.bio && (
                                    <p
                                        className="muted"
                                        style={{ margin: "0", fontSize: "0.85rem", lineHeight: 1.4 }}
                                    >
                                        {author.bio.length > 120 ? `${author.bio.slice(0, 117)}...` : author.bio}
                                    </p>
                                )}
                            </div>

                            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                                <button className="button button-sm" onClick={() => handleEdit(author.id)}>
                                    Edit
                                </button>
                                <button className="button button-sm button-danger" onClick={() => handleDelete(author.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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

            <ManageAuthorsWrapper
                author={editingAuthor}
                isOpen={modalOpen}
                onClose={handleModalClose}
                onSuccess={handleSuccess}
            />
        </>
    );
}
