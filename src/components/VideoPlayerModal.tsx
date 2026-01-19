import { useState } from "react";

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

interface VideoPlayerModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle youtu.be format
    if (urlObj.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${urlObj.pathname}`;
    }
    
    // Handle youtube.com/watch format
    const videoId = urlObj.searchParams.get("v");
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle /shorts/ or /embed/ format
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    if (pathParts.length >= 2 && (pathParts[0] === "shorts" || pathParts[0] === "embed")) {
      return `https://www.youtube.com/embed/${pathParts[1]}`;
    }
    
    return null;
  } catch {
    return null;
  }
}

export function VideoPlayerModal({ video, isOpen, onClose }: VideoPlayerModalProps) {
  if (!isOpen || !video) return null;

  const embedUrl = getYouTubeEmbedUrl(video.url);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        overflowY: "auto",
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          background: "var(--paper-color)",
          borderRadius: "16px",
          maxWidth: "700px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "rgba(0,0,0,0.5)",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            cursor: "pointer",
            fontSize: "20px",
            zIndex: 10,
          }}
          title="Close"
        >
          ×
        </button>

        {/* Video player */}
        {embedUrl ? (
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%", // 16:9 aspect ratio
              height: 0,
              borderRadius: "16px 16px 0 0",
              overflow: "hidden",
              background: "#000",
            }}
          >
            <iframe
              src={embedUrl}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              background: "#000",
              color: "white",
              borderRadius: "16px 16px 0 0",
            }}
          >
            <p>Unable to load video player</p>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent-color)", textDecoration: "underline" }}
            >
              Watch on YouTube
            </a>
          </div>
        )}

        {/* Video details */}
        <div style={{ padding: "1.5rem" }}>
          <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>{video.title}</h2>
          
          {video.channelName && (
            <p style={{ fontSize: "0.9rem", color: "var(--muted-color)", margin: "0 0 0.5rem 0" }}>
              <a 
                href={`/videos/channel/${video.channelName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`}
                style={{ color: "var(--ink-color)", textDecoration: "none", fontWeight: 500 }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.textDecoration = "none";
                }}
              >
                {video.channelName}
              </a>
              {video.duration && <span> • {video.duration}</span>}
            </p>
          )}

          {video.publishedAt && (
            <p style={{ fontSize: "0.85rem", color: "var(--muted-color)", margin: "0 0 1rem 0" }}>
              Published: {new Date(video.publishedAt).toLocaleDateString()}
            </p>
          )}

          {video.description && (
            <p
              style={{
                margin: "1rem 0",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
                color: "var(--muted-color)",
              }}
            >
              {video.description}
            </p>
          )}

          {video.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
              {video.tags.map((tag) => (
                <a
                  key={tag}
                  href={`/videos/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                  className="pill"
                  style={{
                    textDecoration: "none",
                    cursor: "pointer",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.opacity = "0.7";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.opacity = "1";
                  }}
                >
                  {tag}
                </a>
              ))}
            </div>
          )}

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem" }}>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="button"
              style={{ textDecoration: "none", display: "inline-block" }}
            >
              Watch on YouTube
            </a>
            <button onClick={onClose} className="button" style={{ background: "var(--wash-color)", color: "var(--ink-color)" }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
