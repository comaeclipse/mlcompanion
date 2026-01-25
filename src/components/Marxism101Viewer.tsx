import { useState, useEffect } from "react";
import { CURRICULUM } from "../lib/marxism101-content";
import { SlideType, type Slide, type QuizOption } from "../lib/marxism101-types";

// --- Title Slide ---
function TitleSlide({ slide }: { slide: Slide }) {
  return (
    <div className="m101-slide m101-slide-title">
      <div className="m101-title-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
      <h1 className="m101-title-main">{slide.title}</h1>
      {slide.subtitle && <p className="m101-title-sub">{slide.subtitle}</p>}
      {slide.content && <p className="m101-title-content">{slide.content}</p>}
    </div>
  );
}

// --- Content Text Slide ---
function ContentTextSlide({ slide }: { slide: Slide }) {
  return (
    <div className="m101-slide m101-slide-content">
      <h2 className="m101-content-title">{slide.title}</h2>
      {slide.content && <p className="m101-content-text">{slide.content}</p>}
      {slide.bullets && (
        <ul className="m101-bullets">
          {slide.bullets.map((bullet, idx) => (
            <li key={idx}>
              <span className="m101-bullet-dot" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- Split Content Slide ---
function ContentSplitSlide({ slide }: { slide: Slide }) {
  return (
    <div className="m101-slide m101-slide-split">
      <div className="m101-split-text">
        <h2 className="m101-content-title">{slide.title}</h2>
        {slide.content && <p className="m101-content-text">{slide.content}</p>}
        {slide.bullets && (
          <ul className="m101-bullets">
            {slide.bullets.map((bullet, idx) => (
              <li key={idx}>
                <span className="m101-bullet-dot" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {slide.image && (
        <div className="m101-split-image">
          <img src={slide.image} alt={slide.title} />
        </div>
      )}
    </div>
  );
}

// --- Quote Slide ---
function QuoteSlide({ slide }: { slide: Slide }) {
  return (
    <div className="m101-slide m101-slide-quote">
      <div className="m101-quote-mark">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" opacity="0.15">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>
      <blockquote className="m101-quote-text">"{slide.quote?.text}"</blockquote>
      <div className="m101-quote-attribution">
        <cite className="m101-quote-author">- {slide.quote?.author}</cite>
        {slide.quote?.source && (
          <span className="m101-quote-source">{slide.quote.source}</span>
        )}
      </div>
    </div>
  );
}

// --- Concept Card Slide ---
function ConceptCardSlide({ slide }: { slide: Slide }) {
  return (
    <div className="m101-slide m101-slide-concept">
      <span className="m101-concept-label">Key Concept</span>
      <div className="m101-concept-card">
        <h3 className="m101-concept-term">{slide.keyConcept?.term}</h3>
        <div className="m101-concept-section">
          <h4 className="m101-concept-section-label">Definition</h4>
          <p>{slide.keyConcept?.definition}</p>
        </div>
        <div className="m101-concept-analogy">
          <div className="m101-concept-analogy-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h4>Analogy</h4>
          </div>
          <p>"{slide.keyConcept?.analogy}"</p>
        </div>
      </div>
    </div>
  );
}

// --- Quiz Slide ---
function QuizSlide({ slide }: { slide: Slide }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (id: string) => {
    if (showFeedback) return;
    setSelectedOption(id);
    setShowFeedback(true);
  };

  const resetQuiz = () => {
    setSelectedOption(null);
    setShowFeedback(false);
  };

  // Reset when slide changes
  useEffect(() => {
    resetQuiz();
  }, [slide.id]);

  return (
    <div className="m101-slide m101-slide-quiz">
      <h2 className="m101-content-title">{slide.title}</h2>
      <div className="m101-quiz-card">
        <h3 className="m101-quiz-question">{slide.quiz?.question}</h3>
        <div className="m101-quiz-options">
          {slide.quiz?.options.map((option: QuizOption) => {
            let optionClass = "m101-quiz-option";
            if (showFeedback) {
              if (option.id === selectedOption) {
                optionClass += option.isCorrect ? " correct" : " incorrect";
              } else if (option.isCorrect) {
                optionClass += " correct faded";
              } else {
                optionClass += " faded";
              }
            }
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={showFeedback}
                className={optionClass}
              >
                <span>{option.text}</span>
                {showFeedback && option.id === selectedOption && (
                  <span className="m101-quiz-icon">
                    {option.isCorrect ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {showFeedback && selectedOption && (
          <div
            className={`m101-quiz-feedback ${
              slide.quiz?.options.find((o) => o.id === selectedOption)?.isCorrect
                ? "correct"
                : "incorrect"
            }`}
          >
            <p>{slide.quiz?.options.find((o) => o.id === selectedOption)?.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Viewer Component ---
export default function Marxism101Viewer() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const currentSlide = CURRICULUM[currentSlideIndex];
  const progress = ((currentSlideIndex + 1) / CURRICULUM.length) * 100;

  const nextSlide = () => {
    if (currentSlideIndex < CURRICULUM.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlideIndex]);

  const renderSlide = () => {
    const slide = currentSlide;
    const key = slide.id;

    switch (slide.type) {
      case SlideType.TITLE:
        return <TitleSlide key={key} slide={slide} />;
      case SlideType.CONTENT_TEXT:
        return <ContentTextSlide key={key} slide={slide} />;
      case SlideType.CONTENT_SPLIT:
        return <ContentSplitSlide key={key} slide={slide} />;
      case SlideType.QUOTE:
        return <QuoteSlide key={key} slide={slide} />;
      case SlideType.CONCEPT_CARD:
        return <ConceptCardSlide key={key} slide={slide} />;
      case SlideType.QUIZ:
        return <QuizSlide key={key} slide={slide} />;
      default:
        return <ContentTextSlide key={key} slide={slide} />;
    }
  };

  return (
    <div className="m101-viewer">
      {/* Progress Bar */}
      <div className="m101-progress-bar">
        <div className="m101-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Slide Content */}
      <div className="m101-slide-container">{renderSlide()}</div>

      {/* Controls */}
      <div className="m101-controls">
        <div className="m101-counter">
          <span className="m101-counter-current">{currentSlideIndex + 1}</span>
          <span className="m101-counter-sep">/</span>
          <span className="m101-counter-total">{CURRICULUM.length}</span>
        </div>

        <div className="m101-nav-buttons">
          <button
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className="m101-nav-btn m101-nav-prev"
            aria-label="Previous Slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            disabled={currentSlideIndex === CURRICULUM.length - 1}
            className="m101-nav-btn m101-nav-next"
            aria-label="Next Slide"
          >
            <span>Next</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="m101-keyboard-hint">
          <kbd>←</kbd> <kbd>→</kbd> to navigate
        </div>
      </div>
    </div>
  );
}
