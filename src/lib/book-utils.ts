/**
 * Parse ISBN from various formats (ISBN-10, ISBN-13, with or without hyphens)
 * Returns normalized ISBN without hyphens
 */
export function parseISBN(input: string): { isbn10: string | null; isbn13: string | null } {
  const cleaned = input.replace(/[-\s]/g, "");
  
  let isbn10: string | null = null;
  let isbn13: string | null = null;

  // ISBN-13 (13 digits)
  if (/^\d{13}$/.test(cleaned)) {
    isbn13 = cleaned;
  }
  // ISBN-10 (10 digits, last can be X)
  else if (/^\d{9}[\dX]$/i.test(cleaned)) {
    isbn10 = cleaned.toUpperCase();
  }

  return { isbn10, isbn13 };
}

/**
 * Validate ISBN-10 or ISBN-13
 */
export function validateISBN(isbn: string): boolean {
  const cleaned = isbn.replace(/[-\s]/g, "");
  
  // ISBN-13 validation
  if (/^\d{13}$/.test(cleaned)) {
    const digits = cleaned.split("").map(Number);
    const checksum = digits.reduce((sum, digit, index) => {
      return sum + digit * (index % 2 === 0 ? 1 : 3);
    }, 0);
    return checksum % 10 === 0;
  }
  
  // ISBN-10 validation
  if (/^\d{9}[\dX]$/i.test(cleaned)) {
    const digits = cleaned.split("");
    const checksum = digits.reduce((sum, char, index) => {
      const value = char.toUpperCase() === "X" ? 10 : parseInt(char);
      return sum + value * (10 - index);
    }, 0);
    return checksum % 11 === 0;
  }
  
  return false;
}

/**
 * Get Google Books cover image URL from ISBN
 */
export function getGoogleBooksCover(isbn: string): string {
  const cleaned = isbn.replace(/[-\s]/g, "");
  return `https://books.google.com/books/content?id=${cleaned}&printsec=frontcover&img=1&zoom=1`;
}

/**
 * Get Open Library cover image URL from ISBN
 */
export function getOpenLibraryCover(isbn: string, size: "S" | "M" | "L" = "L"): string {
  const cleaned = isbn.replace(/[-\s]/g, "");
  return `https://covers.openlibrary.org/b/isbn/${cleaned}-${size}.jpg`;
}

/**
 * Format authors array for display
 */
export function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return "Unknown Author";
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return authors.join(" and ");
  return `${authors.slice(0, -1).join(", ")}, and ${authors[authors.length - 1]}`;
}
