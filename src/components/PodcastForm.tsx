import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface Podcast {
  id?: string;
  name: string;
  description: string;
  thumbnailUrl?: string;
  feedUrl?: string;
  websiteUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  soundcloudUrl?: string;
  author?: string;
  tags: string[];
}

interface PodcastFormProps {
  podcast?: Podcast;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PodcastForm({ podcast, onSuccess, onCancel }: PodcastFormProps) {
  const [formData, setFormData] = useState<Podcast>({
    name: "",
    description: "",
    thumbnailUrl: "",
    feedUrl: "",
    websiteUrl: "",
    spotifyUrl: "",
    appleUrl: "",
    soundcloudUrl: "",
    author: "",
    tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (podcast) {
      setFormData({ ...podcast });
    } else {
      setFormData({
        name: "",
        description: "",
        thumbnailUrl: "",
        feedUrl: "",
        websiteUrl: "",
        spotifyUrl: "",
        appleUrl: "",
        soundcloudUrl: "",
        author: "",
        tags: [],
      });
    }
  }, [podcast]);

  const fetchFeed = async () => {
    if (!formData.feedUrl && !formData.appleUrl && !formData.soundcloudUrl) return;
    setFeedLoading(true);
    setError("");

    try {
      const response = await fetch("/api/podcasts/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedUrl: formData.feedUrl,
          appleUrl: formData.appleUrl,
          soundcloudUrl: formData.soundcloudUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Could not fetch feed");
        return;
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        name: prev.name || data.podcast.title || "",
        description: prev.description || data.podcast.description || "",
        author: prev.author || data.podcast.author || "",
        thumbnailUrl: prev.thumbnailUrl || data.podcast.imageUrl || "",
        websiteUrl: prev.websiteUrl || data.podcast.link || "",
        feedUrl: prev.feedUrl || data.feedUrl || "",
      }));
    } catch {
      setError("Network error fetching feed");
    } finally {
      setFeedLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const method = podcast?.id ? "PUT" : "POST";
    const url = podcast?.id ? `/api/podcasts/${podcast.id}` : "/api/podcasts";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        window.location.reload();
        return;
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to save podcast");
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
        <label className="block text-sm font-medium mb-1">RSS Feed URL</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Input
            value={formData.feedUrl || ""}
            onChange={(e) => setFormData({ ...formData, feedUrl: e.target.value })}
            placeholder="https://feeds.example.com/podcast.xml"
            style={{ flex: 1 }}
          />
          <Button
            type="button"
            onClick={fetchFeed}
            disabled={feedLoading || (!formData.feedUrl && !formData.appleUrl && !formData.soundcloudUrl)}
          >
            {feedLoading ? "..." : "Fetch"}
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Podcast name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Author</label>
        <Input
          value={formData.author || ""}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          placeholder="Host or network name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="About this podcast..."
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
        <Input
          value={formData.thumbnailUrl || ""}
          onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Spotify URL</label>
        <Input
          value={formData.spotifyUrl || ""}
          onChange={(e) => setFormData({ ...formData, spotifyUrl: e.target.value })}
          placeholder="https://open.spotify.com/show/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Apple Podcasts URL</label>
        <Input
          value={formData.appleUrl || ""}
          onChange={(e) => setFormData({ ...formData, appleUrl: e.target.value })}
          placeholder="https://podcasts.apple.com/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">SoundCloud URL</label>
        <Input
          value={formData.soundcloudUrl || ""}
          onChange={(e) => setFormData({ ...formData, soundcloudUrl: e.target.value })}
          placeholder="https://soundcloud.com/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Website URL</label>
        <Input
          value={formData.websiteUrl || ""}
          onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
        <Input
          value={formData.tags.join(", ")}
          onChange={(e) =>
            setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })
          }
          placeholder="marxism, history, theory"
        />
      </div>

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : podcast?.id ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
