import { ChannelForm } from "./ChannelForm";

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
}

interface ManageChannelsWrapperProps {
  channel: Channel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ManageChannelsWrapper({ channel, isOpen, onClose }: ManageChannelsWrapperProps) {
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
        <h2 style={{ marginTop: 0 }}>{channel ? "Edit Channel" : "Add Channel"}</h2>
        <ChannelForm
          channel={channel || undefined}
          onSuccess={() => window.location.reload()}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
