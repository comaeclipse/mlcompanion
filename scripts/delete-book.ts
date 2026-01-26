#!/usr/bin/env tsx

import dotenv from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const bookId = process.argv[2];

  if (!bookId) {
    console.error("\nUsage: npm run delete-book -- <book-id>\n");
    process.exit(1);
  }

  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        title: true,
        authors: true,
      }
    });

    if (!book) {
      console.error(`\n❌ Book with ID ${bookId} not found.\n`);
      await prisma.$disconnect();
      await pool.end();
      process.exit(1);
    }

    console.log(`\nDeleting book:`);
    console.log(`  ID: ${book.id}`);
    console.log(`  Title: ${book.title}`);
    console.log(`  Authors: ${book.authors.join(", ")}`);
    console.log();

    await prisma.book.delete({
      where: { id: bookId }
    });

    console.log(`✅ Book deleted successfully!\n`);
  } catch (error) {
    console.error("\n❌ Error deleting book:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
