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

interface PodcastCardProps {
  podcast: Podcast;
}

export function PodcastCard({ podcast }: PodcastCardProps) {
  const shortDesc = podcast.description && podcast.description.length > 119
    ? podcast.description.slice(0, 116) + "..."
    : podcast.description;

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
      }}
      className="video-card-hover"
    >
      {/* Thumbnail */}
      <div style={{ flexShrink: 0 }}>
        {podcast.thumbnailUrl ? (
          <img
            src={podcast.thumbnailUrl}
            alt={podcast.name}
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              borderRadius: "12px",
              background: "#222",
            }}
          />
        ) : (
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7b2d8b, #4a1a5e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "2rem",
              fontWeight: 700,
            }}
          >
            {podcast.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
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
          {podcast.name}
        </h3>

        {podcast.author && (
          <p
            style={{
              margin: "0 0 0.25rem 0",
              fontSize: "0.85rem",
              color: "var(--muted-color)",
            }}
          >
            {podcast.author}
          </p>
        )}

        {shortDesc && (
          <p
            style={{
              margin: "0 0 0.25rem 0",
              fontSize: "0.85rem",
              color: "var(--muted-color)",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {shortDesc}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.25rem" }}>
          {podcast._count && (
            <span style={{ fontSize: "0.78rem", color: "var(--muted-color)" }}>
              {podcast._count.episodes} episode{podcast._count.episodes !== 1 ? "s" : ""}
            </span>
          )}
          {podcast.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
              {podcast.tags.slice(0, 3).map((tag) => (
                <a
                  key={tag}
                  href={`/podcasts/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: "0.7rem",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: "rgba(123, 45, 139, 0.12)",
                    color: "#7b2d8b",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = "rgba(123, 45, 139, 0.25)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = "rgba(123, 45, 139, 0.12)";
                  }}
                >
                  {tag}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
