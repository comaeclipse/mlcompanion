import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface Video {
  id?: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  duration?: string;
  channelName?: string;
  publishedAt?: string | Date;
  tags: string[];
  pros: string[];
  cons: string[];
  category?: string;
}

interface VideoFormProps {
  video?: Video;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Channel {
  id: string;
  name: string;
  channelId: string;
}

interface LinkedBook {
  id: string;
  title: string;
  authors: string[];
  thumbnailUrl?: string | null;
}

export function VideoForm({ video, onSuccess, onCancel }: VideoFormProps) {
  const [formData, setFormData] = useState<Video>({
    title: "",
    description: "",
    url: "",
    thumbnailUrl: "",
    duration: "",
    channelName: "",
    publishedAt: "",
    tags: [],
    pros: [],
    cons: [],
    category: "",
  });
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [linkedBooks, setLinkedBooks] = useState<LinkedBook[]>([]);
  const [bookSearch, setBookSearch] = useState("");
  const [bookResults, setBookResults] = useState<LinkedBook[]>([]);
  const [bookSearching, setBookSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch available channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch("/api/channels");
        if (response.ok) {
          const data = await response.json();
          setChannels(data);
        }
      } catch (err) {
        console.error("Failed to fetch channels:", err);
      }
    };
    void fetchChannels();
  }, []);

  // Update form when video prop changes
  useEffect(() => {
    if (video) {
      setFormData({
        ...video,
        publishedAt: video.publishedAt
          ? (typeof video.publishedAt === 'string' ? video.publishedAt : video.publishedAt.toISOString())
          : "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        url: "",
        thumbnailUrl: "",
        duration: "",
        channelName: "",
        publishedAt: "",
        tags: [],
        pros: [],
        cons: [],
        category: "",
      });
      setLinkedBooks([]);
    }
  }, [video]);

  // Fetch linked books when editing an existing video
  useEffect(() => {
    if (video?.id) {
      const fetchLinkedBooks = async () => {
        try {
          const response = await fetch(`/api/videos/${video.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.linkedBooks) {
              setLinkedBooks(
                data.linkedBooks.map((lb: any) => lb.book)
              );
            }
          }
        } catch (err) {
          console.error("Failed to fetch linked books:", err);
        }
      };
      void fetchLinkedBooks();
    }
  }, [video?.id]);

  // Debounced book search
  useEffect(() => {
    if (bookSearch.length < 2) {
      setBookResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setBookSearching(true);
      try {
        const response = await fetch(`/api/books/search?q=${encodeURIComponent(bookSearch)}`);
        if (response.ok) {
          const data = await response.json();
          // Filter out already-linked books
          const linkedIds = linkedBooks.map((b) => b.id);
          setBookResults(data.filter((b: LinkedBook) => linkedIds.indexOf(b.id) === -1));
        }
      } catch (err) {
        console.error("Book search error:", err);
      } finally {
        setBookSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [bookSearch, linkedBooks]);

  const fetchMetadata = async () => {
    const url = formData.url.trim();
    if (!url) {
      setError("Enter a video URL first");
      return;
    }
    setMetaLoading(true);
    setError("");

    try {
      const response = await fetch("/api/videos/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Could not fetch metadata");
        return;
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        title: prev.title || data.title || "",
        description: prev.description || data.description || "",
        thumbnailUrl: prev.thumbnailUrl || data.thumbnailUrl || "",
        duration: prev.duration || data.duration || "",
        channelName: prev.channelName || data.channelName || "",
        publishedAt: prev.publishedAt || data.publishedAt || "",
        tags: prev.tags.length > 0 ? prev.tags : data.tags || [],
      }));
    } catch (err) {
      setError("Network error while fetching metadata");
    } finally {
      setMetaLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = video?.id ? `/api/videos/${video.id}` : "/api/videos";
    const method = video?.id ? "PUT" : "POST";

    // Prepare data with channelId and bookIds
    const submitData = {
      ...formData,
      channelId: selectedChannelId || null,
      bookIds: linkedBooks.map((b) => b.id),
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        // Call success callback to refresh data
        onSuccess();
        return;
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to save video");
      }
    } catch (err) {
      console.error("Save error:", err);
      setError("Network error - please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Video URL * (YouTube)</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
            required
            style={{ flex: 1 }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={fetchMetadata}
            disabled={metaLoading}
            title="Fetch metadata from YouTube"
            style={{ minWidth: "100px" }}
          >
            {metaLoading ? "Loading..." : "Fetch"}
          </Button>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--muted-color)", marginTop: "0.25rem" }}>
          Click "Fetch" to auto-fill title, description, duration, and tags from YouTube
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Channel</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {channels.length > 0 && (
            <select
              value={selectedChannelId}
              onChange={(e) => {
                const channelId = e.target.value;
                setSelectedChannelId(channelId);
                if (channelId) {
                  const channel = channels.find(c => c.id === channelId);
                  if (channel) {
                    setFormData({ ...formData, channelName: channel.name });
                  }
                }
              }}
              style={{
                padding: "0.5rem",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--paper-color)",
                fontSize: "0.9rem",
              }}
            >
              <option value="">Select existing channel or enter manually</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          )}
          <Input
            value={formData.channelName || ""}
            onChange={(e) => {
              setFormData({ ...formData, channelName: e.target.value });
              setSelectedChannelId(""); // Clear selection if manually typing
            }}
            placeholder={channels.length > 0 ? "Or enter manually" : "Auto-filled from YouTube"}
          />
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--muted-color)", marginTop: "0.25rem" }}>
          Select from existing channels or enter manually
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Duration (e.g., "12:34")</label>
        <Input
          value={formData.duration || ""}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          placeholder="12:34"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Published Date</label>
        <Input
          type="datetime-local"
          value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0, 16) : ""}
          onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
        <Input
          value={formData.tags.join(", ")}
          onChange={(e) =>
            setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()) })
          }
          placeholder="intro, russian revolution, marx"
        />
        <p style={{ fontSize: "0.75rem", color: "var(--muted-color)", marginTop: "0.25rem" }}>
          Separate tags with commas. Tags can contain spaces.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Pros (comma-separated)</label>
        <Input
          value={formData.pros.join(", ")}
          onChange={(e) =>
            setFormData({ ...formData, pros: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })
          }
          placeholder="essential, well-sourced, accessible"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cons (comma-separated)</label>
        <Input
          value={formData.cons.join(", ")}
          onChange={(e) =>
            setFormData({ ...formData, cons: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })
          }
          placeholder="libcoded, outdated, oversimplified"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Companion Books</label>
        <div style={{ position: "relative" }}>
          <Input
            value={bookSearch}
            onChange={(e) => setBookSearch(e.target.value)}
            placeholder="Search books by title..."
          />
          {bookSearching && (
            <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.75rem", color: "var(--muted-color)" }}>
              Searching...
            </span>
          )}
          {bookResults.length > 0 && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "var(--paper-color)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              marginTop: "4px",
              maxHeight: "200px",
              overflowY: "auto",
              zIndex: 10,
              boxShadow: "0 4px 12px rgba(67, 44, 23, 0.12)",
            }}>
              {bookResults.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => {
                    setLinkedBooks([...linkedBooks, book]);
                    setBookSearch("");
                    setBookResults([]);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "0.85rem",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  {book.thumbnailUrl && (
                    <img src={book.thumbnailUrl} alt="" style={{ width: "24px", height: "36px", objectFit: "cover", borderRadius: "2px" }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 600 }}>{book.title}</div>
                    {book.authors.length > 0 && (
                      <div style={{ fontSize: "0.75rem", color: "var(--muted-color)" }}>
                        {book.authors.join(", ")}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {linkedBooks.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
            {linkedBooks.map((book) => (
              <span
                key={book.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "4px 10px",
                  background: "var(--wash-color)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "999px",
                  fontSize: "0.8rem",
                }}
              >
                {book.title}
                <button
                  type="button"
                  onClick={() => setLinkedBooks(linkedBooks.filter((b) => b.id !== book.id))}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1rem",
                    lineHeight: 1,
                    color: "var(--muted-color)",
                    padding: 0,
                  }}
                  title="Remove"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
        <p style={{ fontSize: "0.75rem", color: "var(--muted-color)", marginTop: "0.25rem" }}>
          Link books that this video references or discusses
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : video?.id ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
