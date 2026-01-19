import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface Channel {
  id?: string;
  channelId: string;
  name: string;
  slug: string;
  url?: string;
  description?: string;
  thumbnailUrl?: string;
  subscriberCount?: number;
  videoCount?: number;
  viewCount?: number;
  customUrl?: string;
  country?: string;
  publishedAt?: string | Date;
}

interface ChannelFormProps {
  channel?: Channel;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ChannelForm({ channel, onSuccess, onCancel }: ChannelFormProps) {
  const [formData, setFormData] = useState<Channel>({
    channelId: "",
    name: "",
    slug: "",
    url: "",
    description: "",
    thumbnailUrl: "",
    subscriberCount: undefined,
    videoCount: undefined,
    viewCount: undefined,
    customUrl: "",
    country: "",
    publishedAt: "",
  });
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (channel) {
      setFormData({
        ...channel,
        publishedAt: channel.publishedAt
          ? typeof channel.publishedAt === "string"
            ? channel.publishedAt
            : channel.publishedAt.toISOString()
          : "",
      });
    } else {
      setFormData({
        channelId: "",
        name: "",
        slug: "",
        url: "",
        description: "",
        thumbnailUrl: "",
        subscriberCount: undefined,
        videoCount: undefined,
        viewCount: undefined,
        customUrl: "",
        country: "",
        publishedAt: "",
      });
    }
  }, [channel]);

  const fetchMetadata = async () => {
    const input = formData.channelId || formData.url || formData.customUrl;
    if (!input.trim()) {
      setError("Enter a channel ID, URL, or @handle first");
      return;
    }
    setMetaLoading(true);
    setError("");

    try {
      const response = await fetch("/api/channels/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Could not fetch metadata");
        return;
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        channelId: data.channelId || prev.channelId,
        name: data.name || prev.name,
        slug: data.slug || prev.slug,
        url: data.url || prev.url,
        description: data.description || prev.description,
        thumbnailUrl: data.thumbnailUrl || prev.thumbnailUrl,
        subscriberCount: data.subscriberCount ?? prev.subscriberCount,
        videoCount: data.videoCount ?? prev.videoCount,
        viewCount: data.viewCount ?? prev.viewCount,
        customUrl: data.customUrl || prev.customUrl,
        country: data.country || prev.country,
        publishedAt: data.publishedAt || prev.publishedAt,
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

    const url = channel?.id ? `/api/channels/${channel.id}` : "/api/channels";
    const method = channel?.id ? "PUT" : "POST";

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
        setError(data.error || "Failed to save channel");
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
        <label className="block text-sm font-medium mb-1">
          YouTube Channel ID, URL, or @handle *
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Input
            value={formData.channelId || formData.url || formData.customUrl || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                channelId: e.target.value.startsWith("UC") ? e.target.value : "",
                url: e.target.value.includes("youtube.com") ? e.target.value : "",
                customUrl: e.target.value.startsWith("@") ? e.target.value : "",
              })
            }
            placeholder="UC... or https://youtube.com/channel/... or @handle"
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
          Click "Fetch" to auto-fill channel details from YouTube API
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Channel Name *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Slug (URL-friendly) *</label>
        <Input
          value={formData.slug}
          onChange={(e) =>
            setFormData({
              ...formData,
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
            })
          }
          placeholder="second-thought"
          required
        />
        <p style={{ fontSize: "0.75rem", color: "var(--muted-color)", marginTop: "0.25rem" }}>
          Used in URLs: /videos/channel/{formData.slug}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
        <Input
          type="url"
          value={formData.thumbnailUrl || ""}
          onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
        <div>
          <label className="block text-sm font-medium mb-1">Subscribers</label>
          <Input
            type="number"
            value={formData.subscriberCount || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                subscriberCount: e.target.value ? parseInt(e.target.value, 10) : undefined,
              })
            }
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Videos</label>
          <Input
            type="number"
            value={formData.videoCount || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                videoCount: e.target.value ? parseInt(e.target.value, 10) : undefined,
              })
            }
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Views</label>
          <Input
            type="number"
            value={formData.viewCount || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                viewCount: e.target.value ? parseInt(e.target.value, 10) : undefined,
              })
            }
            placeholder="0"
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : channel?.id ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
