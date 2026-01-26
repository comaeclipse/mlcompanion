import { PodcastForm } from "./PodcastForm";

interface Podcast {
  id?: string;
  name: string;
  description: string;
  thumbnailUrl?: string;
  feedUrl?: string;
  websiteUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  soundcloudUrl?: string;
  author?: string;
  tags: string[];
}

interface ManagePodcastsWrapperProps {
  podcast: Podcast | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ManagePodcastsWrapper({ podcast, isOpen, onClose, onSuccess }: ManagePodcastsWrapperProps) {
  if (!isOpen) return null;

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      window.location.reload();
    }
  };

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
        <h2 style={{ marginTop: 0 }}>{podcast?.id ? "Edit Podcast" : "Add Podcast"}</h2>
        <PodcastForm
          podcast={podcast || undefined}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}

