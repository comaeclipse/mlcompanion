import { useEffect, useMemo, useRef, useState } from "react";
import type { GuideSection } from "../lib/guide-content";
import type { GuideRelatedResources } from "../lib/guide-related";
import { VideoCard } from "./VideoCard";
import { BookCard } from "./BookCard";

interface InteractiveGuideProps {
  sections: GuideSection[];
  initialRelatedById?: Record<string, GuideRelatedResources>;
}

type RelatedState = Record<string, GuideRelatedResources | undefined>;

export default function InteractiveGuide({ sections, initialRelatedById = {} }: InteractiveGuideProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [relatedById, setRelatedById] = useState<RelatedState>(initialRelatedById);
  const [loadingById, setLoadingById] = useState<Record<string, boolean>>({});
  const relatedRef = useRef(relatedById);
  const loadingRef = useRef(loadingById);
  const currentSection = sections[currentIndex];

  const orderedIds = useMemo(() => sections.map((section) => section.id), [sections]);

  const openExternal = (url?: string | null) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getBookLink = (book: GuideRelatedResources["books"][number]) => {
    if (book.infoLink) return book.infoLink;
    if (book.previewLink) return book.previewLink;
    if (book.readFreeLinks?.length) return book.readFreeLinks[0];
    if (book.purchaseLinks?.amazon) return book.purchaseLinks.amazon;
    if (book.purchaseLinks?.custom?.length) return book.purchaseLinks.custom[0]?.url;
    return null;
  };

  useEffect(() => {
    relatedRef.current = relatedById;
  }, [relatedById]);

  useEffect(() => {
    loadingRef.current = loadingById;
  }, [loadingById]);

  const fetchRelated = async (sectionId: string) => {
    if (relatedRef.current[sectionId] || loadingRef.current[sectionId]) return;
    setLoadingById((prev) => ({ ...prev, [sectionId]: true }));
    try {
      const response = await fetch(`/api/guide/related?step=${encodeURIComponent(sectionId)}`);
      if (!response.ok) return;
      const data = (await response.json()) as GuideRelatedResources;
      setRelatedById((prev) => ({ ...prev, [sectionId]: data }));
    } finally {
      setLoadingById((prev) => ({ ...prev, [sectionId]: false }));
    }
  };

  useEffect(() => {
    if (!currentSection) return;
    void fetchRelated(currentSection.id);
  }, [currentSection?.id]);

  useEffect(() => {
    let cancelled = false;
    const idsToPrefetch = orderedIds.slice(1);
    const runPrefetch = async () => {
      for (const id of idsToPrefetch) {
        if (cancelled) return;
        await fetchRelated(id);
      }
    };

    const startPrefetch = () => {
      if (cancelled) return;
      void runPrefetch();
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (cb: IdleRequestCallback) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let idleHandle: number | null = null;
    if (typeof window !== "undefined" && idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(startPrefetch);
    } else {
      idleHandle = window.setTimeout(startPrefetch, 600);
    }

    return () => {
      cancelled = true;
      if (idleHandle !== null) {
        if (typeof window !== "undefined" && idleWindow.cancelIdleCallback) {
          idleWindow.cancelIdleCallback(idleHandle);
        } else {
          clearTimeout(idleHandle);
        }
      }
    };
  }, [orderedIds.join("|")]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setCurrentIndex((prev) => Math.min(prev + 1, sections.length - 1));
      }
      if (event.key === "ArrowLeft") {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [sections.length]);

  if (!currentSection) return null;

  const related = relatedById[currentSection.id];
  const isLoading = loadingById[currentSection.id];

  return (
    <div className="guide-shell">
      <div className="guide-stepper" role="tablist" aria-label="Guide steps">
        {sections.map((section, index) => {
          const isActive = index === currentIndex;
          const isComplete = index < currentIndex;
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`guide-step ${isActive ? "active" : ""} ${isComplete ? "complete" : ""}`}
              onClick={() => setCurrentIndex(index)}
            >
              <span className="guide-step-index">{index + 1}</span>
              <span className="guide-step-label">{section.title}</span>
            </button>
          );
        })}
      </div>

      <div className="guide-content panel">
        <p className="eyebrow">{currentSection.eyebrow}</p>
        <h2>{currentSection.title}</h2>
        <p className="lede">{currentSection.content.intro}</p>
        <div className="guide-copy">
          {currentSection.content.paragraphs.map((paragraph, index) => (
            <p key={`${currentSection.id}-${index}`}>{paragraph}</p>
          ))}
        </div>
        <div className="guide-takeaway">
          <span className="guide-takeaway-label">Key takeaway</span>
          <p>{currentSection.content.keyTakeaway}</p>
        </div>
      </div>

      <div className="guide-controls">
        <button
          type="button"
          className="button button-ghost"
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentIndex === 0}
        >
          Previous
        </button>
        <button
          type="button"
          className="button"
          onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, sections.length - 1))}
          disabled={currentIndex === sections.length - 1}
        >
          {currentIndex === sections.length - 2 ? "Final Step" : "Next"}
        </button>
      </div>

      <div className="guide-related panel">
        <div className="guide-related-header">
          <h3>Related resources</h3>
          <span className="guide-related-status">
            {isLoading ? "Loading resources..." : "Updated for this step"}
          </span>
        </div>

        {related ? (
          <div className="guide-related-grid">
            <div className="guide-related-column">
              <h4>Videos</h4>
              {related.videos.length ? (
                related.videos.map((video) => (
                  <div key={video.id} className="guide-related-item">
                    <VideoCard video={video} onClick={() => openExternal(video.url)} />
                  </div>
                ))
              ) : (
                <p className="muted">No videos yet. Check back soon.</p>
              )}
            </div>
            <div className="guide-related-column">
              <h4>Books</h4>
              {related.books.length ? (
                related.books.map((book) => (
                  <div key={book.id} className="guide-related-item">
                    <BookCard book={book} onClick={() => openExternal(getBookLink(book))} />
                  </div>
                ))
              ) : (
                <p className="muted">No books yet. Check back soon.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="muted">Loading related resources...</p>
        )}
      </div>
    </div>
  );
}
