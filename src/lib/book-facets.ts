/**
 * Book faceted classification constants and utilities
 * Provides human-readable labels and validation for book taxonomy
 */

import type { BookSourceType, BookFunction, BookDifficulty, BookTradition } from "../generated/prisma/client";

// Re-export types for convenience
export type { BookSourceType, BookFunction, BookDifficulty, BookTradition } from "../generated/prisma/client";

// Source Type Labels
export const SOURCE_TYPE_LABELS: Record<BookSourceType, string> = {
  primary: "Primary Source",
  secondary: "Secondary Source",
};

export const SOURCE_TYPE_DESCRIPTIONS: Record<BookSourceType, string> = {
  primary: "Written by Marx, Engels, Lenin, etc. as part of developing Marxism",
  secondary: "Written later to explain, interpret, or critique Marxism",
};

// Function Labels
export const FUNCTION_LABELS: Record<BookFunction, string> = {
  foundational: "Foundational Text",
  theory: "Theoretical Work",
  introductory: "Introduction",
  educational: "Educational Guide",
  historical: "Historical Analysis",
  commentary: "Commentary",
  polemic: "Polemic",
};

export const FUNCTION_DESCRIPTIONS: Record<BookFunction, string> = {
  foundational: "Core texts that establish fundamental principles",
  theory: "Develops or explains theoretical concepts",
  introductory: "Designed for newcomers to the subject",
  educational: "Teaching and learning resource",
  historical: "Analyzes historical events or periods",
  commentary: "Interprets or critiques other works",
  polemic: "Argumentative writing against opposing views",
};

// Difficulty Labels
export const DIFFICULTY_LABELS: Record<BookDifficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const DIFFICULTY_DESCRIPTIONS: Record<BookDifficulty, string> = {
  beginner: "Accessible to those new to Marxism",
  intermediate: "Requires some familiarity with Marxist concepts",
  advanced: "For readers with significant background knowledge",
};

// Tradition Labels
export const TRADITION_LABELS: Record<BookTradition, string> = {
  classical_marxism: "Classical Marxism",
  leninism: "Leninism",
  trotskyism: "Trotskyism",
  maoism: "Maoism",
  western_marxism: "Western Marxism",
  marxism_leninism: "Marxism-Leninism",
  other: "Other",
};

export const TRADITION_DESCRIPTIONS: Record<BookTradition, string> = {
  classical_marxism: "Marx and Engels' original works and immediate followers",
  leninism: "Lenin's theoretical and practical contributions",
  trotskyism: "Trotskyist tradition and Fourth International",
  maoism: "Mao's theories and Chinese revolutionary tradition",
  western_marxism: "Frankfurt School and European Marxist philosophy",
  marxism_leninism: "Soviet-era theoretical synthesis",
  other: "Other Marxist traditions and tendencies",
};

// Color schemes for UI display
export const SOURCE_TYPE_COLORS: Record<BookSourceType, { bg: string; text: string }> = {
  primary: { bg: "rgba(220, 38, 38, 0.12)", text: "#dc2626" },
  secondary: { bg: "rgba(37, 99, 235, 0.12)", text: "#2563eb" },
};

export const DIFFICULTY_COLORS: Record<BookDifficulty, { bg: string; text: string }> = {
  beginner: { bg: "rgba(34, 197, 94, 0.12)", text: "#22c55e" },
  intermediate: { bg: "rgba(234, 179, 8, 0.12)", text: "#eab308" },
  advanced: { bg: "rgba(168, 85, 247, 0.12)", text: "#a855f7" },
};

export const FUNCTION_COLORS = {
  bg: "rgba(59, 130, 246, 0.12)",
  text: "#3b82f6",
};

export const TRADITION_COLORS = {
  bg: "rgba(236, 72, 153, 0.12)",
  text: "#ec4899",
};

// Helper function to format facet values for display
export function formatFacetLabel(facetType: "sourceType" | "function" | "difficulty" | "tradition", value: string): string {
  switch (facetType) {
    case "sourceType":
      return SOURCE_TYPE_LABELS[value as BookSourceType] || value;
    case "function":
      return FUNCTION_LABELS[value as BookFunction] || value;
    case "difficulty":
      return DIFFICULTY_LABELS[value as BookDifficulty] || value;
    case "tradition":
      return TRADITION_LABELS[value as BookTradition] || value;
    default:
      return value;
  }
}

// Helper function to get color for facet value
export function getFacetColor(
  facetType: "sourceType" | "function" | "difficulty" | "tradition",
  value: string
): { bg: string; text: string } {
  switch (facetType) {
    case "sourceType":
      return SOURCE_TYPE_COLORS[value as BookSourceType] || { bg: "#f0f0f0", text: "#666" };
    case "difficulty":
      return DIFFICULTY_COLORS[value as BookDifficulty] || { bg: "#f0f0f0", text: "#666" };
    case "function":
      return FUNCTION_COLORS;
    case "tradition":
      return TRADITION_COLORS;
    default:
      return { bg: "#f0f0f0", text: "#666" };
  }
}

// Validation helpers
export function isValidSourceType(value: string): value is BookSourceType {
  return value in SOURCE_TYPE_LABELS;
}

export function isValidFunction(value: string): value is BookFunction {
  return value in FUNCTION_LABELS;
}

export function isValidDifficulty(value: string): value is BookDifficulty {
  return value in DIFFICULTY_LABELS;
}

export function isValidTradition(value: string): value is BookTradition {
  return value in TRADITION_LABELS;
}

// Get all valid enum values
export const ALL_SOURCE_TYPES = Object.keys(SOURCE_TYPE_LABELS) as BookSourceType[];
export const ALL_FUNCTIONS = Object.keys(FUNCTION_LABELS) as BookFunction[];
export const ALL_DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as BookDifficulty[];
export const ALL_TRADITIONS = Object.keys(TRADITION_LABELS) as BookTradition[];
