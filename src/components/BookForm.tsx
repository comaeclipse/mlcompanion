import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface Book {
  id?: string;
  title: string;
  description: string;
  isbn?: string;
  isbn13?: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  thumbnailUrl?: string;
  pageCount?: number;
  categories: string[];
  language?: string;
  previewLink?: string;
  infoLink?: string;
  tags: string[];
}

interface BookFormProps {
  book?: Book;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BookForm({ book, onSuccess, onCancel }: BookFormProps) {
  const [formData, setFormData] = useState<Book>({
    title: "",
    description: "",
    isbn: "",
    isbn13: "",
    authors: [],
    publisher: "",
    publishedDate: "",
    thumbnailUrl: "",
    pageCount: undefined,
    categories: [],
    language: "",
    previewLink: "",
    infoLink: "",
    tags: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [error, setError] = useState("");

  // Update form when book prop changes
  useEffect(() => {
    if (book) {
      setFormData(book);
    } else {
      setFormData({
        title: "",
        description: "",
        isbn: "",
        isbn13: "",
        authors: [],
        publisher: "",
        publishedDate: "",
        thumbnailUrl: "",
        pageCount: undefined,
        categories: [],
        language: "",
        previewLink: "",
        infoLink: "",
        tags: [],
      });
    }
  }, [book]);

  const fetchMetadata = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setError("Enter an ISBN or book title first");
      return;
    }
    setMetaLoading(true);
    setError("");

    try {
      const response = await fetch("/api/books/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
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
        isbn: prev.isbn || data.isbn || "",
        isbn13: prev.isbn13 || data.isbn13 || "",
        authors: prev.authors.length > 0 ? prev.authors : data.authors || [],
        publisher: prev.publisher || data.publisher || "",
        publishedDate: prev.publishedDate || data.publishedDate || "",
        thumbnailUrl: prev.thumbnailUrl || data.thumbnailUrl || "",
        pageCount: prev.pageCount || data.pageCount || undefined,
        categories: prev.categories.length > 0 ? prev.categories : data.categories || [],
        language: prev.language || data.language || "",
        previewLink: prev.previewLink || data.previewLink || "",
        infoLink: prev.infoLink || data.infoLink || "",
      }));
      
      // Clear search query after successful fetch
      setSearchQuery("");
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

    const url = book?.id ? `/api/books/${book.id}` : "/api/books";
    const method = book?.id ? "PUT" : "POST";

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
        setError(data.error || "Failed to save book");
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
      {/* Metadata Fetch Section */}
      <div style={{ background: "rgba(102, 126, 234, 0.08)", padding: "1rem", borderRadius: "8px" }}>
        <label className="block text-sm font-medium mb-2">
          🔍 Search by ISBN or Title
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ISBN-13, ISBN-10, or book title"
            style={{ flex: 1 }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={fetchMetadata}
            disabled={metaLoading}
            title="Fetch metadata from Google Books and Open Library"
            style={{ minWidth: "100px" }}
          >
            {metaLoading ? "Loading..." : "Fetch"}
          </Button>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--muted-color)", marginTop: "0.5rem" }}>
          Auto-fill book details from Google Books and Open Library APIs
        </p>
      </div>

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
          rows={5}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        <div>
          <label className="block text-sm font-medium mb-1">ISBN-10</label>
          <Input
            value={formData.isbn || ""}
            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
            placeholder="0-123-45678-9"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ISBN-13</label>
          <Input
            value={formData.isbn13 || ""}
            onChange={(e) => setFormData({ ...formData, isbn13: e.target.value })}
            placeholder="978-0-123-45678-9"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Authors (comma-separated)</label>
        <Input
          value={formData.authors.join(", ")}
          onChange={(e) =>
            setFormData({ ...formData, authors: e.target.value.split(",").map(a => a.trim()).filter(Boolean) })
          }
          placeholder="Karl Marx, Friedrich Engels"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.5rem" }}>
        <div>
          <label className="block text-sm font-medium mb-1">Publisher</label>
          <Input
            value={formData.publisher || ""}
            onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Published Date</label>
          <Input
            value={formData.publishedDate || ""}
            onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
            placeholder="2021"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cover Image URL</label>
        <Input
          type="url"
          value={formData.thumbnailUrl || ""}
          onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        <div>
          <label className="block text-sm font-medium mb-1">Page Count</label>
          <Input
            type="number"
            value={formData.pageCount || ""}
            onChange={(e) => setFormData({ ...formData, pageCount: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="320"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <Input
            value={formData.language || ""}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            placeholder="en"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Categories (comma-separated)</label>
        <Input
          value={formData.categories.join(", ")}
          onChange={(e) =>
            setFormData({ ...formData, categories: e.target.value.split(",").map(c => c.trim()).filter(Boolean) })
          }
          placeholder="Political Science, History"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
        <Input
          value={formData.tags.join(", ")}
          onChange={(e) =>
            setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })
          }
          placeholder="marxism, theory, economics"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Preview Link</label>
        <Input
          type="url"
          value={formData.previewLink || ""}
          onChange={(e) => setFormData({ ...formData, previewLink: e.target.value })}
          placeholder="https://books.google.com/books?id=..."
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : book?.id ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
