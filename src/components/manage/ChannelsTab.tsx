import { useState, useEffect, useCallback } from "react";
import { ManageChannelsWrapper } from "../ManageChannelsWrapper";

interface Channel {
    id: string;
    channelId: string;
    name: string;
    slug: string;
    url?: string | null;
    description?: string | null;
    thumbnailUrl?: string | null;
    subscriberCount?: number | null;
    videoCount?: number | null;
    viewCount?: number | null;
    customUrl?: string | null;
    country?: string | null;
    publishedAt?: Date | string | null;
    _count?: {
        videos: number;
    };
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface ChannelsTabProps {
    initialChannels?: Channel[] | null;
    initialPagination?: PaginationInfo | null;
}

const PAGE_SIZE = 20;

export function ChannelsTab({ initialChannels, initialPagination }: ChannelsTabProps) {
    const [channels, setChannels] = useState<Channel[] | null>(initialChannels ?? null);
    const [pagination, setPagination] = useState<PaginationInfo | null>(initialPagination ?? null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

    const fetchChannels = useCallback(async (page = 1) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`/api/manage/channels?page=${page}&limit=${PAGE_SIZE}`, { credentials: "include" });
            if (response.status === 401) {
                window.location.href = "/login";
                return;
            }
            if (!response.ok) {
                throw new Error("Failed to load channels");
            }
            const data = await response.json();
            setChannels(Array.isArray(data.channels) ? data.channels : Array.isArray(data) ? data : []);
            if (data.pagination) {
                setPagination(data.pagination);
            }
        } catch (err) {
            setError("Failed to load channels. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (channels === null && !loading) {
            void fetchChannels();
        }
    }, [channels, loading, fetchChannels]);

    const handleEdit = (channelId: string) => {
        const channel = channels?.find((item) => item.id === channelId);
        if (channel) {
            setEditingChannel(channel);
            setModalOpen(true);
        }
    };

    const handleDelete = async (channelId: string) => {
        if (!confirm("Are you sure you want to delete this channel?")) return;
        try {
            const response = await fetch(`/api/channels/${channelId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (response.ok) {
                setChannels((prev) => prev?.filter((c) => c.id !== channelId) ?? null);
                if (pagination) {
                    setPagination({ ...pagination, total: pagination.total - 1 });
                }
                return;
            }
            const data = await response.json().catch(() => ({}));
            alert(`Failed to delete channel: ${data.error || "Unknown error"}`);
        } catch (err) {
            alert("Failed to delete channel. Please try again.");
        }
    };

    const handleAddClick = () => {
        setEditingChannel(null);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingChannel(null);
    };

    const handleSuccess = () => {
        setModalOpen(false);
        setEditingChannel(null);
        void fetchChannels(pagination?.page ?? 1);
    };

    const handlePageChange = (newPage: number) => {
        void fetchChannels(newPage);
    };

    if (loading && channels === null) {
        return (
            <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
                <p className="muted">Loading channels...</p>
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

    if (!channels || channels.length === 0) {
        return (
            <>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                    <button className="button" onClick={handleAddClick}>
                        + Add Channel
                    </button>
                </div>
                <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
                    <p className="muted">No channels yet. Click "+ Add Channel" to get started!</p>
                </div>
                <ManageChannelsWrapper
                    channel={editingChannel}
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
                        Showing {channels.length} of {pagination.total} channels
                    </p>
                )}
                <button className="button" onClick={handleAddClick}>
                    + Add Channel
                </button>
            </div>

            <div className="video-admin-list">
                {channels.map((channel) => (
                    <div key={channel.id} className="panel" style={{ padding: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
                            <div style={{ flexShrink: 0, position: "relative" }}>
                                {channel.thumbnailUrl ? (
                                    <img
                                        src={channel.thumbnailUrl}
                                        alt={channel.name}
                                        loading="lazy"
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            objectFit: "cover",
                                            borderRadius: "50%",
                                            border: "2px solid var(--border-color)",
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, var(--accent-color), #d4835f)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontSize: "2.5rem",
                                            fontWeight: 600,
                                            border: "2px solid var(--border-color)",
                                        }}
                                    >
                                        {channel.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem" }}>{channel.name}</h3>
                                <p className="muted" style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem" }}>
                                    {channel.channelId}
                                </p>
                                {channel._count && (
                                    <p className="muted" style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem" }}>
                                        {channel._count.videos} {channel._count.videos === 1 ? "video" : "videos"}
                                    </p>
                                )}
                                {channel.subscriberCount && (
                                    <p className="muted" style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem" }}>
                                        {channel.subscriberCount.toLocaleString()} subscribers
                                    </p>
                                )}
                                {channel.description && (
                                    <p
                                        className="muted"
                                        style={{ margin: "0", fontSize: "0.85rem", lineHeight: 1.4 }}
                                    >
                                        {channel.description.length > 120 ? `${channel.description.slice(0, 117)}...` : channel.description}
                                    </p>
                                )}
                            </div>

                            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                                <button className="button button-sm" onClick={() => handleEdit(channel.id)}>
                                    Edit
                                </button>
                                <button className="button button-sm button-danger" onClick={() => handleDelete(channel.id)}>
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

            <ManageChannelsWrapper
                channel={editingChannel}
                isOpen={modalOpen}
                onClose={handleModalClose}
                onSuccess={handleSuccess}
            />
        </>
    );
}
