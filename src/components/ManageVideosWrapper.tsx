import { VideoForm } from "./VideoForm";

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

interface ManageVideosWrapperProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ManageVideosWrapper({ video, isOpen, onClose }: ManageVideosWrapperProps) {

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="panel"
        style={{
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>{video ? "Edit Video" : "Add Video"}</h2>
        <VideoForm
          video={video || undefined}
          onSuccess={() => window.location.reload()}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
