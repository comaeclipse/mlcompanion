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
  try {
    console.log("Creating admin account...");
    console.log("Database URL:", process.env.DATABASE_URL ? "✓ Loaded" : "✗ Not found");

    // Try to delete existing user if it exists
    try {
      await prisma.user.delete({
        where: { email: "***REDACTED***" },
      });
      console.log("Deleted existing user.");
    } catch (e) {
      // User doesn't exist, which is fine
      console.log("No existing user found, creating new one...");
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: "***REDACTED***",
        name: "mladmin",
        emailVerified: true,
      },
    });

    console.log("✅ User created:", user.id);

    // Create the account with password
    // Note: Better Auth uses bcrypt for password hashing
    // We need to install bcryptjs to hash properly
    const hashedPassword = await hashPassword("***REDACTED***");

    await prisma.account.create({
      data: {
        userId: user.id,
        providerId: "credential",
        accountId: user.email,
        password: hashedPassword,
      },
    });

    console.log("\n✅ Admin account created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email: ***REDACTED***");
    console.log("👤 Username: mladmin");
    console.log("🔑 Password: ***REDACTED***");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n✨ Password is properly hashed with bcrypt (compatible with Better Auth).");
    console.log("You can now log in at your login page!");
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
