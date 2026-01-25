export enum SlideType {
  TITLE = "TITLE",
  CONTENT_TEXT = "CONTENT_TEXT",
  CONTENT_SPLIT = "CONTENT_SPLIT",
  QUOTE = "QUOTE",
  CONCEPT_CARD = "CONCEPT_CARD",
  QUIZ = "QUIZ",
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizData {
  question: string;
  options: QuizOption[];
}

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  content?: string;
  image?: string;
  bullets?: string[];
  quote?: {
    text: string;
    author: string;
    source?: string;
  };
  keyConcept?: {
    term: string;
    definition: string;
    analogy: string;
  };
  quiz?: QuizData;
}
