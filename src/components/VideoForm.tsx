import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface Video {
  id?: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  duration?: string;
  channelName?: string;
  publishedAt?: string | Date;
  tags: string[];
  category?: string;
}

interface VideoFormProps {
  video?: Video;
  onSuccess: () => void;
  onCancel: () => void;
}

export function VideoForm({ video, onSuccess, onCancel }: VideoFormProps) {
  const [formData, setFormData] = useState<Video>({
    title: "",
    description: "",
    url: "",
    thumbnailUrl: "",
    duration: "",
    channelName: "",
    publishedAt: "",
    tags: [],
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [error, setError] = useState("");

  // Update form when video prop changes
  useEffect(() => {
    if (video) {
      setFormData({
        ...video,
        publishedAt: video.publishedAt 
          ? (typeof video.publishedAt === 'string' ? video.publishedAt : video.publishedAt.toISOString())
          : "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        url: "",
        thumbnailUrl: "",
        duration: "",
        channelName: "",
        publishedAt: "",
        tags: [],
        category: "",
      });
    }
  }, [video]);

  const fetchMetadata = async () => {
    const url = formData.url.trim();
    if (!url) {
      setError("Enter a video URL first");
      return;
    }
    setMetaLoading(true);
    setError("");

    try {
      const response = await fetch("/api/videos/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Could not fetch metadata");
        return;
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        title: prev.title || data.title || "",
        description: prev.description || data.description || "",
        thumbnailUrl: prev.thumbnailUrl || data.thumbnailUrl || "",
        duration: prev.duration || data.duration || "",
        channelName: prev.channelName || data.channelName || "",
        publishedAt: prev.publishedAt || data.publishedAt || "",
        tags: prev.tags.length > 0 ? prev.tags : data.tags || [],
      }));
    } catch (err) {
      setError("Network error while fetching metadata");
    } finally {
      setMetaLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = video?.id ? `/api/videos/${video.id}` : "/api/videos";
    const method = video?.id ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Reload page directly instead of relying on callback
        window.location.reload();
        return;
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to save video");
      }
    } catch (err) {
      console.error("Save error:", err);
      setError("Network error - please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Video URL * (YouTube)</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
            required
            style={{ flex: 1 }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={fetchMetadata}
            disabled={metaLoading}
            title="Fetch metadata from YouTube"
            style={{ minWidth: "100px" }}
          >
            {metaLoading ? "Loading..." : "Fetch"}
          </Button>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--muted-color)", marginTop: "0.25rem" }}>
          Click "Fetch" to auto-fill title, description, duration, and tags from YouTube
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Channel Name</label>
        <Input
          value={formData.channelName || ""}
          onChange={(e) => setFormData({ ...formData, channelName: e.target.value })}
          placeholder="Auto-filled from YouTube"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Duration (e.g., "12:34")</label>
        <Input
          value={formData.duration || ""}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          placeholder="12:34"
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

      <div>
        <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
        <Input
          value={formData.tags.join(", ")}
          onChange={(e) =>
            setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()) })
          }
          placeholder="intro, russian revolution, marx"
        />
        <p style={{ fontSize: "0.75rem", color: "var(--muted-color)", marginTop: "0.25rem" }}>
          Separate tags with commas. Tags can contain spaces.
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : video?.id ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
