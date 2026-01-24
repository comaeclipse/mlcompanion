import type { APIRoute } from "astro";
import { requireAuth } from "../../../lib/auth-utils";
import { searchPodcasts, isPodcastIndexConfigured } from "../../../lib/podcast-index";

interface SearchResult {
  name: string;
  author: string;
  artworkUrl: string;
  feedUrl: string;
  itunesId: number | null;
  episodeCount: number;
  categories: string[];
}

export const POST: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const body = await context.request.json();
  const { query } = body;

  if (!query || typeof query !== "string" || query.trim().length < 2) {
    return new Response(JSON.stringify({ error: "Query must be at least 2 characters" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const results: SearchResult[] = [];

    // Primary: Podcast Index API (richer data, includes feed URL)
    if (isPodcastIndexConfigured()) {
      const piResults = await searchPodcasts(query.trim());
      for (const feed of piResults) {
        results.push({
          name: feed.title,
          author: feed.author,
          artworkUrl: feed.image || "",
          feedUrl: feed.url || "",
          itunesId: feed.itunesId || null,
          episodeCount: feed.episodeCount || 0,
          categories: feed.categories ? Object.values(feed.categories) : [],
        });
      }
    }

    // Fallback: iTunes Search API (no key required)
    if (results.length === 0) {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&media=podcast&limit=10`;
      const itunesResponse = await fetch(itunesUrl, {
        headers: { "User-Agent": "MLCompanion/1.0" },
      });

      if (itunesResponse.ok) {
        const itunesData = await itunesResponse.json();
        for (const item of itunesData.results || []) {
          results.push({
            name: item.collectionName || item.trackName || "",
            author: item.artistName || "",
            artworkUrl: item.artworkUrl600 || item.artworkUrl100 || "",
            feedUrl: item.feedUrl || "",
            itunesId: item.collectionId || null,
            episodeCount: item.trackCount || 0,
            categories: [item.primaryGenreName].filter(Boolean),
          });
        }
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // Fallback to iTunes if Podcast Index fails
    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&media=podcast&limit=10`;
      const itunesResponse = await fetch(itunesUrl, {
        headers: { "User-Agent": "MLCompanion/1.0" },
      });

      if (itunesResponse.ok) {
        const itunesData = await itunesResponse.json();
        const results: SearchResult[] = (itunesData.results || []).map((item: any) => ({
          name: item.collectionName || item.trackName || "",
          author: item.artistName || "",
          artworkUrl: item.artworkUrl600 || item.artworkUrl100 || "",
          feedUrl: item.feedUrl || "",
          itunesId: item.collectionId || null,
          episodeCount: item.trackCount || 0,
          categories: [item.primaryGenreName].filter(Boolean),
        }));

        return new Response(JSON.stringify({ results }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch {}

    return new Response(JSON.stringify({ error: "Search failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
