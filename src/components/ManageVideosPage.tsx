import { useState } from "react";
import { ManageVideosWrapper } from "./ManageVideosWrapper";

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
  category?: string | null;
}

interface ManageVideosPageProps {
  videos: Video[];
}

export function ManageVideosPage({ videos }: ManageVideosPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  // Expose functions to window for script access
  if (typeof window !== "undefined") {
    (window as any).openAddVideoModal = () => {
      setEditingVideo(null);
      setModalOpen(true);
    };
    (window as any).openEditVideoModal = (videoId: string) => {
      const video = videos.find(v => v.id === videoId);
      if (video) {
        setEditingVideo(video);
        setModalOpen(true);
      }
    };
  }

  return (
    <ManageVideosWrapper
      video={editingVideo}
      isOpen={modalOpen}
      onClose={() => {
        setModalOpen(false);
        setEditingVideo(null);
      }}
    />
  );
}
