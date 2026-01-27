import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { parseMediaUrl, isValidMediaUrl, getMediaEmbedHeight, type ParsedMediaUrl } from "@/lib/media-utils";

interface Episode {
  id: string;
  title: string;
  description?: string | null;
  externalUrl?: string | null;
  thumbnailUrl?: string | null;
  duration?: string | null;
  publishedAt?: Date | null;
  podcast: {
    id: string;
    name: string;
    slug: string;
    thumbnailUrl?: string | null;
  };
}

interface LinkedEpisode {
  id: string;
  episode: Episode;
}

interface BookEpisodeLinksProps {
  bookId?: string;
  companionMediaUrls?: string[];
}

export function BookEpisodeLinks({ bookId, companionMediaUrls = [] }: BookEpisodeLinksProps) {
  const [linkedEpisodes, setLinkedEpisodes] = useState<LinkedEpisode[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Media embed states
  const [mediaUrls, setMediaUrls] = useState<string[]>(companionMediaUrls);
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [mediaError, setMediaError] = useState("");

  // Fetch linked episodes when bookId changes
  useEffect(() => {
    if (bookId) {
      fetchLinkedEpisodes();
    }
  }, [bookId]);

  // Update media URLs when prop changes
  useEffect(() => {
    setMediaUrls(companionMediaUrls);
  }, [companionMediaUrls]);

  const fetchLinkedEpisodes = async () => {
    if (!bookId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/books/${bookId}/episodes`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setLinkedEpisodes(data.linkedEpisodes || []);
      }
    } catch (error) {
      console.error("Error fetching linked episodes:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchEpisodes = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `/api/episodes/search?q=${encodeURIComponent(query)}`
      );

      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Error searching episodes:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    searchEpisodes(value);
  };

  const linkEpisode = async (episodeId: string) => {
    if (!bookId) {
      alert("Please save the book first before linking episodes.");
      return;
    }

    try {
      const response = await fetch(`/api/books/${bookId}/episodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ episodeId }),
      });

      if (response.ok) {
        await fetchLinkedEpisodes();
        setSearchQuery("");
        setSearchResults([]);
      } else {
        const data = await response.json();
        alert(`Failed to link episode: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error linking episode:", error);
      alert("Failed to link episode. Please try again.");
    }
  };

  const unlinkEpisode = async (episodeId: string) => {
    if (!bookId) return;

    if (!confirm("Are you sure you want to unlink this episode?")) return;

    try {
      const response = await fetch(
        `/api/books/${bookId}/episodes?episodeId=${episodeId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        await fetchLinkedEpisodes();
      } else {
        const data = await response.json();
        alert(`Failed to unlink episode: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error unlinking episode:", error);
      alert("Failed to unlink episode. Please try again.");
    }
  };

  const handleAddMediaUrl = () => {
    const url = newMediaUrl.trim();
    
    if (!url) {
      setMediaError("Please enter a URL");
      return;
    }

    if (!isValidMediaUrl(url)) {
      setMediaError("Please enter a valid Apple Music or Spotify URL");
      return;
    }

    if (mediaUrls.includes(url)) {
      setMediaError("This URL is already added");
      return;
    }

    const updatedUrls = [...mediaUrls, url];
    setMediaUrls(updatedUrls);
    setNewMediaUrl("");
    setMediaError("");

    // Notify parent component to save
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("media-urls-changed", { detail: updatedUrls }));
    }
  };

  const handleRemoveMediaUrl = (urlToRemove: string) => {
    const updatedUrls = mediaUrls.filter(url => url !== urlToRemove);
    setMediaUrls(updatedUrls);

    // Notify parent component to save
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("media-urls-changed", { detail: updatedUrls }));
    }
  };

  if (!bookId) {
    return (
      <div
        style={{
          padding: "1rem",
          background: "var(--wash-color)",
          borderRadius: "8px",
          border: "1px solid var(--border-color)",
        }}
      >
        <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          Save the book first to link podcast episodes.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "1rem" }}>
        Companion Media
      </h3>
      <p
        className="muted"
        style={{ margin: "0 0 1.5rem", fontSize: "0.85rem", lineHeight: 1.5 }}
      >
        Embed Apple Music or Spotify content, or link podcast episodes from your library.
      </p>

      {/* Media Embeds Section */}
      <div style={{ marginBottom: "2rem", padding: "1rem", background: "rgba(102, 126, 234, 0.05)", borderRadius: "8px", border: "1px solid rgba(102, 126, 234, 0.2)" }}>
        <h4 style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "0.95rem", fontWeight: 600 }}>
          🎵 Apple Music / Spotify Embeds
        </h4>
        
        {/* Add Media URL Input */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <Input
            type="url"
            placeholder="Paste Apple Music or Spotify URL..."
            value={newMediaUrl}
            onChange={(e) => {
              setNewMediaUrl(e.target.value);
              setMediaError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddMediaUrl();
              }
            }}
            style={{ flex: 1 }}
          />
          <Button type="button" onClick={handleAddMediaUrl}>
            Add Embed
          </Button>
        </div>
        
        {mediaError && (
          <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "#d32f2f" }}>
            {mediaError}
          </p>
        )}

        <p className="muted" style={{ margin: "0 0 1rem", fontSize: "0.75rem", lineHeight: 1.4 }}>
          Supported formats: Apple Music albums/playlists, Spotify albums/playlists/tracks/podcasts
        </p>

        {/* Display Media Embeds */}
        {mediaUrls.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {mediaUrls.map((url, index) => {
              const parsed = parseMediaUrl(url);
              if (!parsed) return null;

              return (
                <div
                  key={index}
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    background: "var(--paper-color)",
                  }}
                >
                  <div style={{ padding: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                        {parsed.type === "apple-music" ? "🍎 Apple Music" : "🎧 Spotify"}
                      </span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "0.75rem", color: "var(--accent-color)" }}
                      >
                        Open in app ↗
                      </a>
                    </div>
                    <button
                      type="button"
                      className="button button-sm button-danger"
                      onClick={() => handleRemoveMediaUrl(url)}
                      style={{ padding: "0.25rem 0.75rem" }}
                    >
                      Remove
                    </button>
                  </div>
                  <iframe
                    src={parsed.embedUrl}
                    width="100%"
                    height={getMediaEmbedHeight(parsed.type)}
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    style={{ border: 0, display: "block" }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Podcast Episodes Section */}
      <div style={{ marginBottom: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
        <h4 style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "0.95rem", fontWeight: 600 }}>
          🎙️ Podcast Episodes from Library
        </h4>

      {/* Search for episodes */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Input
          type="text"
          placeholder="Search for episodes by title..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {searchLoading && (
          <p
            className="muted"
            style={{ margin: "0.5rem 0 0", fontSize: "0.85rem" }}
          >
            Searching...
          </p>
        )}

        {searchResults.length > 0 && (
          <div
            style={{
              marginTop: "0.5rem",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              background: "var(--paper-color)",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {searchResults.map((episode) => {
              const isLinked = linkedEpisodes.some(
                (le) => le.episode.id === episode.id
              );

              return (
                <div
                  key={episode.id}
                  style={{
                    padding: "0.75rem",
                    borderBottom: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "start",
                    gap: "0.75rem",
                  }}
                >
                  {episode.podcast.thumbnailUrl && (
                    <img
                      src={episode.podcast.thumbnailUrl}
                      alt={episode.podcast.name}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "6px",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        margin: "0 0 0.25rem",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      {episode.title}
                    </h4>
                    <p
                      className="muted"
                      style={{
                        margin: 0,
                        fontSize: "0.8rem",
                        color: "var(--accent-color)",
                      }}
                    >
                      {episode.podcast.name}
                      {episode.duration && ` • ${episode.duration}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => linkEpisode(episode.id)}
                    disabled={isLinked}
                  >
                    {isLinked ? "Linked" : "Link"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Linked episodes list */}
      {loading ? (
        <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          Loading linked episodes...
        </p>
      ) : linkedEpisodes.length > 0 ? (
        <div>
          <h4 style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
            Linked Episodes ({linkedEpisodes.length})
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {linkedEpisodes.map((linkedEpisode) => {
              const episode = linkedEpisode.episode;
              return (
                <div
                  key={episode.id}
                  style={{
                    padding: "0.75rem",
                    background: "var(--wash-color)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "start",
                    gap: "0.75rem",
                  }}
                >
                  {episode.podcast.thumbnailUrl && (
                    <img
                      src={episode.podcast.thumbnailUrl}
                      alt={episode.podcast.name}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "6px",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        margin: "0 0 0.25rem",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      {episode.title}
                    </h4>
                    <p
                      className="muted"
                      style={{
                        margin: 0,
                        fontSize: "0.8rem",
                        color: "var(--accent-color)",
                      }}
                    >
                      {episode.podcast.name}
                      {episode.duration && ` • ${episode.duration}`}
                    </p>
                  </div>
                  <button
                    className="button button-sm button-danger"
                    onClick={() => unlinkEpisode(episode.id)}
                  >
                    Unlink
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p
          className="muted"
          style={{
            margin: 0,
            fontSize: "0.85rem",
            padding: "1rem",
            background: "var(--wash-color)",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          No episodes linked yet. Search above to link episodes.
        </p>
      )}
      </div>
    </div>
  );
}
