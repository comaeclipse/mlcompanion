import type { APIRoute } from "astro";
import { put } from "@vercel/blob";
import { requireAuth } from "../../../lib/auth-utils";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const POST: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  try {
    const formData = await context.request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: "File too large. Maximum size is 5MB." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `author-photos/${authResult.user.id}/${timestamp}.${extension}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return new Response(
      JSON.stringify({ url: blob.url, filename }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[UPLOAD AUTHOR PHOTO] Error:", error);
    return new Response(JSON.stringify({ error: "Failed to upload image" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
