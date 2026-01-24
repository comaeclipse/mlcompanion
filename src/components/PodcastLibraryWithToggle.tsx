import { useState, useEffect } from "react";
import { LayoutList, Grid2x2 } from "lucide-react";
import { PodcastCard } from "./PodcastCard";

interface Podcast {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  author?: string | null;
  tags: string[];
  _count?: { episodes: number };
}

interface PodcastLibraryWithToggleProps {
  podcasts: Podcast[];
}

export function PodcastLibraryWithToggle({ podcasts }: PodcastLibraryWithToggleProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    const saved = localStorage.getItem("podcastViewMode");
    if (saved === "grid" || saved === "list") {
      setViewMode(saved);
    }
  }, []);

  const toggleView = (mode: "list" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("podcastViewMode", mode);
  };

  return (
    <>
      {/* View Toggle */}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button
          onClick={() => toggleView("list")}
          style={{
            padding: "0.5rem",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            background: viewMode === "list" ? "var(--accent-color)" : "var(--paper-color)",
            color: viewMode === "list" ? "white" : "var(--ink-color)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="List view"
        >
          <LayoutList size={20} />
        </button>
        <button
          onClick={() => toggleView("grid")}
          style={{
            padding: "0.5rem",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            background: viewMode === "grid" ? "var(--accent-color)" : "var(--paper-color)",
            color: viewMode === "grid" ? "white" : "var(--ink-color)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Grid view"
        >
          <Grid2x2 size={20} />
        </button>
      </div>

      {/* Podcasts Display */}
      {viewMode === "list" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {podcasts.map((podcast) => (
            <a key={podcast.id} href={`/podcasts/show/${podcast.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <PodcastCard podcast={podcast} />
            </a>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {podcasts.map((podcast) => (
            <a
              key={podcast.id}
              href={`/podcasts/show/${podcast.slug}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "block",
                borderRadius: "12px",
                overflow: "hidden",
                background: "var(--paper-color)",
                border: "1px solid var(--border-color)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              className="video-card-hover"
            >
              {/* Cover */}
              <div style={{ position: "relative" }}>
                {podcast.thumbnailUrl ? (
                  <img
                    src={podcast.thumbnailUrl}
                    alt={podcast.name}
                    style={{
                      width: "100%",
                      aspectRatio: "1/1",
                      objectFit: "cover",
                      display: "block",
                      background: "#222",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1/1",
                      background: "linear-gradient(135deg, #7b2d8b, #4a1a5e)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "3rem",
                      fontWeight: 700,
                    }}
                  >
                    {podcast.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "1rem" }}>
                <h3
                  style={{
                    margin: "0 0 0.25rem 0",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    lineHeight: 1.3,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {podcast.name}
                </h3>

                {podcast.author && (
                  <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.8rem", color: "var(--muted-color)" }}>
                    {podcast.author}
                  </p>
                )}

                {podcast._count && (
                  <p style={{ margin: "0", fontSize: "0.75rem", color: "var(--muted-color)" }}>
                    {podcast._count.episodes} episode{podcast._count.episodes !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
