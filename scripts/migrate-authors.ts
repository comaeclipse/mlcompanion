import { PrismaClient } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
}

async function migrateAuthors() {
  console.log("Starting author migration...");

  // 1. Get all unique author names
  const books = await prisma.book.findMany({
    select: { id: true, authors: true }
  });

  const authorNamesSet = new Set<string>();
  books.forEach(book => {
    book.authors.forEach(author => authorNamesSet.add(author.trim()));
  });

  console.log(`Found ${authorNamesSet.size} unique authors`);

  // 2. Create Author records with unique slugs
  const authorMap = new Map<string, string>(); // name -> authorId

  for (const name of Array.from(authorNamesSet)) {
    let slug = generateSlug(name);
    let counter = 1;

    while (await prisma.author.findUnique({ where: { slug } })) {
      slug = `${generateSlug(name)}-${counter}`;
      counter++;
    }

    const author = await prisma.author.create({
      data: {
        name,
        slug,
        bio: null,
        photoUrl: null,
        createdBy: null,
      }
    });

    authorMap.set(name, author.id);
    console.log(`Created author: ${name} (${slug})`);
  }

  // 3. Create BookAuthor junction records
  for (const book of books) {
    for (let i = 0; i < book.authors.length; i++) {
      const authorName = book.authors[i].trim();
      const authorId = authorMap.get(authorName);

      if (authorId) {
        await prisma.bookAuthor.create({
          data: {
            bookId: book.id,
            authorId,
            order: i,
          }
        });
      }
    }
  }

  console.log("Migration complete!");
  console.log(`Created ${authorMap.size} authors and linked to ${books.length} books`);
}

migrateAuthors()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
