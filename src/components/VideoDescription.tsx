import { useState } from "react";

interface VideoDescriptionProps {
  description: string;
}

export function VideoDescription({ description }: VideoDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!description) return null;

  const isLong = description.length > 300;
  const displayText =
    expanded || !isLong ? description : description.slice(0, 297) + "...";

  return (
    <div
      style={{
        marginTop: "1rem",
        padding: "1rem",
        background: "var(--wash-color)",
        borderRadius: "12px",
        border: "1px solid var(--border-color)",
      }}
    >
      <p
        style={{
          margin: 0,
          whiteSpace: "pre-wrap",
          lineHeight: 1.6,
          color: "var(--muted-color)",
          fontSize: "0.9rem",
          fontFamily: "'Work Sans', 'Segoe UI', sans-serif",
        }}
      >
        {displayText}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            marginTop: "0.75rem",
            background: "none",
            border: "none",
            color: "var(--accent-color)",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.85rem",
            padding: 0,
            fontFamily: "'Work Sans', 'Segoe UI', sans-serif",
          }}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
