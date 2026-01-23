import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

// Create Prisma Client with adapter (same as in src/lib/prisma.ts)
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Hash password using bcrypt (same as Better Auth)
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ Required environment variables not set:");
    if (!email) console.error("   ADMIN_EMAIL is missing");
    if (!password) console.error("   ADMIN_PASSWORD is missing");
    console.error("\nUsage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=yourpass npm run create-admin");
    process.exit(1);
  }

  try {
    console.log("Creating admin account...");
    console.log("Database URL:", process.env.DATABASE_URL ? "✓ Loaded" : "✗ Not found");

    // Try to delete existing user if it exists
    try {
      await prisma.user.delete({
        where: { email },
      });
      console.log("Deleted existing user.");
    } catch (e) {
      // User doesn't exist, which is fine
      console.log("No existing user found, creating new one...");
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0],
        emailVerified: true,
      },
    });

    console.log("User created:", user.id);

    const hashedPassword = await hashPassword(password);

    await prisma.account.create({
      data: {
        userId: user.id,
        providerId: "credential",
        accountId: user.email,
        password: hashedPassword,
      },
    });

    console.log("\nAdmin account created successfully!");
    console.log("Email:", email);
    console.log("You can now log in at your login page.");
  } catch (error: any) {
    console.error("❌ Error creating admin account:");
    console.error(error.message);
    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
  }
}

createAdmin();
