import { EpisodeForm } from "./EpisodeForm";

interface Episode {
  id?: string;
  title: string;
  description: string;
  audioUrl?: string;
  duration?: string;
  publishedAt?: string | Date;
  thumbnailUrl?: string;
  episodeNumber?: number | null;
  seasonNumber?: number | null;
  externalUrl?: string;
  tags: string[];
  pros: string[];
  cons: string[];
  podcastId: string;
}

interface Podcast {
  id: string;
  name: string;
}

interface ManageEpisodesWrapperProps {
  episode: Episode | null;
  podcasts: Podcast[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ManageEpisodesWrapper({ episode, podcasts, isOpen, onClose, onSuccess }: ManageEpisodesWrapperProps) {
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
        <h2 style={{ marginTop: 0 }}>{episode?.id ? "Edit Episode" : "Add Episode"}</h2>
        <EpisodeForm
          episode={episode || undefined}
          podcasts={podcasts}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}

