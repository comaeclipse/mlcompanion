import { useState, useEffect, useCallback } from "react";
import { ManagePodcastsWrapper } from "../ManagePodcastsWrapper";
import { ManageEpisodesWrapper } from "../ManageEpisodesWrapper";

interface Episode {
    id: string;
    title: string;
    description?: string | null;
    audioUrl?: string | null;
    duration?: string | null;
    publishedAt?: string | Date | null;
    episodeNumber?: number | null;
    seasonNumber?: number | null;
    externalUrl?: string | null;
    tags: string[];
    pros: string[];
    cons: string[];
    podcastId: string;
}

interface Podcast {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    thumbnailUrl?: string | null;
    feedUrl?: string | null;
    websiteUrl?: string | null;
    spotifyUrl?: string | null;
    appleUrl?: string | null;
    soundcloudUrl?: string | null;
    author?: string | null;
    tags: string[];
    _count?: { episodes: number };
    episodes?: Episode[];
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface PodcastsTabProps {
    initialPodcasts?: Podcast[] | null;
    initialPagination?: PaginationInfo | null;
}

const PAGE_SIZE = 20;

export function PodcastsTab({ initialPodcasts, initialPagination }: PodcastsTabProps) {
    const [podcasts, setPodcasts] = useState<Podcast[] | null>(initialPodcasts ?? null);
    const [pagination, setPagination] = useState<PaginationInfo | null>(initialPagination ?? null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [podcastModalOpen, setPodcastModalOpen] = useState(false);
    const [episodeModalOpen, setEpisodeModalOpen] = useState(false);
    const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
    const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

    const fetchPodcasts = useCallback(async (page = 1) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`/api/manage/podcasts?page=${page}&limit=${PAGE_SIZE}`, { credentials: "include" });
            if (response.status === 401) {
                window.location.href = "/login";
                return;
            }
            if (!response.ok) {
                throw new Error("Failed to load podcasts");
            }
            const data = await response.json();
            setPodcasts(Array.isArray(data.podcasts) ? data.podcasts : Array.isArray(data) ? data : []);
            if (data.pagination) {
                setPagination(data.pagination);
            }
        } catch (err) {
            setError("Failed to load podcasts. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (podcasts === null && !loading) {
            void fetchPodcasts();
        }
    }, [podcasts, loading, fetchPodcasts]);

    const handleEditPodcast = (podcastId: string) => {
        const podcast = podcasts?.find((item) => item.id === podcastId);
        if (podcast) {
            setEditingPodcast(podcast);
            setPodcastModalOpen(true);
        }
    };

    const handleDeletePodcast = async (podcastId: string) => {
        if (!confirm("Are you sure you want to delete this podcast and all its episodes?")) return;
        try {
            const response = await fetch(`/api/podcasts/${podcastId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (response.ok) {
                setPodcasts((prev) => prev?.filter((p) => p.id !== podcastId) ?? null);
                if (pagination) {
                    setPagination({ ...pagination, total: pagination.total - 1 });
                }
                return;
            }
            const data = await response.json().catch(() => ({}));
            alert(`Failed to delete podcast: ${data.error || "Unknown error"}`);
        } catch (err) {
            alert("Failed to delete podcast. Please try again.");
        }
    };

    const handleAddPodcast = () => {
        setEditingPodcast(null);
        setPodcastModalOpen(true);
    };

    const handleAddEpisode = (podcastId: string) => {
        setEditingEpisode({ id: undefined, title: "", description: "", tags: [], pros: [], cons: [], podcastId } as unknown as Episode);
        setEpisodeModalOpen(true);
    };

    const handleEditEpisode = (episodeId: string) => {
        if (!podcasts) return;
        for (const podcast of podcasts) {
            const episode = podcast.episodes?.find((ep) => ep.id === episodeId);
            if (episode) {
                setEditingEpisode({ ...episode, podcastId: podcast.id } as Episode);
                setEpisodeModalOpen(true);
                return;
            }
        }
    };

    const handleDeleteEpisode = async (episodeId: string) => {
        if (!confirm("Are you sure you want to delete this episode?")) return;
        try {
            const response = await fetch(`/api/episodes/${episodeId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (response.ok) {
                // Update local state - remove episode from its podcast
                setPodcasts((prev) => prev?.map((p) => ({
                    ...p,
                    episodes: p.episodes?.filter((ep) => ep.id !== episodeId),
                    _count: p._count ? { episodes: (p._count.episodes || 1) - 1 } : undefined,
                })) ?? null);
                return;
            }
            const data = await response.json().catch(() => ({}));
            alert(`Failed to delete episode: ${data.error || "Unknown error"}`);
        } catch (err) {
            alert("Failed to delete episode. Please try again.");
        }
    };

    const handlePodcastModalClose = () => {
        setPodcastModalOpen(false);
        setEditingPodcast(null);
    };

    const handleEpisodeModalClose = () => {
        setEpisodeModalOpen(false);
        setEditingEpisode(null);
    };

    const handleSuccess = () => {
        setPodcastModalOpen(false);
        setEpisodeModalOpen(false);
        setEditingPodcast(null);
        setEditingEpisode(null);
        void fetchPodcasts(pagination?.page ?? 1);
    };

    const handlePageChange = (newPage: number) => {
        void fetchPodcasts(newPage);
    };

    if (loading && podcasts === null) {
        return (
            <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
                <p className="muted">Loading podcasts...</p>
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

    if (!podcasts || podcasts.length === 0) {
        return (
            <>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                    <button className="button" onClick={handleAddPodcast}>
                        + Add Podcast
                    </button>
                </div>
                <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
                    <p className="muted">No podcasts yet. Click "+ Add Podcast" to get started!</p>
                </div>
                <ManagePodcastsWrapper
                    podcast={editingPodcast ? {
                        id: editingPodcast.id,
                        name: editingPodcast.name,
                        description: editingPodcast.description || "",
                        thumbnailUrl: editingPodcast.thumbnailUrl || undefined,
                        feedUrl: editingPodcast.feedUrl || undefined,
                        websiteUrl: editingPodcast.websiteUrl || undefined,
                        spotifyUrl: editingPodcast.spotifyUrl || undefined,
                        appleUrl: editingPodcast.appleUrl || undefined,
                        soundcloudUrl: editingPodcast.soundcloudUrl || undefined,
                        author: editingPodcast.author || undefined,
                        tags: editingPodcast.tags,
                    } : null}
                    isOpen={podcastModalOpen}
                    onClose={handlePodcastModalClose}
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
                        Showing {podcasts.length} of {pagination.total} podcasts
                    </p>
                )}
                <button className="button" onClick={handleAddPodcast}>
                    + Add Podcast
                </button>
            </div>

            <div className="video-admin-list">
                {podcasts.map((podcast) => (
                    <div key={podcast.id} className="panel" style={{ padding: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
                            <div style={{ flexShrink: 0 }}>
                                {podcast.thumbnailUrl ? (
                                    <img
                                        src={podcast.thumbnailUrl}
                                        alt={podcast.name}
                                        loading="lazy"
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            objectFit: "cover",
                                            borderRadius: "12px",
                                            background: "#222",
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            borderRadius: "12px",
                                            background: "linear-gradient(135deg, #7b2d8b, #4a1a5e)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontSize: "2rem",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {podcast.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem" }}>{podcast.name}</h3>
                                {podcast.author && (
                                    <p className="muted" style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem" }}>
                                        {podcast.author}
                                    </p>
                                )}
                                <p className="muted" style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem" }}>
                                    {podcast._count?.episodes || 0} episode{(podcast._count?.episodes || 0) !== 1 ? "s" : ""}
                                </p>

                                {/* Episodes list */}
                                {podcast.episodes && podcast.episodes.length > 0 && (
                                    <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border-color)" }}>
                                        {podcast.episodes.map((ep) => (
                                            <div key={ep.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0" }}>
                                                <span style={{ fontSize: "0.8rem", color: "var(--muted-color)", minWidth: "24px" }}>
                                                    {ep.episodeNumber || "•"}
                                                </span>
                                                <span style={{ fontSize: "0.85rem", flex: 1 }}>{ep.title}</span>
                                                <button className="button button-sm" onClick={() => handleEditEpisode(ep.id)} style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                                                    Edit
                                                </button>
                                                <button className="button button-sm button-danger" onClick={() => handleDeleteEpisode(ep.id)} style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                                                    Del
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flexShrink: 0 }}>
                                <button className="button button-sm" onClick={() => handleAddEpisode(podcast.id)}>
                                    + Episode
                                </button>
                                <button className="button button-sm" onClick={() => handleEditPodcast(podcast.id)}>
                                    Edit
                                </button>
                                <button className="button button-sm button-danger" onClick={() => handleDeletePodcast(podcast.id)}>
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

            <ManagePodcastsWrapper
                podcast={editingPodcast ? {
                    id: editingPodcast.id,
                    name: editingPodcast.name,
                    description: editingPodcast.description || "",
                    thumbnailUrl: editingPodcast.thumbnailUrl || undefined,
                    feedUrl: editingPodcast.feedUrl || undefined,
                    websiteUrl: editingPodcast.websiteUrl || undefined,
                    spotifyUrl: editingPodcast.spotifyUrl || undefined,
                    appleUrl: editingPodcast.appleUrl || undefined,
                    soundcloudUrl: editingPodcast.soundcloudUrl || undefined,
                    author: editingPodcast.author || undefined,
                    tags: editingPodcast.tags,
                } : null}
                isOpen={podcastModalOpen}
                onClose={handlePodcastModalClose}
                onSuccess={handleSuccess}
            />
            <ManageEpisodesWrapper
                episode={editingEpisode ? {
                    id: editingEpisode.id,
                    title: editingEpisode.title,
                    description: editingEpisode.description || "",
                    audioUrl: editingEpisode.audioUrl || undefined,
                    duration: editingEpisode.duration || undefined,
                    publishedAt: editingEpisode.publishedAt || undefined,
                    episodeNumber: editingEpisode.episodeNumber,
                    seasonNumber: editingEpisode.seasonNumber,
                    externalUrl: editingEpisode.externalUrl || undefined,
                    tags: editingEpisode.tags,
                    pros: editingEpisode.pros,
                    cons: editingEpisode.cons,
                    podcastId: editingEpisode.podcastId,
                } : null}
                podcasts={podcasts?.map((p) => ({ id: p.id, name: p.name })) || []}
                isOpen={episodeModalOpen}
                onClose={handleEpisodeModalClose}
                onSuccess={handleSuccess}
            />
        </>
    );
}
