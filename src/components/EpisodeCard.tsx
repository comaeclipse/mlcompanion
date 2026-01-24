interface Episode {
  id: string;
  title: string;
  description?: string | null;
  duration?: string | null;
  publishedAt?: string | Date | null;
  episodeNumber?: number | null;
  seasonNumber?: number | null;
}

interface EpisodeCardProps {
  episode: Episode;
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  const dateStr = episode.publishedAt
    ? new Date(episode.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : null;

  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        padding: "0.75rem",
        borderRadius: "12px",
        background: "var(--paper-color)",
        border: "1px solid var(--border-color)",
        transition: "transform 0.15s, box-shadow 0.15s",
        alignItems: "center",
      }}
      className="video-card-hover"
    >
      {/* Episode number */}
      <div
        style={{
          flexShrink: 0,
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: "rgba(123, 45, 139, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#7b2d8b",
          fontWeight: 700,
          fontSize: "0.85rem",
        }}
      >
        {episode.episodeNumber || "•"}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            margin: 0,
            fontSize: "0.95rem",
            fontWeight: 600,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {episode.title}
        </h3>
        {episode.description && (
          <p
            style={{
              margin: "0.2rem 0 0",
              fontSize: "0.82rem",
              color: "var(--muted-color)",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {episode.description}
          </p>
        )}
      </div>

      {/* Meta */}
      <div style={{ display: "flex", gap: "0.75rem", flexShrink: 0, alignItems: "center" }}>
        {episode.duration && (
          <span style={{ fontSize: "0.78rem", color: "var(--muted-color)" }}>{episode.duration}</span>
        )}
        {dateStr && (
          <span style={{ fontSize: "0.78rem", color: "var(--muted-color)" }}>{dateStr}</span>
        )}
      </div>
    </div>
  );
}
