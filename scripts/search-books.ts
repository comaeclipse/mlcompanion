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
  const searchTerm = process.argv.slice(2).join(" ");

  if (!searchTerm) {
    console.error("\nUsage: npm run search-books -- <search term>\n");
    process.exit(1);
  }

  try {
    const books = await prisma.book.findMany({
      where: {
        title: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        title: true,
        authors: true,
        publishedDate: true,
        isPublished: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      }
    });

    if (books.length === 0) {
      console.log(`\nNo books found matching "${searchTerm}"\n`);
    } else {
      console.log(`\nFound ${books.length} book(s) matching "${searchTerm}":\n`);
      books.forEach((book, index) => {
        console.log(`${index + 1}. ${book.title}`);
        console.log(`   ID: ${book.id}`);
        console.log(`   Authors: ${book.authors.join(", ")}`);
        console.log(`   Published: ${book.publishedDate || "(none)"}`);
        console.log(`   Status: ${book.isPublished ? "Published" : "Unpublished"}`);
        console.log(`   Created: ${book.createdAt.toISOString()}`);
        console.log();
      });
    }
  } catch (error) {
    console.error("\n❌ Error searching books:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
