import type { APIRoute } from "astro";
import { requireAuth } from "../../../lib/auth-utils";

function extractChannelId(input: string): string | null {
  try {
    const url = new URL(input);
    
    // Handle youtube.com/channel/CHANNEL_ID
    if (url.pathname.startsWith("/channel/")) {
      return url.pathname.split("/")[2] || null;
    }
    
    // Handle youtube.com/@handle or youtube.com/c/customname
    // These will need to be resolved via API search
    if (url.pathname.startsWith("/@") || url.pathname.startsWith("/c/")) {
      return null; // Will use search instead
    }
    
    return null;
  } catch {
    // If not a URL, assume it's a channel ID
    if (input.startsWith("UC") && input.length === 24) {
      return input;
    }
    return null;
  }
}

export const POST: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const body = await context.request.json();
  const { input } = body; // Can be channel URL, channel ID, or @handle

  if (!input) {
    return new Response(JSON.stringify({ error: "Channel input required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = import.meta.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "YouTube API key not configured" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    let channelId = extractChannelId(input);
    
    // If we couldn't extract a channel ID, try searching by username or handle
    if (!channelId) {
      const searchQuery = input.replace(/^[@\/]/, "").replace(/^c\//, "");
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(searchQuery)}&maxResults=1&key=${apiKey}`;
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        throw new Error("Failed to search for channel");
      }
      
      const searchData = await searchResponse.json();
      if (!searchData.items || searchData.items.length === 0) {
        return new Response(
          JSON.stringify({ error: "Channel not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      channelId = searchData.items[0].snippet.channelId;
    }

    // Fetch channel details
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ error: errorData.error?.message || "Failed to fetch channel metadata" }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Channel not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const channel = data.items[0];
    const snippet = channel.snippet;
    const statistics = channel.statistics;
    const branding = channel.brandingSettings?.channel;

    // Generate slug from channel name
    const slug = snippet.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const metadata = {
      channelId: channel.id,
      name: snippet.title,
      slug,
      url: `https://www.youtube.com/channel/${channel.id}`,
      description: snippet.description || "",
      thumbnailUrl:
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.default?.url ||
        null,
      subscriberCount: statistics?.subscriberCount ? parseInt(statistics.subscriberCount, 10) : null,
      videoCount: statistics?.videoCount ? parseInt(statistics.videoCount, 10) : null,
      viewCount: statistics?.viewCount ? parseInt(statistics.viewCount, 10) : null,
      customUrl: snippet.customUrl || branding?.unsubscribedTrailer || null,
      country: snippet.country || null,
      publishedAt: snippet.publishedAt || null,
    };

    return new Response(JSON.stringify(metadata), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching channel metadata:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch channel metadata" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
