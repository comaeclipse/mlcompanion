import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface Episode {
  id?: string;
  title: string;
  description: string;
  audioUrl?: string;
  duration?: string;
  publishedAt?: string | Date;
  thumbnailUrl?: string;
  episodeNumber?: number | null;
  seasonNumber?: number | null;
  externalUrl?: string;
  tags: string[];
  pros: string[];
  cons: string[];
  podcastId: string;
}

interface Podcast {
  id: string;
  name: string;
}

interface EpisodeFormProps {
  episode?: Episode;
  podcasts: Podcast[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function EpisodeForm({ episode, podcasts, onSuccess, onCancel }: EpisodeFormProps) {
  const [formData, setFormData] = useState<Episode>({
    title: "",
    description: "",
    audioUrl: "",
    duration: "",
    publishedAt: "",
    thumbnailUrl: "",
    episodeNumber: null,
    seasonNumber: null,
    externalUrl: "",
    tags: [],
    pros: [],
    cons: [],
    podcastId: podcasts[0]?.id || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (episode) {
      setFormData({
        ...episode,
        publishedAt: episode.publishedAt
          ? (typeof episode.publishedAt === "string" ? episode.publishedAt : episode.publishedAt.toISOString())
          : "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        audioUrl: "",
        duration: "",
        publishedAt: "",
        thumbnailUrl: "",
        episodeNumber: null,
        seasonNumber: null,
        externalUrl: "",
        tags: [],
        pros: [],
        cons: [],
        podcastId: podcasts[0]?.id || "",
      });
    }
  }, [episode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const method = episode?.id ? "PUT" : "POST";
    const url = episode?.id ? `/api/episodes/${episode.id}` : "/api/episodes";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        return;
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to save episode");
      }
    } catch {
      setError("Network error - please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {error && (
        <div style={{ padding: "0.75rem", background: "#fee", border: "1px solid #fcc", borderRadius: "8px", color: "#c33", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Podcast *</label>
        <select
          value={formData.podcastId}
          onChange={(e) => setFormData({ ...formData, podcastId: e.target.value })}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "6px",
            border: "1px solid var(--border-color)",
            background: "var(--paper-color)",
            fontSize: "0.9rem",
          }}
          required
        >
          {podcasts.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Episode title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Episode description..."
          rows={3}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label className="block text-sm font-medium mb-1">Episode #</label>
          <Input
            type="number"
            value={formData.episodeNumber ?? ""}
            onChange={(e) => setFormData({ ...formData, episodeNumber: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Season #</label>
          <Input
            type="number"
            value={formData.seasonNumber ?? ""}
            onChange={(e) => setFormData({ ...formData, seasonNumber: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Audio URL</label>
        <Input
          value={formData.audioUrl || ""}
          onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
          placeholder="https://...mp3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">External Link (Spotify/Apple/etc.)</label>
        <Input
          value={formData.externalUrl || ""}
          onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
          placeholder="https://open.spotify.com/episode/..."
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label className="block text-sm font-medium mb-1">Duration</label>
          <Input
            value={formData.duration || ""}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="45:30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Published Date</label>
          <Input
            type="datetime-local"
            value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0, 16) : ""}
            onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
        <Input
          value={formData.tags.join(", ")}
          onChange={(e) =>
            setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })
          }
          placeholder="history, imperialism, theory"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Pros (comma-separated)</label>
        <Input
          value={formData.pros.join(", ")}
          onChange={(e) =>
            setFormData({ ...formData, pros: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })
          }
          placeholder="well-sourced, accessible"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cons (comma-separated)</label>
        <Input
          value={formData.cons.join(", ")}
          onChange={(e) =>
            setFormData({ ...formData, cons: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })
          }
          placeholder="libcoded, oversimplified"
        />
      </div>

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : episode?.id ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
