interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string | null;
  duration?: string | null;
  channelName?: string | null;
  tags: string[];
}

interface VideoCardProps {
  video: Video;
  onClick?: () => void;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  // Truncate description to 119 chars including "..."
  const shortDesc = video.description.length > 119
    ? video.description.slice(0, 116) + "..."
    : video.description;

  return (
    <div
      onClick={handleClick}
      style={{
        display: "flex",
        gap: "1rem",
        padding: "0.75rem",
        borderRadius: "12px",
        background: "var(--paper-color)",
        border: "1px solid var(--border-color)",
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      className="video-card-hover"
    >
      {/* Thumbnail with duration badge */}
      <div style={{ position: "relative", flexShrink: 0 }}>
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

      {/* Video info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            margin: "0 0 0.25rem 0",
            fontSize: "1rem",
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
              margin: "0 0 0.25rem 0",
              fontSize: "0.85rem",
              color: "var(--muted-color)",
            }}
          >
            {video.channelName}
          </p>
        )}

        <p
          style={{
            margin: "0",
            fontSize: "0.85rem",
            color: "var(--muted-color)",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {shortDesc}
        </p>

        {video.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginTop: "0.5rem" }}>
            {video.tags.slice(0, 3).map((tag) => (
              <a
                key={tag}
                href={`/videos/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontSize: "0.7rem",
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
            {video.tags.length > 3 && (
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--muted-color)",
                }}
              >
                +{video.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
