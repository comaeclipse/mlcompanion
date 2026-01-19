import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { getProxiedImageUrl } from "@/lib/image-utils";

interface Author {
  id?: string;
  name: string;
  slug: string;
  bio?: string;
  photoUrl?: string;
}

interface AuthorFormProps {
  author?: Author;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AuthorForm({ author, onSuccess, onCancel }: AuthorFormProps) {
  const [formData, setFormData] = useState<Author>({
    name: "",
    slug: "",
    bio: "",
    photoUrl: "",
  });
  const [photoMode, setPhotoMode] = useState<"url" | "upload">("url");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (author) {
      setFormData(author);
    }
  }, [author]);

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: author?.id ? prev.slug : generateSlug(name),
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/authors/upload-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to upload image");
        return;
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, photoUrl: data.url }));
    } catch (err) {
      setError("Network error while uploading image");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = author?.id ? `/api/authors/${author.id}` : "/api/authors";
    const method = author?.id ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save author");
      }
    } catch (err) {
      setError("Network error - please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <Input
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          placeholder="Karl Marx"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">URL Slug *</label>
        <Input
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
          placeholder="karl-marx"
          pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
          title="Lowercase letters, numbers, and hyphens only"
        />
        <p style={{ fontSize: "0.75rem", color: "var(--muted-color)", marginTop: "0.25rem" }}>
          Used in URL: /books/author/{formData.slug || "slug"}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Biography</label>
        <Textarea
          value={formData.bio || ""}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={6}
          placeholder="Brief biography of the author..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Author Photo</label>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input
              type="radio"
              name="photoMode"
              value="url"
              checked={photoMode === "url"}
              onChange={(e) => setPhotoMode(e.target.value as "url" | "upload")}
            />
            <span>Use URL</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input
              type="radio"
              name="photoMode"
              value="upload"
              checked={photoMode === "upload"}
              onChange={(e) => setPhotoMode(e.target.value as "url" | "upload")}
            />
            <span>Upload Image</span>
          </label>
        </div>

        {photoMode === "url" ? (
          <Input
            type="url"
            value={formData.photoUrl || ""}
            onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
            placeholder="https://..."
          />
        ) : (
          <div>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileUpload}
              disabled={uploadLoading}
              style={{
                padding: "0.5rem",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                width: "100%",
                cursor: uploadLoading ? "not-allowed" : "pointer",
              }}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--muted-color)", marginTop: "0.5rem" }}>
              {uploadLoading ? "Uploading..." : "Max 5MB. JPEG, PNG, WebP, or GIF"}
            </p>
          </div>
        )}

        {formData.photoUrl && (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 500, marginBottom: "0.5rem" }}>
              Current Photo:
            </p>
            <img
              src={
                formData.photoUrl.includes('blob.vercel-storage.com') || 
                formData.photoUrl.startsWith('blob:') ||
                formData.photoUrl.startsWith('data:')
                  ? formData.photoUrl 
                  : getProxiedImageUrl(formData.photoUrl, { width: 200, quality: 75 }) || formData.photoUrl
              }
              alt="Author photo preview"
              style={{
                width: "200px",
                height: "200px",
                objectFit: "cover",
                borderRadius: "50%",
                border: "2px solid var(--border-color)",
              }}
            />
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : author?.id ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
