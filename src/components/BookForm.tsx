import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { getProxiedImageUrl } from "@/lib/image-utils";

interface ExternalReview {
  authorUsername: string;
  reviewDate: string;
  contentHtml: string;
  score?: number;
  sourceUrl: string;
}

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
  readFreeLinks: string[];
  goodreadsRating?: number;
  goodreadsReviews?: number;
  externalReviews?: ExternalReview[];
  purchaseLinks?: {
    amazon?: string;
    custom: Array<{ label: string; url: string }>;
  };
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
    readFreeLinks: [],
    goodreadsRating: undefined,
    goodreadsReviews: undefined,
    externalReviews: [],
    purchaseLinks: {
      amazon: "",
      custom: [{ label: "", url: "" }, { label: "", url: "" }],
    },
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [error, setError] = useState("");
  const [coverImageMode, setCoverImageMode] = useState<"url" | "upload">("url");
  const [uploadLoading, setUploadLoading] = useState(false);

  // Update form when book prop changes
  useEffect(() => {
    if (book) {
      setFormData({
        ...book,
        goodreadsRating: book.goodreadsRating ?? undefined,
        goodreadsReviews: book.goodreadsReviews ?? undefined,
        externalReviews: Array.isArray(book.externalReviews) ? book.externalReviews : [],
        purchaseLinks: book.purchaseLinks || {
          amazon: "",
          custom: [{ label: "", url: "" }, { label: "", url: "" }],
        },
      });
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
        readFreeLinks: [],
        goodreadsRating: undefined,
        goodreadsReviews: undefined,
        externalReviews: [],
        purchaseLinks: {
          amazon: "",
          custom: [{ label: "", url: "" }, { label: "", url: "" }],
        },
      });
    }
  }, [book]);

  const createEmptyReview = (): ExternalReview => ({
    authorUsername: "",
    reviewDate: "",
    contentHtml: "",
    score: undefined,
    sourceUrl: "",
  });

  const updateReview = (index: number, updates: Partial<ExternalReview>) => {
    setFormData((prev) => {
      const reviews = prev.externalReviews ? [...prev.externalReviews] : [];
      reviews[index] = { ...reviews[index], ...updates };
      return { ...prev, externalReviews: reviews };
    });
  };

  const addReview = () => {
    setFormData((prev) => ({
      ...prev,
      externalReviews: [...(prev.externalReviews || []), createEmptyReview()],
    }));
  };

  const removeReview = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      externalReviews: (prev.externalReviews || []).filter((_, idx) => idx !== index),
    }));
  };

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/books/upload-cover", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to upload image");
        return;
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: data.url,
      }));
    } catch (err) {
      console.error("Upload error:", err);
      setError("Network error while uploading image");
    } finally {
      setUploadLoading(false);
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

      {/* Cover Image Section */}
      <div>
        <label className="block text-sm font-medium mb-2">Cover Image</label>

        {/* Toggle between URL and Upload */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input
              type="radio"
              name="coverImageMode"
              value="url"
              checked={coverImageMode === "url"}
              onChange={(e) => setCoverImageMode(e.target.value as "url" | "upload")}
            />
            <span>Use URL</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input
              type="radio"
              name="coverImageMode"
              value="upload"
              checked={coverImageMode === "upload"}
              onChange={(e) => setCoverImageMode(e.target.value as "url" | "upload")}
            />
            <span>Upload Image</span>
          </label>
        </div>

        {/* Conditional Input Based on Mode */}
        {coverImageMode === "url" ? (
          <Input
            type="url"
            value={formData.thumbnailUrl || ""}
            onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
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

        {/* Preview Current Image */}
        {formData.thumbnailUrl && (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 500, marginBottom: "0.5rem" }}>Current Cover:</p>
            <img
              src={formData.thumbnailUrl}
              alt="Cover preview"
              style={{
                width: "120px",
                height: "180px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
              }}
            />
          </div>
        )}
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

      <div style={{ background: "rgba(156, 92, 46, 0.08)", padding: "1rem", borderRadius: "8px" }}>
        <label className="block text-sm font-medium mb-2">
          Goodreads Score (optional)
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <div>
            <label className="block text-sm font-medium mb-1">Rating (0-5)</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.goodreadsRating ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  goodreadsRating: value === "" ? undefined : parseFloat(value),
                });
              }}
              placeholder="4.2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Review Count</label>
            <Input
              type="number"
              min="0"
              value={formData.goodreadsReviews ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  goodreadsReviews: value === "" ? undefined : parseInt(value, 10),
                });
              }}
              placeholder="2000"
            />
          </div>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--muted-color)", marginTop: "0.5rem" }}>
          Example display: 4.2 / 2,000 reviews
        </p>
      </div>

      <div style={{ background: "rgba(102, 126, 234, 0.08)", padding: "1rem", borderRadius: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <label className="block text-sm font-medium">External Reviews</label>
          <Button type="button" variant="secondary" onClick={addReview}>
            + Add Review
          </Button>
        </div>
        {(formData.externalReviews || []).length === 0 ? (
          <p style={{ fontSize: "0.85rem", color: "var(--muted-color)", marginTop: "0.5rem" }}>
            Add credited reviews with author, date, score, and source link.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            {(formData.externalReviews || []).map((review, index) => (
              <div
                key={`review-${index}`}
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  background: "var(--paper-color)",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div>
                    <label className="block text-sm font-medium mb-1">Author Username</label>
                    <Input
                      value={review.authorUsername}
                      onChange={(e) => updateReview(index, { authorUsername: e.target.value })}
                      placeholder="reviewer123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Review Date</label>
                    <Input
                      type="date"
                      value={review.reviewDate}
                      onChange={(e) => updateReview(index, { reviewDate: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div>
                    <label className="block text-sm font-medium mb-1">Score (0-5)</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={review.score ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateReview(index, { score: value === "" ? undefined : parseFloat(value) });
                      }}
                      placeholder="4.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Source Link</label>
                    <Input
                      type="url"
                      value={review.sourceUrl}
                      onChange={(e) => updateReview(index, { sourceUrl: e.target.value })}
                      placeholder="https://example.com/review"
                    />
                  </div>
                </div>
                <label className="block text-sm font-medium mb-1">Review Content</label>
                <WysiwygEditor
                  value={review.contentHtml}
                  onChange={(value) => updateReview(index, { contentHtml: value })}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                  <Button type="button" variant="outline" onClick={() => removeReview(index)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Read Free Links Section */}
      <div style={{ background: "rgba(46, 204, 113, 0.08)", padding: "1rem", borderRadius: "8px" }}>
        <label className="block text-sm font-medium mb-2">
          📖 Read Free Online (comma-separated URLs)
        </label>
        <Input
          type="text"
          value={formData.readFreeLinks.join(", ")}
          onChange={(e) =>
            setFormData({
              ...formData,
              readFreeLinks: e.target.value.split(",").map(url => url.trim()).filter(Boolean)
            })
          }
          placeholder="https://marxists.org/..., https://archive.org/..."
        />
        <p style={{ fontSize: "0.75rem", color: "var(--muted-color)", marginTop: "0.5rem" }}>
          Links to free online versions (Marxists.org, Archive.org, etc.)
        </p>
      </div>

      {/* Purchase Links Section */}
      <div style={{ background: "rgba(52, 152, 219, 0.08)", padding: "1rem", borderRadius: "8px" }}>
        <label className="block text-sm font-medium mb-2">
          🛒 Purchase Links
        </label>

        {/* Amazon Link */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label className="block text-sm font-medium mb-1">Amazon</label>
          <Input
            type="url"
            value={formData.purchaseLinks?.amazon || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                purchaseLinks: {
                  amazon: e.target.value,
                  custom: formData.purchaseLinks?.custom || [{ label: "", url: "" }, { label: "", url: "" }],
                },
              })
            }
            placeholder="https://www.amazon.com/..."
          />
        </div>

        {/* Custom Purchase Link 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <div>
            <label className="block text-sm font-medium mb-1">Label 1</label>
            <Input
              type="text"
              value={formData.purchaseLinks?.custom?.[0]?.label || ""}
              onChange={(e) => {
                const custom = formData.purchaseLinks?.custom || [{ label: "", url: "" }, { label: "", url: "" }];
                custom[0] = { ...custom[0], label: e.target.value };
                setFormData({
                  ...formData,
                  purchaseLinks: { amazon: formData.purchaseLinks?.amazon || "", custom },
                });
              }}
              placeholder="Verso Books"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL 1</label>
            <Input
              type="url"
              value={formData.purchaseLinks?.custom?.[0]?.url || ""}
              onChange={(e) => {
                const custom = formData.purchaseLinks?.custom || [{ label: "", url: "" }, { label: "", url: "" }];
                custom[0] = { ...custom[0], url: e.target.value };
                setFormData({
                  ...formData,
                  purchaseLinks: { amazon: formData.purchaseLinks?.amazon || "", custom },
                });
              }}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Custom Purchase Link 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.5rem" }}>
          <div>
            <label className="block text-sm font-medium mb-1">Label 2</label>
            <Input
              type="text"
              value={formData.purchaseLinks?.custom?.[1]?.label || ""}
              onChange={(e) => {
                const custom = formData.purchaseLinks?.custom || [{ label: "", url: "" }, { label: "", url: "" }];
                custom[1] = { ...custom[1], label: e.target.value };
                setFormData({
                  ...formData,
                  purchaseLinks: { amazon: formData.purchaseLinks?.amazon || "", custom },
                });
              }}
              placeholder="Haymarket Books"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL 2</label>
            <Input
              type="url"
              value={formData.purchaseLinks?.custom?.[1]?.url || ""}
              onChange={(e) => {
                const custom = formData.purchaseLinks?.custom || [{ label: "", url: "" }, { label: "", url: "" }];
                custom[1] = { ...custom[1], url: e.target.value };
                setFormData({
                  ...formData,
                  purchaseLinks: { amazon: formData.purchaseLinks?.amazon || "", custom },
                });
              }}
              placeholder="https://..."
            />
          </div>
        </div>

        <p style={{ fontSize: "0.75rem", color: "var(--muted-color)", marginTop: "0.5rem" }}>
          Add Amazon link and up to 2 custom purchase options
        </p>
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

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function WysiwygEditor({ value, onChange }: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const emitChange = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  const exec = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    emitChange();
    editorRef.current?.focus();
  };

  const handleLink = () => {
    const url = window.prompt("Enter link URL");
    if (url) {
      exec("createLink", url);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
        <Button type="button" variant="outline" onClick={() => exec("bold")}>B</Button>
        <Button type="button" variant="outline" onClick={() => exec("italic")}>I</Button>
        <Button type="button" variant="outline" onClick={() => exec("underline")}>U</Button>
        <Button type="button" variant="outline" onClick={() => exec("insertUnorderedList")}>Bullets</Button>
        <Button type="button" variant="outline" onClick={() => exec("insertOrderedList")}>Numbered</Button>
        <Button type="button" variant="outline" onClick={handleLink}>Link</Button>
        <Button type="button" variant="outline" onClick={() => exec("unlink")}>Unlink</Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        style={{
          minHeight: "140px",
          border: "1px solid var(--border-color)",
          borderRadius: "8px",
          padding: "0.75rem",
          background: "#fff",
          color: "var(--ink-color)",
          fontFamily: "\"Work Sans\", \"Segoe UI\", sans-serif",
          lineHeight: 1.6,
        }}
      />
    </div>
  );
}
