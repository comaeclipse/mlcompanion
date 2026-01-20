import { PrismaClient, BookSourceType, BookFunction, BookDifficulty, BookTradition } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper function to detect if book is a primary source based on keywords and author
function isPrimarySource(title: string, description: string, authors: string[], publishedDate: string | null): boolean {
  const primaryKeywords = [
    "manifesto",
    "das kapital",
    "capital volume",
    "grundrisse",
    "communist manifesto",
    "wage labour",
    "civil war in france",
    "german ideology",
    "theses on feuerbach",
    "principles of communism",
    "anti-dühring",
    "dialectics of nature",
    "origin of the family",
    "state and revolution",
    "imperialism",
    "what is to be done",
    "left-wing communism",
    "terrorism and communism",
    "permanent revolution",
    "revolution betrayed",
    "history of the russian revolution",
  ];

  const text = (title + " " + description).toLowerCase();

  // Check for primary source keywords
  if (primaryKeywords.some(keyword => text.includes(keyword))) {
    return true;
  }

  // Check for primary authors
  const primaryAuthors = [
    "karl marx",
    "marx",
    "friedrich engels",
    "engels",
    "vladimir lenin",
    "lenin",
    "leon trotsky",
    "trotsky",
    "joseph stalin",
    "stalin",
    "rosa luxemburg",
    "luxemburg",
    "mao zedong",
    "mao tse-tung",
    "antonio gramsci",
    "gramsci",
  ];

  const authorText = authors.join(" ").toLowerCase();
  if (primaryAuthors.some(author => authorText.includes(author))) {
    return true;
  }

  // Books published before 1940 by known Marxist authors are likely primary
  if (publishedDate) {
    const year = parseInt(publishedDate.substring(0, 4));
    if (year < 1940 && primaryAuthors.some(author => authorText.includes(author))) {
      return true;
    }
  }

  return false;
}

// Detect functions based on title and description
function detectFunctions(title: string, description: string): BookFunction[] {
  const text = (title + " " + description).toLowerCase();
  const functions: Set<BookFunction> = new Set();

  const functionKeywords = {
    foundational: [
      "manifesto",
      "foundational",
      "fundamental",
      "essential",
      "classic",
      "das kapital",
      "capital volume",
    ],
    theory: [
      "theory",
      "theoretical",
      "philosophy",
      "dialectics",
      "materialism",
      "political economy",
    ],
    introductory: [
      "introduction",
      "intro to",
      "beginner",
      "what is",
      "basics",
      "primer",
      "getting started",
      "for beginners",
    ],
    educational: [
      "guide",
      "handbook",
      "textbook",
      "reader",
      "study",
      "learn",
      "understanding",
      "explained",
    ],
    historical: [
      "history",
      "historical",
      "revolution of",
      "civil war",
      "struggle",
      "movement",
    ],
    commentary: [
      "commentary",
      "critique",
      "analysis",
      "interpretation",
      "review",
      "reading",
    ],
  };

  for (const [func, keywords] of Object.entries(functionKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      functions.add(func as BookFunction);
    }
  }

  // Default to educational if no functions detected
  if (functions.size === 0) {
    functions.add("educational");
  }

  return Array.from(functions);
}

// Detect difficulty based on page count, title, and description
function detectDifficulty(title: string, description: string, pageCount: number | null): BookDifficulty {
  const text = (title + " " + description).toLowerCase();

  // Explicit difficulty keywords
  if (text.includes("beginner") || text.includes("introduction") || text.includes("what is")) {
    return "beginner";
  }
  if (text.includes("advanced") || text.includes("theoretical")) {
    return "advanced";
  }

  // Page count heuristics
  if (pageCount !== null) {
    if (pageCount < 150) return "beginner";
    if (pageCount > 400) return "advanced";
  }

  // Specific difficult works
  const advancedWorks = [
    "das kapital",
    "capital volume",
    "grundrisse",
    "dialectics of nature",
    "anti-dühring",
  ];
  if (advancedWorks.some(work => text.includes(work))) {
    return "advanced";
  }

  // Default to intermediate
  return "intermediate";
}

// Detect traditions based on authors and content
function detectTraditions(title: string, description: string, authors: string[]): BookTradition[] {
  const text = (title + " " + description).toLowerCase();
  const authorText = authors.join(" ").toLowerCase();
  const traditions: Set<BookTradition> = new Set();

  // Marx and Engels - Classical Marxism
  if (authorText.includes("marx") || authorText.includes("engels")) {
    traditions.add("classical_marxism");
  }

  // Lenin - Leninism/Marxism-Leninism
  if (authorText.includes("lenin") && !authorText.includes("trotsky")) {
    traditions.add("leninism");
    traditions.add("marxism_leninism");
  }

  // Trotsky - Trotskyism
  if (authorText.includes("trotsky") || text.includes("trotskyism") || text.includes("trotskyist")) {
    traditions.add("trotskyism");
  }

  // Mao - Maoism
  if (authorText.includes("mao") || text.includes("maoism") || text.includes("maoist")) {
    traditions.add("maoism");
  }

  // Stalin - Marxism-Leninism
  if (authorText.includes("stalin")) {
    traditions.add("marxism_leninism");
  }

  // Western Marxism indicators
  const westernMarxists = [
    "lukács",
    "korsch",
    "gramsci",
    "adorno",
    "horkheimer",
    "marcuse",
    "benjamin",
    "althusser",
    "sartre",
  ];
  if (westernMarxists.some(author => authorText.includes(author))) {
    traditions.add("western_marxism");
  }

  // Text-based tradition detection
  if (text.includes("western marxism")) {
    traditions.add("western_marxism");
  }

  return Array.from(traditions);
}

async function migrateBookFacets() {
  console.log("Starting book facet migration...\n");

  const books = await prisma.book.findMany({
    where: {
      OR: [
        { sourceType: null },
        { functions: { isEmpty: true } },
        { difficulty: null },
      ],
    },
  });

  console.log(`Found ${books.length} books to migrate.\n`);

  let updated = 0;
  let skipped = 0;

  for (const book of books) {
    const changes: any = {};
    let hasChanges = false;

    // Detect sourceType if missing
    if (!book.sourceType) {
      const isPrimary = isPrimarySource(
        book.title,
        book.description,
        book.authors,
        book.publishedDate
      );
      changes.sourceType = isPrimary ? BookSourceType.primary : BookSourceType.secondary;
      hasChanges = true;
    }

    // Detect functions if missing
    if (book.functions.length === 0) {
      changes.functions = detectFunctions(book.title, book.description);
      hasChanges = true;
    }

    // Detect difficulty if missing
    if (!book.difficulty) {
      changes.difficulty = detectDifficulty(book.title, book.description, book.pageCount);
      hasChanges = true;
    }

    // Detect traditions if missing
    if (book.traditions.length === 0) {
      const detectedTraditions = detectTraditions(book.title, book.description, book.authors);
      if (detectedTraditions.length > 0) {
        changes.traditions = detectedTraditions;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await prisma.book.update({
        where: { id: book.id },
        data: changes,
      });

      console.log(`✓ Updated: ${book.title}`);
      console.log(`  - Authors: ${book.authors.join(", ")}`);
      if (changes.sourceType) {
        console.log(`  - Source Type: ${changes.sourceType}`);
      }
      if (changes.functions) {
        console.log(`  - Functions: ${changes.functions.join(", ")}`);
      }
      if (changes.difficulty) {
        console.log(`  - Difficulty: ${changes.difficulty}`);
      }
      if (changes.traditions && changes.traditions.length > 0) {
        console.log(`  - Traditions: ${changes.traditions.join(", ")}`);
      }
      console.log();

      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\nMigration complete!`);
  console.log(`Updated: ${updated} books`);
  console.log(`Skipped: ${skipped} books (already had facets)`);

  await prisma.$disconnect();
}

migrateBookFacets().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
