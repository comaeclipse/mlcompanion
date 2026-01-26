import { AuthorForm } from "./AuthorForm";

interface Author {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  photoUrl?: string | null;
}

interface ManageAuthorsWrapperProps {
  author: Author | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ManageAuthorsWrapper({ author, isOpen, onClose, onSuccess }: ManageAuthorsWrapperProps) {
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
        <h2 style={{ marginTop: 0 }}>{author ? "Edit Author" : "Add Author"}</h2>
        <AuthorForm
          author={author || undefined}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}

