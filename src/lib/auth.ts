import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Simple session-based auth - no Better Auth
export async function verifyCredentials(email: string, password: string) {
  console.log("[AUTH] Looking for account with email:", email);
  
  const account = await prisma.account.findFirst({
    where: {
      accountId: email,
      providerId: "credential",
    },
    include: { user: true },
  });

  console.log("[AUTH] Account found:", !!account);

  if (!account?.password || !account.user) {
    console.log("[AUTH] No password or no user on account");
    return null;
  }

  console.log("[AUTH] Comparing password...");
  const valid = await bcrypt.compare(password, account.password);
  console.log("[AUTH] Password valid:", valid);
  
  if (!valid) {
    return null;
  }

  return account.user;
}

export async function createSession(userId: string) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function getSessionFromToken(token: string) {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return { session, user: session.user };
}

export async function getSessionFromRequest(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const match = cookies.match(/session_token=([^;]+)/);
  const token = match?.[1];

  if (!token) return null;
  return getSessionFromToken(token);
}

export async function deleteSession(token: string) {
  try {
    await prisma.session.delete({ where: { token } });
  } catch {
    // Session may not exist
  }
}
