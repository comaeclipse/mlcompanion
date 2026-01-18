import type { APIRoute } from "astro";

const YT_HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "music.youtube.com"];

function isYouTube(url: URL) {
  return YT_HOSTS.includes(url.hostname.toLowerCase());
}

function extractYouTubeId(url: URL) {
  const host = url.hostname.toLowerCase();
  if (host === "youtu.be") {
    return url.pathname.slice(1) || null;
  }
  const searchId = url.searchParams.get("v");
  if (searchId) return searchId;
  const parts = url.pathname.split("/").filter(Boolean);
  // /shorts/{id} or /embed/{id}
  if (parts.length >= 2 && (parts[0] === "shorts" || parts[0] === "embed")) {
    return parts[1];
  }
  return null;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const rawUrl = body?.url;

    if (!rawUrl || typeof rawUrl !== "string") {
      return new Response(JSON.stringify({ error: "Missing url" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid url" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!isYouTube(parsed)) {
      return new Response(JSON.stringify({ error: "Only YouTube URLs are supported" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const videoId = extractYouTubeId(parsed);
    if (!videoId) {
      return new Response(JSON.stringify({ error: "Could not parse video id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "YOUTUBE_API_KEY is not configured on the server" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    apiUrl.searchParams.set("part", "snippet,contentDetails");
    apiUrl.searchParams.set("id", videoId);
    apiUrl.searchParams.set("key", apiKey);

    const res = await fetch(apiUrl.toString());
    if (!res.ok) {
      console.error("[YOUTUBE API] Failed:", await res.text());
      return new Response(JSON.stringify({ error: "Failed to fetch metadata from YouTube" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const item = data?.items?.[0];
    const snippet = item?.snippet;
    const contentDetails = item?.contentDetails;

    // Parse duration from ISO 8601 format (PT1H2M10S -> 1:02:10)
    let duration = null;
    if (contentDetails?.duration) {
      const match = contentDetails.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (match) {
        const hours = parseInt(match[1] || "0");
        const minutes = parseInt(match[2] || "0");
        const seconds = parseInt(match[3] || "0");
        if (hours > 0) {
          duration = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        } else {
          duration = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }
      }
    }

    // Get highest quality thumbnail
    const thumbnails = snippet?.thumbnails;
    const thumbnailUrl =
      thumbnails?.maxres?.url ||
      thumbnails?.standard?.url ||
      thumbnails?.high?.url ||
      thumbnails?.medium?.url ||
      thumbnails?.default?.url ||
      null;

    return new Response(
      JSON.stringify({
        title: snippet?.title ?? null,
        description: snippet?.description ?? null,
        thumbnailUrl,
        duration,
        channelName: snippet?.channelTitle ?? null,
        publishedAt: snippet?.publishedAt ?? null,
        tags: snippet?.tags ?? [],
        category: snippet?.categoryId ?? null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[YOUTUBE API] Error:", error);
    return new Response(JSON.stringify({ error: "Metadata fetch failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
