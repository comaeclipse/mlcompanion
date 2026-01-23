interface RelatedVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string | null;
  duration?: string | null;
  channelName?: string | null;
}

interface RelatedVideosProps {
  videos: RelatedVideo[];
}

function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname.toLowerCase();

    if (host === "youtu.be") {
      return urlObj.pathname.slice(1).split("/")[0] || null;
    }

    if (host.indexOf("youtube.com") !== -1) {
      const searchId = urlObj.searchParams.get("v");
      if (searchId) return searchId;
      const parts = urlObj.pathname.split("/").filter(Boolean);
      if (
        parts.length >= 2 &&
        (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "v")
      ) {
        return parts[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function RelatedVideos({ videos }: RelatedVideosProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {videos.map((video) => {
        const ytId = extractVideoId(video.url);
        const watchUrl = ytId ? `/video/${ytId}` : video.url;

        return (
          <a
            key={video.id}
            href={watchUrl}
            className="related-video-card"
            style={{
              display: "flex",
              gap: "0.75rem",
              padding: "0.5rem",
              borderRadius: "10px",
              textDecoration: "none",
              color: "inherit",
              transition: "background 0.15s",
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  style={{
                    width: "140px",
                    height: "79px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    background: "#222",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "140px",
                    height: "79px",
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, var(--accent-color), #d4835f)",
                  }}
                />
              )}
              {video.duration && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    right: "4px",
                    background: "rgba(0,0,0,0.8)",
                    color: "white",
                    padding: "1px 5px",
                    borderRadius: "3px",
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    fontFamily: "'Work Sans', sans-serif",
                  }}
                >
                  {video.duration}
                </span>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h4
                style={{
                  margin: 0,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  fontFamily: "'Work Sans', 'Segoe UI', sans-serif",
                }}
              >
                {video.title}
              </h4>
              {video.channelName && (
                <p
                  style={{
                    margin: "0.25rem 0 0",
                    fontSize: "0.75rem",
                    color: "var(--muted-color)",
                    fontFamily: "'Work Sans', 'Segoe UI', sans-serif",
                  }}
                >
                  {video.channelName}
                </p>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}
