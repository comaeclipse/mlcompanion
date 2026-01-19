import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth-utils";

export const GET: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const channels = await prisma.channel.findMany({
    where: {
      createdBy: authResult.user.id,
    },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { videos: true } },
    },
  });

  return new Response(JSON.stringify(channels), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
