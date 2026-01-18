import type { APIRoute } from "astro";
import { verifyCredentials, createSession } from "../../../lib/auth";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("[LOGIN] Attempt for email:", email);

    if (!email || !password) {
      console.log("[LOGIN] Missing email or password");
      return new Response(JSON.stringify({ error: "Email and password required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await verifyCredentials(email, password);
    console.log("[LOGIN] Verify result:", user ? "User found" : "No user / wrong password");
    
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = await createSession(user.id);

    return new Response(JSON.stringify({ success: true, user: { id: user.id, email: user.email, name: user.name } }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `session_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Secure`,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
