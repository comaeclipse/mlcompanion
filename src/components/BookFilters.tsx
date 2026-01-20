import { useState } from "react";
import {
  BookSourceType,
  BookFunction,
  BookDifficulty,
  BookTradition,
  SOURCE_TYPE_LABELS,
  FUNCTION_LABELS,
  DIFFICULTY_LABELS,
  TRADITION_LABELS,
  getFacetColor,
} from "@/lib/book-facets";

export interface BookFilters {
  sourceType: BookSourceType | null;
  functions: BookFunction[];
  difficulty: BookDifficulty | null;
  traditions: BookTradition[];
}

interface BookFiltersProps {
  activeFilters: BookFilters;
  onFilterChange: (filters: BookFilters) => void;
}

export function BookFilters({ activeFilters, onFilterChange }: BookFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeCount =
    (activeFilters.sourceType ? 1 : 0) +
    activeFilters.functions.length +
    (activeFilters.difficulty ? 1 : 0) +
    activeFilters.traditions.length;

  const toggleSourceType = (value: BookSourceType) => {
    onFilterChange({
      ...activeFilters,
      sourceType: activeFilters.sourceType === value ? null : value,
    });
  };

  const toggleFunction = (value: BookFunction) => {
    const functions = activeFilters.functions.includes(value)
      ? activeFilters.functions.filter((f) => f !== value)
      : [...activeFilters.functions, value];
    onFilterChange({ ...activeFilters, functions });
  };

  const toggleDifficulty = (value: BookDifficulty) => {
    onFilterChange({
      ...activeFilters,
      difficulty: activeFilters.difficulty === value ? null : value,
    });
  };

  const toggleTradition = (value: BookTradition) => {
    const traditions = activeFilters.traditions.includes(value)
      ? activeFilters.traditions.filter((t) => t !== value)
      : [...activeFilters.traditions, value];
    onFilterChange({ ...activeFilters, traditions });
  };

  const clearAllFilters = () => {
    onFilterChange({
      sourceType: null,
      functions: [],
      difficulty: null,
      traditions: [],
    });
  };

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          background: "var(--paper-color)",
          border: "1px solid var(--border-color)",
          borderRadius: "8px",
          fontSize: "0.95rem",
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        <span>Filter Books</span>
        {activeCount > 0 && (
          <span
            style={{
              background: "var(--accent-color)",
              color: "white",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            {activeCount}
          </span>
        )}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            marginLeft: "auto",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isExpanded && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1.5rem",
            background: "var(--paper-color)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
          }}
        >
          {/* Source Type */}
          <fieldset style={{ border: "none", padding: 0, margin: "0 0 1.5rem 0" }}>
            <legend
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--muted-color)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.75rem",
              }}
            >
              Source Type
            </legend>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {(Object.entries(SOURCE_TYPE_LABELS) as [BookSourceType, string][]).map(([value, label]) => {
                const isActive = activeFilters.sourceType === value;
                const colors = getFacetColor("sourceType", value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleSourceType(value)}
                    style={{
                      padding: "0.5rem 1rem",
                      background: isActive ? colors.bg : "transparent",
                      color: isActive ? colors.text : "var(--ink-color)",
                      border: `1px solid ${isActive ? colors.text : "var(--border-color)"}`,
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: isActive ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Difficulty */}
          <fieldset style={{ border: "none", padding: 0, margin: "0 0 1.5rem 0" }}>
            <legend
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--muted-color)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.75rem",
              }}
            >
              Difficulty Level
            </legend>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {(Object.entries(DIFFICULTY_LABELS) as [BookDifficulty, string][]).map(([value, label]) => {
                const isActive = activeFilters.difficulty === value;
                const colors = getFacetColor("difficulty", value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleDifficulty(value)}
                    style={{
                      padding: "0.5rem 1rem",
                      background: isActive ? colors.bg : "transparent",
                      color: isActive ? colors.text : "var(--ink-color)",
                      border: `1px solid ${isActive ? colors.text : "var(--border-color)"}`,
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: isActive ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Function */}
          <fieldset style={{ border: "none", padding: 0, margin: "0 0 1.5rem 0" }}>
            <legend
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--muted-color)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.75rem",
              }}
            >
              Function
            </legend>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {(Object.entries(FUNCTION_LABELS) as [BookFunction, string][]).map(([value, label]) => {
                const isActive = activeFilters.functions.includes(value);
                const colors = getFacetColor("function", value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleFunction(value)}
                    style={{
                      padding: "0.5rem 1rem",
                      background: isActive ? colors.bg : "transparent",
                      color: isActive ? colors.text : "var(--ink-color)",
                      border: `1px solid ${isActive ? colors.text : "var(--border-color)"}`,
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: isActive ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Tradition */}
          <fieldset style={{ border: "none", padding: 0, margin: "0 0 1rem 0" }}>
            <legend
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--muted-color)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.75rem",
              }}
            >
              Tradition
            </legend>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {(Object.entries(TRADITION_LABELS) as [BookTradition, string][]).map(([value, label]) => {
                const isActive = activeFilters.traditions.includes(value);
                const colors = getFacetColor("tradition", value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleTradition(value)}
                    style={{
                      padding: "0.5rem 1rem",
                      background: isActive ? colors.bg : "transparent",
                      color: isActive ? colors.text : "var(--ink-color)",
                      border: `1px solid ${isActive ? colors.text : "var(--border-color)"}`,
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: isActive ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Clear All Button */}
          {activeCount > 0 && (
            <button
              onClick={clearAllFilters}
              style={{
                padding: "0.5rem 1rem",
                background: "transparent",
                color: "var(--accent-color)",
                border: "1px solid var(--accent-color)",
                borderRadius: "6px",
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
