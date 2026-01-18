export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

export function unslugifyTag(slug: string): string {
  return slug.replace(/-/g, " ");
}
