import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface Podcast {
  id?: string;
  name: string;
  description: string;
  thumbnailUrl?: string;
  feedUrl?: string;
  websiteUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  soundcloudUrl?: string;
  author?: string;
  tags: string[];
}

interface SearchResult {
  name: string;
  author: string;
  artworkUrl: string;
  feedUrl: string;
  itunesId: number | null;
  episodeCount: number;
  categories: string[];
}

interface PodcastFormProps {
  podcast?: Podcast;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PodcastForm({ podcast, onSuccess, onCancel }: PodcastFormProps) {
  const [formData, setFormData] = useState<Podcast>({
    name: "",
    description: "",
    thumbnailUrl: "",
    feedUrl: "",
    websiteUrl: "",
    spotifyUrl: "",
    appleUrl: "",
    soundcloudUrl: "",
    author: "",
    tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(false);
  const [error, setError] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (podcast) {
      setFormData({ ...podcast });
    } else {
      setFormData({
        name: "",
        description: "",
        thumbnailUrl: "",
        feedUrl: "",
        websiteUrl: "",
        spotifyUrl: "",
        appleUrl: "",
        soundcloudUrl: "",
        author: "",
        tags: [],
      });
    }
  }, [podcast]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    setSearchLoading(true);
    setError("");
    setSearchResults([]);

    try {
      const response = await fetch("/api/podcasts/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Search failed");
        return;
      }

      const data = await response.json();
      setSearchResults(data.results || []);
      if (data.results.length === 0) {
        setError("No podcasts found for that query");
      }
    } catch {
      setError("Network error during search");
    } finally {
      setSearchLoading(false);
    }
  };

  const selectSearchResult = (result: SearchResult) => {
    setFormData((prev) => ({
      ...prev,
      name: result.name || prev.name,
      author: result.author || prev.author,
      thumbnailUrl: result.artworkUrl || prev.thumbnailUrl,
      feedUrl: result.feedUrl || prev.feedUrl,
      tags: result.categories.length > 0 ? result.categories : prev.tags,
    }));
    setSearchResults([]);
    setShowSearch(false);
    setSearchQuery("");

    // Auto-fetch full metadata if we have a feed URL
    if (result.feedUrl) {
      setTimeout(() => fetchFeedWithUrl(result.feedUrl), 100);
    }
  };

  const fetchFeedWithUrl = async (url: string) => {
    setFeedLoading(true);
    setError("");

    try {
      const response = await fetch("/api/podcasts/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedUrl: url }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Could not fetch feed");
        return;
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        name: data.podcast.title || prev.name,
        description: data.podcast.description || prev.description,
        author: data.podcast.author || prev.author,
        thumbnailUrl: data.podcast.imageUrl || prev.thumbnailUrl,
        websiteUrl: data.podcast.link || prev.websiteUrl,
        feedUrl: data.feedUrl || prev.feedUrl,
      }));
    } catch {
      setError("Network error fetching feed");
    } finally {
      setFeedLoading(false);
    }
  };

  const fetchFeed = async () => {
    if (!formData.feedUrl && !formData.appleUrl && !formData.soundcloudUrl) return;
    setFeedLoading(true);
    setError("");

    try {
      const response = await fetch("/api/podcasts/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedUrl: formData.feedUrl,
          appleUrl: formData.appleUrl,
          soundcloudUrl: formData.soundcloudUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Could not fetch feed");
        return;
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        name: prev.name || data.podcast.title || "",
        description: prev.description || data.podcast.description || "",
        author: prev.author || data.podcast.author || "",
        thumbnailUrl: prev.thumbnailUrl || data.podcast.imageUrl || "",
        websiteUrl: prev.websiteUrl || data.podcast.link || "",
        feedUrl: prev.feedUrl || data.feedUrl || "",
      }));
    } catch {
      setError("Network error fetching feed");
    } finally {
      setFeedLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const method = podcast?.id ? "PUT" : "POST";
    const url = podcast?.id ? `/api/podcasts/${podcast.id}` : "/api/podcasts";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        window.location.reload();
        return;
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to save podcast");
      }
    } catch {
      setError("Network error - please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {error && (
        <div style={{ padding: "0.75rem", background: "#fee", border: "1px solid #fcc", borderRadius: "8px", color: "#c33", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {/* Search by name */}
      {!podcast?.id && (
        <div style={{ borderBottom: "1px solid #e5e5e5", paddingBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <label className="block text-sm font-medium">Search by Name</label>
            {!showSearch && (
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                style={{ fontSize: "0.8rem", color: "#7b2d8b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                or enter URL manually
              </button>
            )}
          </div>
          {showSearch ? null : (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
                placeholder="Search podcasts by name..."
                style={{ flex: 1 }}
              />
              <Button
                type="button"
                onClick={handleSearch}
                disabled={searchLoading || searchQuery.trim().length < 2}
              >
                {searchLoading ? "..." : "Search"}
              </Button>
            </div>
          )}

          {/* Search results */}
          {searchResults.length > 0 && (
            <div style={{ marginTop: "0.75rem", maxHeight: "300px", overflowY: "auto", border: "1px solid #e5e5e5", borderRadius: "8px" }}>
              {searchResults.map((result, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectSearchResult(result)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    width: "100%",
                    padding: "0.75rem",
                    border: "none",
                    borderBottom: i < searchResults.length - 1 ? "1px solid #f0f0f0" : "none",
                    background: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f5fb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {result.artworkUrl ? (
                    <img
                      src={result.artworkUrl}
                      alt=""
                      style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: "40px", height: "40px", borderRadius: "6px", background: "#e8d5f0", flexShrink: 0 }} />
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {result.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {result.author}{result.episodeCount ? ` \u00b7 ${result.episodeCount} episodes` : ""}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">RSS Feed URL</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Input
            value={formData.feedUrl || ""}
            onChange={(e) => setFormData({ ...formData, feedUrl: e.target.value })}
            placeholder="https://feeds.example.com/podcast.xml"
            style={{ flex: 1 }}
          />
          <Button
            type="button"
            onClick={fetchFeed}
            disabled={feedLoading || (!formData.feedUrl && !formData.appleUrl && !formData.soundcloudUrl)}
          >
            {feedLoading ? "..." : "Fetch"}
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Podcast name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Author</label>
        <Input
          value={formData.author || ""}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          placeholder="Host or network name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="About this podcast..."
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
        <Input
          value={formData.thumbnailUrl || ""}
          onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Spotify URL</label>
        <Input
          value={formData.spotifyUrl || ""}
          onChange={(e) => setFormData({ ...formData, spotifyUrl: e.target.value })}
          placeholder="https://open.spotify.com/show/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Apple Podcasts URL</label>
        <Input
          value={formData.appleUrl || ""}
          onChange={(e) => setFormData({ ...formData, appleUrl: e.target.value })}
          placeholder="https://podcasts.apple.com/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">SoundCloud URL</label>
        <Input
          value={formData.soundcloudUrl || ""}
          onChange={(e) => setFormData({ ...formData, soundcloudUrl: e.target.value })}
          placeholder="https://soundcloud.com/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Website URL</label>
        <Input
          value={formData.websiteUrl || ""}
          onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
        <Input
          value={formData.tags.join(", ")}
          onChange={(e) =>
            setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })
          }
          placeholder="marxism, history, theory"
        />
      </div>

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : podcast?.id ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
