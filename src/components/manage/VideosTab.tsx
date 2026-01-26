import { useState, useEffect, useCallback } from "react";
import { ManageVideosWrapper } from "../ManageVideosWrapper";

interface Video {
    id: string;
    title: string;
    description: string;
    url: string;
    thumbnailUrl?: string | null;
    duration?: string | null;
    channelName?: string | null;
    publishedAt?: Date | string | null;
    tags: string[];
    pros: string[];
    cons: string[];
    category?: string | null;
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface VideosTabProps {
    initialVideos?: Video[] | null;
    initialPagination?: PaginationInfo | null;
}

const PAGE_SIZE = 20;

export function VideosTab({ initialVideos, initialPagination }: VideosTabProps) {
    const [videos, setVideos] = useState<Video[] | null>(initialVideos ?? null);
    const [pagination, setPagination] = useState<PaginationInfo | null>(initialPagination ?? null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);

    const fetchVideos = useCallback(async (page = 1) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`/api/manage/videos?page=${page}&limit=${PAGE_SIZE}`, { credentials: "include" });
            if (response.status === 401) {
                window.location.href = "/login";
                return;
            }
            if (!response.ok) {
                throw new Error("Failed to load videos");
            }
            const data = await response.json();
            setVideos(Array.isArray(data.videos) ? data.videos : Array.isArray(data) ? data : []);
            if (data.pagination) {
                setPagination(data.pagination);
            }
        } catch (err) {
            setError("Failed to load videos. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (videos === null && !loading) {
            void fetchVideos();
        }
    }, [videos, loading, fetchVideos]);

    const handleEdit = (videoId: string) => {
        const video = videos?.find((item) => item.id === videoId);
        if (video) {
            setEditingVideo(video);
            setModalOpen(true);
        }
    };

    const handleDelete = async (videoId: string) => {
        if (!confirm("Are you sure you want to delete this video?")) return;
        try {
            const response = await fetch(`/api/videos/${videoId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (response.ok) {
                // Update local state instead of reloading
                setVideos((prev) => prev?.filter((v) => v.id !== videoId) ?? null);
                if (pagination) {
                    setPagination({ ...pagination, total: pagination.total - 1 });
                }
                return;
            }
            const data = await response.json().catch(() => ({}));
            alert(`Failed to delete video: ${data.error || "Unknown error"}`);
        } catch (err) {
            alert("Failed to delete video. Please try again.");
        }
    };

    const handleAddClick = () => {
        setEditingVideo(null);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingVideo(null);
    };

    const handleSuccess = () => {
        setModalOpen(false);
        setEditingVideo(null);
        // Refresh the current page of data
        void fetchVideos(pagination?.page ?? 1);
    };

    const handlePageChange = (newPage: number) => {
        void fetchVideos(newPage);
    };

    if (loading && videos === null) {
        return (
            <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
                <p className="muted">Loading videos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
                <p className="muted">{error}</p>
            </div>
        );
    }

    if (!videos || videos.length === 0) {
        return (
            <>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                    <button className="button" onClick={handleAddClick}>
                        + Add Video
                    </button>
                </div>
                <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
                    <p className="muted">No videos yet. Click "+ Add Video" to get started!</p>
                </div>
                <ManageVideosWrapper
                    video={editingVideo}
                    isOpen={modalOpen}
                    onClose={handleModalClose}
                    onSuccess={handleSuccess}
                />
            </>
        );
    }

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                {pagination && (
                    <p className="muted" style={{ margin: 0 }}>
                        Showing {videos.length} of {pagination.total} videos
                    </p>
                )}
                <button className="button" onClick={handleAddClick}>
                    + Add Video
                </button>
            </div>

            <div className="video-admin-list">
                {videos.map((video) => (
                    <div key={video.id} className="panel" style={{ padding: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
                            <div style={{ flexShrink: 0, position: "relative" }}>
                                {video.thumbnailUrl ? (
                                    <img
                                        src={video.thumbnailUrl}
                                        alt={video.title}
                                        loading="lazy"
                                        style={{
                                            width: "180px",
                                            height: "100px",
                                            objectFit: "cover",
                                            borderRadius: "8px",
                                            background: "#222",
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "180px",
                                            height: "100px",
                                            borderRadius: "8px",
                                            background: "#ddd",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#999",
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        No thumbnail
                                    </div>
                                )}
                                {video.duration && (
                                    <span
                                        style={{
                                            position: "absolute",
                                            bottom: "4px",
                                            right: "4px",
                                            background: "rgba(0,0,0,0.8)",
                                            color: "white",
                                            padding: "2px 6px",
                                            borderRadius: "4px",
                                            fontSize: "0.75rem",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {video.duration}
                                    </span>
                                )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem" }}>{video.title}</h3>
                                {video.channelName && (
                                    <p className="muted" style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem" }}>
                                        {video.channelName}
                                    </p>
                                )}
                                <p
                                    className="muted"
                                    style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", lineHeight: 1.4 }}
                                >
                                    {video.description.length > 120 ? `${video.description.slice(0, 117)}...` : video.description}
                                </p>
                                {video.tags.length > 0 && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                                        {video.tags.slice(0, 4).map((tag) => (
                                            <a
                                                key={tag}
                                                href={`/videos/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    fontSize: "0.7rem",
                                                    padding: "2px 6px",
                                                    borderRadius: "4px",
                                                    background: "rgba(156, 92, 46, 0.12)",
                                                    color: "var(--accent-color)",
                                                    textDecoration: "none",
                                                }}
                                            >
                                                {tag}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                                <button className="button button-sm" onClick={() => handleEdit(video.id)}>
                                    Edit
                                </button>
                                <button className="button button-sm button-danger" onClick={() => handleDelete(video.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
                    <button
                        className="button button-sm"
                        disabled={pagination.page <= 1 || loading}
                        onClick={() => handlePageChange(pagination.page - 1)}
                    >
                        Previous
                    </button>
                    <span style={{ display: "flex", alignItems: "center", padding: "0 1rem" }}>
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        className="button button-sm"
                        disabled={pagination.page >= pagination.totalPages || loading}
                        onClick={() => handlePageChange(pagination.page + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            <ManageVideosWrapper
                video={editingVideo}
                isOpen={modalOpen}
                onClose={handleModalClose}
                onSuccess={handleSuccess}
            />
        </>
    );
}
