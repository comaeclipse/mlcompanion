import { useEffect, useState } from "react";
import { formatAuthors } from "../lib/book-utils";
import { getProxiedImageUrl } from "../lib/image-utils";
import { ManageBooksWrapper } from "./ManageBooksWrapper";
import { ManageVideosWrapper } from "./ManageVideosWrapper";

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

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string | null;
  duration?: string | null;
  channelName?: string | null;
  publishedAt?: Date | string | null;
  tags: string[];
  category?: string | null;
}

interface ManagePortalProps {
  initialTab: "books" | "videos";
  initialBooks?: Book[] | null;
  initialVideos?: Video[] | null;
}

export function ManagePortal({ initialTab, initialBooks, initialVideos }: ManagePortalProps) {
  const [activeTab, setActiveTab] = useState<"books" | "videos">(initialTab);
  const [books, setBooks] = useState<Book[] | null>(initialBooks ?? null);
  const [videos, setVideos] = useState<Video[] | null>(initialVideos ?? null);
  const [booksLoading, setBooksLoading] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);
  const [booksError, setBooksError] = useState("");
  const [videosError, setVideosError] = useState("");
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const fetchBooks = async () => {
    setBooksLoading(true);
    setBooksError("");
    try {
      const response = await fetch("/api/manage/books", { credentials: "include" });
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to load books");
      }
      const data = await response.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      setBooksError("Failed to load books. Please try again.");
    } finally {
      setBooksLoading(false);
    }
  };

  const fetchVideos = async () => {
    setVideosLoading(true);
    setVideosError("");
    try {
      const response = await fetch("/api/manage/videos", { credentials: "include" });
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to load videos");
      }
      const data = await response.json();
      setVideos(Array.isArray(data) ? data : []);
    } catch (err) {
      setVideosError("Failed to load videos. Please try again.");
    } finally {
      setVideosLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", activeTab);
    window.history.replaceState({}, "", url.toString());
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "books" && books === null && !booksLoading) {
      void fetchBooks();
    }
  }, [activeTab, books, booksLoading]);

  useEffect(() => {
    if (activeTab === "videos" && videos === null && !videosLoading) {
      void fetchVideos();
    }
  }, [activeTab, videos, videosLoading]);

  const handleTabChange = (tab: "books" | "videos") => {
    setActiveTab(tab);
    setBookModalOpen(false);
    setVideoModalOpen(false);
    setEditingBook(null);
    setEditingVideo(null);
  };

  const handleAddClick = () => {
    if (activeTab === "books") {
      setEditingBook(null);
      setBookModalOpen(true);
      return;
    }
    setEditingVideo(null);
    setVideoModalOpen(true);
  };

  const handleEditBook = (bookId: string) => {
    const book = books?.find((item) => item.id === bookId);
    if (book) {
      setEditingBook(book);
      setBookModalOpen(true);
    }
  };

  const handleEditVideo = (videoId: string) => {
    const video = videos?.find((item) => item.id === videoId);
    if (video) {
      setEditingVideo(video);
      setVideoModalOpen(true);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        window.location.reload();
        return;
      }
      const data = await response.json().catch(() => ({}));
      alert(`Failed to delete book: ${data.error || "Unknown error"}`);
    } catch (err) {
      alert("Failed to delete book. Please try again.");
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        window.location.reload();
        return;
      }
      const data = await response.json().catch(() => ({}));
      alert(`Failed to delete video: ${data.error || "Unknown error"}`);
    } catch (err) {
      alert("Failed to delete video. Please try again.");
    }
  };

  const renderBooks = () => {
    if (booksLoading) {
      return (
        <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p className="muted">Loading books...</p>
        </div>
      );
    }

    if (booksError) {
      return (
        <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p className="muted">{booksError}</p>
        </div>
      );
    }

    if (!books || books.length === 0) {
      return (
        <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p className="muted">No books yet. Click "Add Book" to get started!</p>
        </div>
      );
    }

    return (
      <div className="video-admin-list">
        {books.map((book) => {
          const proxiedThumbnailUrl = getProxiedImageUrl(book.thumbnailUrl, {
            width: 240,
            quality: 75,
          });

          return (
            <div key={book.id} className="panel" style={{ padding: "0.75rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
                <div style={{ flexShrink: 0, position: "relative" }}>
                  {proxiedThumbnailUrl ? (
                    <img
                      src={proxiedThumbnailUrl}
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
                  <button className="button button-sm" onClick={() => handleEditBook(book.id)}>
                    Edit
                  </button>
                  <button className="button button-sm button-danger" onClick={() => handleDeleteBook(book.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderVideos = () => {
    if (videosLoading) {
      return (
        <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p className="muted">Loading videos...</p>
        </div>
      );
    }

    if (videosError) {
      return (
        <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p className="muted">{videosError}</p>
        </div>
      );
    }

    if (!videos || videos.length === 0) {
      return (
        <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p className="muted">No videos yet. Click "Add Video" to get started!</p>
        </div>
      );
    }

    return (
      <div className="video-admin-list">
        {videos.map((video) => (
          <div key={video.id} className="panel" style={{ padding: "0.75rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
              <div style={{ flexShrink: 0, position: "relative" }}>
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    style={{
                      width: "180px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      background: "#222",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "180px",
                      height: "100px",
                      borderRadius: "8px",
                      background: "#ddd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                      fontSize: "0.8rem",
                    }}
                  >
                    No thumbnail
                  </div>
                )}
                {video.duration && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: "4px",
                      right: "4px",
                      background: "rgba(0,0,0,0.8)",
                      color: "white",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    {video.duration}
                  </span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem" }}>{video.title}</h3>
                {video.channelName && (
                  <p className="muted" style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem" }}>
                    {video.channelName}
                  </p>
                )}
                <p
                  className="muted"
                  style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", lineHeight: 1.4 }}
                >
                  {video.description.length > 120 ? `${video.description.slice(0, 117)}...` : video.description}
                </p>
                {video.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                    {video.tags.slice(0, 4).map((tag) => (
                      <a
                        key={tag}
                        href={`/videos/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
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
                <button className="button button-sm" onClick={() => handleEditVideo(video.id)}>
                  Edit
                </button>
                <button className="button button-sm button-danger" onClick={() => handleDeleteVideo(video.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page">
      <header className="hero">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div>
            <h1>Manage Library</h1>
            <p className="muted">Add, edit, and organize your books and videos</p>
          </div>
          <button className="button" onClick={handleAddClick}>
            {activeTab === "books" ? "+ Add Book" : "+ Add Video"}
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button
            className="button"
            onClick={() => handleTabChange("books")}
            style={
              activeTab === "books"
                ? {}
                : { background: "transparent", color: "var(--accent-color)", border: "1px solid var(--accent-color)" }
            }
          >
            Books
          </button>
          <button
            className="button"
            onClick={() => handleTabChange("videos")}
            style={
              activeTab === "videos"
                ? {}
                : { background: "transparent", color: "var(--accent-color)", border: "1px solid var(--accent-color)" }
            }
          >
            Videos
          </button>
        </div>
      </header>

      <section>{activeTab === "books" ? renderBooks() : renderVideos()}</section>

      <ManageBooksWrapper
        book={editingBook}
        isOpen={bookModalOpen}
        onClose={() => {
          setBookModalOpen(false);
          setEditingBook(null);
        }}
      />
      <ManageVideosWrapper
        video={editingVideo}
        isOpen={videoModalOpen}
        onClose={() => {
          setVideoModalOpen(false);
          setEditingVideo(null);
        }}
      />
    </div>
  );
}
