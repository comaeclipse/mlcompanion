import { lazy, Suspense, useState, useEffect } from "react";

// Lazy load tab components for code splitting
const BooksTab = lazy(() => import("./manage/BooksTab").then(m => ({ default: m.BooksTab })));
const VideosTab = lazy(() => import("./manage/VideosTab").then(m => ({ default: m.VideosTab })));
const AuthorsTab = lazy(() => import("./manage/AuthorsTab").then(m => ({ default: m.AuthorsTab })));
const ChannelsTab = lazy(() => import("./manage/ChannelsTab").then(m => ({ default: m.ChannelsTab })));
const PodcastsTab = lazy(() => import("./manage/PodcastsTab").then(m => ({ default: m.PodcastsTab })));

type TabType = "books" | "videos" | "authors" | "channels" | "podcasts";

interface ManagePortalProps {
  initialTab: TabType;
}

function TabLoadingFallback() {
  return (
    <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
      <p className="muted">Loading...</p>
    </div>
  );
}

export function ManagePortal({ initialTab }: ManagePortalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", activeTab);
    window.history.replaceState({}, "", url.toString());
  }, [activeTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "books":
        return <BooksTab />;
      case "videos":
        return <VideosTab />;
      case "authors":
        return <AuthorsTab />;
      case "channels":
        return <ChannelsTab />;
      case "podcasts":
        return <PodcastsTab />;
      default:
        return <VideosTab />;
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div>
            <h1>Manage Library</h1>
            <p className="muted">Add, edit, and organize your books, videos, and authors</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button
            className="button"
            onClick={() => handleTabChange("books")}
            style={
              activeTab === "books"
                ? {}
                : { background: "transparent", color: "var(--accent-color)", border: "1px solid var(--accent-color)" }
            }
          >
            Books
          </button>
          <button
            className="button"
            onClick={() => handleTabChange("videos")}
            style={
              activeTab === "videos"
                ? {}
                : { background: "transparent", color: "var(--accent-color)", border: "1px solid var(--accent-color)" }
            }
          >
            Videos
          </button>
          <button
            className="button"
            onClick={() => handleTabChange("channels")}
            style={
              activeTab === "channels"
                ? {}
                : { background: "transparent", color: "var(--accent-color)", border: "1px solid var(--accent-color)" }
            }
          >
            Channels
          </button>
          <button
            className="button"
            onClick={() => handleTabChange("podcasts")}
            style={
              activeTab === "podcasts"
                ? {}
                : { background: "transparent", color: "var(--accent-color)", border: "1px solid var(--accent-color)" }
            }
          >
            Podcasts
          </button>
          <button
            className="button"
            onClick={() => handleTabChange("authors")}
            style={
              activeTab === "authors"
                ? {}
                : { background: "transparent", color: "var(--accent-color)", border: "1px solid var(--accent-color)" }
            }
          >
            Authors
          </button>
        </div>
      </header>

      <section>
        <Suspense fallback={<TabLoadingFallback />}>
          {renderActiveTab()}
        </Suspense>
      </section>
    </div>
  );
}
