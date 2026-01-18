import type { APIContext } from "astro";
import { getSessionFromRequest } from "./auth";

export async function getSession(request: Request) {
  return getSessionFromRequest(request);
}

export async function requireAuth(context: APIContext) {
  const result = await getSessionFromRequest(context.request);

  if (!result?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return { session: result.session, user: result.user };
}
