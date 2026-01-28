import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
}

export function BookEpisodeLinks({ bookId }: BookEpisodeLinksProps) {
  const [linkedEpisodes, setLinkedEpisodes] = useState<LinkedEpisode[]>([]);
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);

  // Fetch linked episodes when bookId changes
  useEffect(() => {
    if (bookId) {
      fetchLinkedEpisodes();
    }
  }, [bookId]);

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

  const handleAddByUrl = async () => {
    if (!bookId) {
      alert("Please save the book first before linking episodes.");
      return;
    }

    if (!urlInput.trim()) {
      alert("Please enter a Spotify or Apple Podcasts URL.");
      return;
    }

    setUrlLoading(true);
    try {
      // Create episode from URL
      const createResponse = await fetch("/api/episodes/create-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ externalUrl: urlInput.trim() }),
      });

      if (!createResponse.ok) {
        const data = await createResponse.json();
        alert(`Failed to create episode: ${data.error || "Unknown error"}`);
        return;
      }

      const { episode } = await createResponse.json();

      // Link episode to book
      const linkResponse = await fetch(`/api/books/${bookId}/episodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ episodeId: episode.id }),
      });

      if (linkResponse.ok) {
        await fetchLinkedEpisodes();
        setUrlInput("");
      } else {
        const data = await linkResponse.json();
        alert(`Failed to link episode: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error adding episode by URL:", error);
      alert("Failed to add episode. Please try again.");
    } finally {
      setUrlLoading(false);
    }
  };

  const unlinkEpisode = async (episodeId: string) => {
    if (!bookId) return;

    if (!confirm("Remove this episode?")) return;

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
        alert(`Failed to remove: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error unlinking episode:", error);
      alert("Failed to remove. Please try again.");
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
          Save the book first to add companion media.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1rem" }}>
        Companion Media
      </h3>
      <p
        className="muted"
        style={{ margin: "0 0 1rem", fontSize: "0.85rem" }}
      >
        Add podcast episodes that discuss this book.
      </p>

      {/* Add by URL - ONE simple input */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Input
            type="url"
            placeholder="Paste Spotify or Apple Podcasts URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddByUrl();
              }
            }}
            disabled={urlLoading}
          />
          <Button
            type="button"
            onClick={handleAddByUrl}
            disabled={urlLoading || !urlInput.trim()}
          >
            {urlLoading ? "Adding..." : "Add"}
          </Button>
        </div>
        <p
          className="muted"
          style={{ margin: "0.5rem 0 0", fontSize: "0.75rem" }}
        >
          Example: open.spotify.com/episode/... or podcasts.apple.com/...
        </p>
      </div>

      {/* Linked episodes list */}
      {loading ? (
        <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          Loading...
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
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  {episode.podcast?.thumbnailUrl && (
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
                      }}
                    >
                      {episode.podcast?.name || "External Podcast"}
                      {episode.duration && ` • ${episode.duration}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button button-sm button-danger"
                    onClick={() => unlinkEpisode(episode.id)}
                  >
                    Remove
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
          No episodes linked yet.
        </p>
      )}
    </div>
  );
}
