import { useState, useEffect } from "react";
import { LayoutList, Grid2x2 } from "lucide-react";
import { VideoCard } from "./VideoCard";
import { VideoPlayerModal } from "./VideoPlayerModal";

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string | null;
  duration?: string | null;
  channelName?: string | null;
  publishedAt?: Date | null;
  tags: string[];
}

interface VideoLibraryWithToggleProps {
  videos: Video[];
}

export function VideoLibraryWithToggle({ videos }: VideoLibraryWithToggleProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Load view preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("videoViewMode");
    if (saved === "grid" || saved === "list") {
      setViewMode(saved);
    }
  }, []);

  // Save view preference
  const toggleView = (mode: "list" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("videoViewMode", mode);
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

      {/* Videos Display */}
      {viewMode === "list" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={() => setSelectedVideo(video)}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              style={{
                cursor: "pointer",
                borderRadius: "12px",
                overflow: "hidden",
                background: "var(--paper-color)",
                border: "1px solid var(--border-color)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              className="video-card-hover"
            >
              {/* Thumbnail */}
              <div style={{ position: "relative" }}>
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    style={{
                      width: "100%",
                      aspectRatio: "16/9",
                      objectFit: "cover",
                      display: "block",
                      background: "#222",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "16/9",
                      background: "#222",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#666",
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
                      bottom: "8px",
                      right: "8px",
                      background: "rgba(0,0,0,0.8)",
                      color: "white",
                      padding: "3px 6px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    {video.duration}
                  </span>
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
                  {video.title}
                </h3>
                
                {video.channelName && (
                  <p
                    style={{
                      margin: "0 0 0.5rem 0",
                      fontSize: "0.8rem",
                      color: "var(--muted-color)",
                    }}
                  >
                    {video.channelName}
                  </p>
                )}

                {video.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginTop: "0.5rem" }}>
                    {video.tags.slice(0, 2).map((tag) => (
                      <a
                        key={tag}
                        href={`/videos/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: "0.65rem",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "rgba(156, 92, 46, 0.12)",
                          color: "var(--accent-color)",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          textDecoration: "none",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.background = "rgba(156, 92, 46, 0.25)";
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.background = "rgba(156, 92, 46, 0.12)";
                        }}
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <VideoPlayerModal
        video={selectedVideo}
        isOpen={selectedVideo !== null}
        onClose={() => setSelectedVideo(null)}
      />
    </>
  );
}
