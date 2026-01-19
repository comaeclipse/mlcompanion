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

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate read free links array
 */
export function validateReadFreeLinks(links: string[]): { valid: boolean; error?: string } {
  if (!Array.isArray(links)) {
    return { valid: false, error: "Read free links must be an array" };
  }

  for (const link of links) {
    if (!validateUrl(link)) {
      return { valid: false, error: `Invalid URL: ${link}` };
    }
  }

  return { valid: true };
}

/**
 * Validate purchase links structure
 */
export function validatePurchaseLinks(purchaseLinks: any): { valid: boolean; error?: string } {
  if (!purchaseLinks) {
    return { valid: true };
  }

  if (typeof purchaseLinks !== "object") {
    return { valid: false, error: "Purchase links must be an object" };
  }

  if (purchaseLinks.amazon && !validateUrl(purchaseLinks.amazon)) {
    return { valid: false, error: "Invalid Amazon URL" };
  }

  if (purchaseLinks.custom) {
    if (!Array.isArray(purchaseLinks.custom)) {
      return { valid: false, error: "Custom purchase links must be an array" };
    }

    for (const link of purchaseLinks.custom) {
      if (!link.label || !link.url) continue;

      if (typeof link.label !== "string") {
        return { valid: false, error: "Custom link label must be a string" };
      }

      if (!validateUrl(link.url)) {
        return { valid: false, error: `Invalid custom link URL: ${link.url}` };
      }
    }
  }

  return { valid: true };
}

/**
 * Clean purchase links by removing empty custom entries
 */
export function cleanPurchaseLinks(purchaseLinks: any): any {
  if (!purchaseLinks) return null;

  const cleaned: any = {};

  if (purchaseLinks.amazon) {
    cleaned.amazon = purchaseLinks.amazon;
  }

  if (purchaseLinks.custom && Array.isArray(purchaseLinks.custom)) {
    const validCustom = purchaseLinks.custom.filter(
      (link: any) => link.label && link.url
    );
    if (validCustom.length > 0) {
      cleaned.custom = validCustom;
    }
  }

  return Object.keys(cleaned).length > 0 ? cleaned : null;
}

export function slugifyTitle(title: string): string {
  const normalized = title
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "book";
}
