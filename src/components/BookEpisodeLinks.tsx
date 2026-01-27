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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

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
        style={{ margin: "0 0 1rem", fontSize: "0.85rem", lineHeight: 1.5 }}
      >
        Link podcast episodes that reference or discuss this book.
      </p>

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
  );
}
