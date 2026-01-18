import { useState } from "react";
import { VideoCard } from "./VideoCard";
import { VideoPlayerModal } from "./VideoPlayerModal";

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string | null;
  duration?: string | null;
  channelName?: string | null;
  publishedAt?: Date | null;
  tags: string[];
}

interface VideoLibraryProps {
  videos: Video[];
}

export function VideoLibrary({ videos }: VideoLibraryProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  return (
    <>
      <div className="resource-list">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onClick={() => setSelectedVideo(video)}
          />
        ))}
      </div>

      <VideoPlayerModal
        video={selectedVideo}
        isOpen={selectedVideo !== null}
        onClose={() => setSelectedVideo(null)}
      />
    </>
  );
}
