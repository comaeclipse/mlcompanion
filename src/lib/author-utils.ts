export function generateAuthorSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function validateSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const { prisma } = await import("./prisma");
  const existing = await prisma.author.findUnique({ where: { slug } });
  return !existing || existing.id === excludeId;
}

export async function suggestUniqueSlug(baseName: string): Promise<string> {
  const { prisma } = await import("./prisma");
  let slug = generateAuthorSlug(baseName);
  let counter = 1;

  while (!(await isSlugUnique(slug))) {
    slug = `${generateAuthorSlug(baseName)}-${counter}`;
    counter++;
  }

  return slug;
}
