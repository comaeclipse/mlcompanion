import { useEffect, useState } from "react";
import { formatAuthors } from "../lib/book-utils";
import { getProxiedImageUrl } from "../lib/image-utils";
import { ManageBooksWrapper } from "./ManageBooksWrapper";
import { ManageVideosWrapper } from "./ManageVideosWrapper";
import { ManageAuthorsWrapper } from "./ManageAuthorsWrapper";
import { ManageChannelsWrapper } from "./ManageChannelsWrapper";

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

interface Channel {
  id: string;
  channelId: string;
  name: string;
  slug: string;
  url?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  subscriberCount?: number | null;
  videoCount?: number | null;
  viewCount?: number | null;
  customUrl?: string | null;
  country?: string | null;
  publishedAt?: Date | string | null;
  _count?: {
    videos: number;
  };
}

interface ManagePortalProps {
  initialTab: "books" | "videos" | "authors" | "channels";
  initialBooks?: Book[] | null;
  initialVideos?: Video[] | null;
  initialAuthors?: Author[] | null;
  initialChannels?: Channel[] | null;
}

export function ManagePortal({ initialTab, initialBooks, initialVideos, initialAuthors, initialChannels }: ManagePortalProps) {
  const [activeTab, setActiveTab] = useState<"books" | "videos" | "authors" | "channels">(initialTab);
  const [books, setBooks] = useState<Book[] | null>(initialBooks ?? null);
  const [videos, setVideos] = useState<Video[] | null>(initialVideos ?? null);
  const [authors, setAuthors] = useState<Author[] | null>(initialAuthors ?? null);
  const [channels, setChannels] = useState<Channel[] | null>(initialChannels ?? null);
  const [booksLoading, setBooksLoading] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [booksError, setBooksError] = useState("");
  const [videosError, setVideosError] = useState("");
  const [authorsError, setAuthorsError] = useState("");
  const [channelsError, setChannelsError] = useState("");
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [authorModalOpen, setAuthorModalOpen] = useState(false);
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

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

  const fetchAuthors = async () => {
    setAuthorsLoading(true);
    setAuthorsError("");
    try {
      const response = await fetch("/api/manage/authors", { credentials: "include" });
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to load authors");
      }
      const data = await response.json();
      setAuthors(Array.isArray(data) ? data : []);
    } catch (err) {
      setAuthorsError("Failed to load authors. Please try again.");
    } finally {
      setAuthorsLoading(false);
    }
  };

  const fetchChannels = async () => {
    setChannelsLoading(true);
    setChannelsError("");
    try {
      const response = await fetch("/api/manage/channels", { credentials: "include" });
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to load channels");
      }
      const data = await response.json();
      setChannels(Array.isArray(data) ? data : []);
    } catch (err) {
      setChannelsError("Failed to load channels. Please try again.");
    } finally {
      setChannelsLoading(false);
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

  useEffect(() => {
    if (activeTab === "authors" && authors === null && !authorsLoading) {
      void fetchAuthors();
    }
  }, [activeTab, authors, authorsLoading]);

  useEffect(() => {
    if (activeTab === "channels" && channels === null && !channelsLoading) {
      void fetchChannels();
    }
  }, [activeTab, channels, channelsLoading]);

  const handleTabChange = (tab: "books" | "videos" | "authors" | "channels") => {
    setActiveTab(tab);
    setBookModalOpen(false);
    setVideoModalOpen(false);
    setAuthorModalOpen(false);
    setChannelModalOpen(false);
    setEditingBook(null);
    setEditingVideo(null);
    setEditingAuthor(null);
    setEditingChannel(null);
  };

  const handleAddClick = () => {
    if (activeTab === "books") {
      setEditingBook(null);
      setBookModalOpen(true);
      return;
    }
    if (activeTab === "videos") {
      setEditingVideo(null);
      setVideoModalOpen(true);
      return;
    }
    if (activeTab === "channels") {
      setEditingChannel(null);
      setChannelModalOpen(true);
      return;
    }
    setEditingAuthor(null);
    setAuthorModalOpen(true);
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

  const handleEditAuthor = (authorId: string) => {
    const author = authors?.find((item) => item.id === authorId);
    if (author) {
      setEditingAuthor(author);
      setAuthorModalOpen(true);
    }
  };

  const handleDeleteAuthor = async (authorId: string) => {
    if (!confirm("Are you sure you want to delete this author?")) return;
    try {
      const response = await fetch(`/api/authors/${authorId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        window.location.reload();
        return;
      }
      const data = await response.json().catch(() => ({}));
      alert(`Failed to delete author: ${data.error || "Unknown error"}`);
    } catch (err) {
      alert("Failed to delete author. Please try again.");
    }
  };

  const handleEditChannel = (channelId: string) => {
    const channel = channels?.find((item) => item.id === channelId);
    if (channel) {
      setEditingChannel(channel);
      setChannelModalOpen(true);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm("Are you sure you want to delete this channel?")) return;
    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        window.location.reload();
        return;
      }
      const data = await response.json().catch(() => ({}));
      alert(`Failed to delete channel: ${data.error || "Unknown error"}`);
    } catch (err) {
      alert("Failed to delete channel. Please try again.");
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
          // Use direct URL for all images (Vercel proxy has issues with external URLs)
          const proxiedThumbnailUrl = book.thumbnailUrl;

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

  const renderAuthors = () => {
    if (authorsLoading) {
      return (
        <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p className="muted">Loading authors...</p>
        </div>
      );
    }

    if (authorsError) {
      return (
        <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p className="muted">{authorsError}</p>
        </div>
      );
    }

    if (!authors || authors.length === 0) {
      return (
        <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p className="muted">No authors yet. Click "Add Author" to get started!</p>
        </div>
      );
    }

    return (
      <div className="video-admin-list">
        {authors.map((author) => (
          <div key={author.id} className="panel" style={{ padding: "0.75rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
              <div style={{ flexShrink: 0, position: "relative" }}>
                {author.photoUrl ? (
                  <img
                    src={author.photoUrl}
                    alt={author.name}
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
                <button className="button button-sm" onClick={() => handleEditAuthor(author.id)}>
                  Edit
                </button>
                <button className="button button-sm button-danger" onClick={() => handleDeleteAuthor(author.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderChannels = () => {
    if (channelsLoading) {
      return (
        <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p className="muted">Loading channels...</p>
        </div>
      );
    }

    if (channelsError) {
      return (
        <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p className="muted">{channelsError}</p>
        </div>
      );
    }

    if (!channels || channels.length === 0) {
      return (
        <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p className="muted">No channels yet. Click "Add Channel" to get started!</p>
        </div>
      );
    }

    return (
      <div className="video-admin-list">
        {channels.map((channel) => (
          <div key={channel.id} className="panel" style={{ padding: "0.75rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
              <div style={{ flexShrink: 0, position: "relative" }}>
                {channel.thumbnailUrl ? (
                  <img
                    src={channel.thumbnailUrl}
                    alt={channel.name}
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
                      background: "linear-gradient(135deg, var(--accent-color), #d4835f)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "2.5rem",
                      fontWeight: 600,
                      border: "2px solid var(--border-color)",
                    }}
                  >
                    {channel.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem" }}>{channel.name}</h3>
                <p className="muted" style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem" }}>
                  {channel.channelId}
                </p>
                {channel._count && (
                  <p className="muted" style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem" }}>
                    {channel._count.videos} {channel._count.videos === 1 ? "video" : "videos"}
                  </p>
                )}
                {channel.subscriberCount && (
                  <p className="muted" style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem" }}>
                    {channel.subscriberCount.toLocaleString()} subscribers
                  </p>
                )}
                {channel.description && (
                  <p
                    className="muted"
                    style={{ margin: "0", fontSize: "0.85rem", lineHeight: 1.4 }}
                  >
                    {channel.description.length > 120 ? `${channel.description.slice(0, 117)}...` : channel.description}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                <button className="button button-sm" onClick={() => handleEditChannel(channel.id)}>
                  Edit
                </button>
                <button className="button button-sm button-danger" onClick={() => handleDeleteChannel(channel.id)}>
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
            <p className="muted">Add, edit, and organize your books, videos, and authors</p>
          </div>
          <button className="button" onClick={handleAddClick}>
            {activeTab === "books" ? "+ Add Book" : activeTab === "videos" ? "+ Add Video" : activeTab === "channels" ? "+ Add Channel" : "+ Add Author"}
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
          <button
            className="button"
            onClick={() => handleTabChange("channels")}
            style={
              activeTab === "channels"
                ? {}
                : { background: "transparent", color: "var(--accent-color)", border: "1px solid var(--accent-color)" }
            }
          >
            Channels
          </button>
          <button
            className="button"
            onClick={() => handleTabChange("authors")}
            style={
              activeTab === "authors"
                ? {}
                : { background: "transparent", color: "var(--accent-color)", border: "1px solid var(--accent-color)" }
            }
          >
            Authors
          </button>
        </div>
      </header>

      <section>
        {activeTab === "books" ? renderBooks() : activeTab === "videos" ? renderVideos() : activeTab === "channels" ? renderChannels() : renderAuthors()}
      </section>

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
      <ManageChannelsWrapper
        channel={editingChannel}
        isOpen={channelModalOpen}
        onClose={() => {
          setChannelModalOpen(false);
          setEditingChannel(null);
        }}
      />
      <ManageAuthorsWrapper
        author={editingAuthor}
        isOpen={authorModalOpen}
        onClose={() => {
          setAuthorModalOpen(false);
          setEditingAuthor(null);
        }}
      />
    </div>
  );
}
