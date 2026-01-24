import type { APIRoute } from "astro";
import { requireAuth } from "../../../lib/auth-utils";
import { validateFeedUrl } from "../../../lib/podcast-utils";

export const POST: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const body = await context.request.json();
  const { feedUrl, appleUrl, soundcloudUrl } = body;

  if (!feedUrl && !appleUrl && !soundcloudUrl) {
    return new Response(JSON.stringify({ error: "A feed, Apple Podcasts, or SoundCloud URL is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const resolveAppleFeedUrl = async (url: string): Promise<string | null> => {
    const idMatch = url.match(/id(\d+)/);
    if (!idMatch) return null;

    const lookupUrl = `https://itunes.apple.com/lookup?id=${idMatch[1]}`;
    const response = await fetch(lookupUrl, { headers: { "User-Agent": "MLCompanion/1.0" } });
    if (!response.ok) return null;

    const data = await response.json().catch(() => null);
    if (!data || !Array.isArray(data.results) || data.results.length === 0) return null;

    return data.results[0]?.feedUrl || null;
  };

  const resolveSoundcloudFeedUrl = async (url: string): Promise<string | null> => {
    const oembedUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`;
    const response = await fetch(oembedUrl, { headers: { "User-Agent": "MLCompanion/1.0" } });
    if (!response.ok) return null;

    const data = await response.json().catch(() => null);
    const html = typeof data?.html === "string" ? data.html : "";
    const match = html.match(/api\.soundcloud\.com\/(users|playlists)\/(\d+)/);
    if (!match) return null;

    if (match[1] === "users") {
      return `https://feeds.soundcloud.com/users/soundcloud:users:${match[2]}/sounds.rss`;
    }

    if (match[1] === "playlists") {
      return `https://feeds.soundcloud.com/playlists/soundcloud:playlists:${match[2]}/sounds.rss`;
    }

    return null;
  };

  try {
    let resolvedFeedUrl = feedUrl;

    if (!resolvedFeedUrl && appleUrl) {
      resolvedFeedUrl = await resolveAppleFeedUrl(appleUrl);
    }

    if (!resolvedFeedUrl && soundcloudUrl) {
      resolvedFeedUrl = await resolveSoundcloudFeedUrl(soundcloudUrl);
    }

    if (!resolvedFeedUrl || !validateFeedUrl(resolvedFeedUrl)) {
      return new Response(JSON.stringify({ error: "Could not resolve a valid RSS feed URL" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch(resolvedFeedUrl, {
      headers: { "User-Agent": "MLCompanion/1.0" },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch feed" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const xml = await response.text();

    // Basic XML parsing for RSS feed
    const getTag = (src: string, tag: string): string => {
      const match = src.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`));
      return (match?.[1] || match?.[2] || "").trim();
    };

    const getAttr = (src: string, tag: string, attr: string): string => {
      const match = src.match(new RegExp(`<${tag}[^>]*${attr}=["']([^"']*)["']`));
      return match?.[1] || "";
    };

    // Parse channel info
    const channelMatch = xml.match(/<channel>([\s\S]*?)<item/);
    const channelXml = channelMatch?.[1] || xml;

    const podcastInfo = {
      title: getTag(channelXml, "title"),
      description: getTag(channelXml, "description") || getTag(channelXml, "itunes:summary"),
      author: getTag(channelXml, "itunes:author") || getTag(channelXml, "managingEditor"),
      imageUrl: getAttr(channelXml, "itunes:image", "href") || getTag(channelXml, "url"),
      link: getTag(channelXml, "link"),
    };

    // Parse episodes (items)
    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let count = 0;

    while ((match = itemRegex.exec(xml)) !== null && count < 50) {
      const itemXml = match[1];
      const durationRaw = getTag(itemXml, "itunes:duration");

      items.push({
        title: getTag(itemXml, "title"),
        description: getTag(itemXml, "description") || getTag(itemXml, "itunes:summary"),
        audioUrl: getAttr(itemXml, "enclosure", "url"),
        duration: durationRaw,
        publishedAt: getTag(itemXml, "pubDate") || null,
        episodeNumber: parseInt(getTag(itemXml, "itunes:episode")) || null,
        seasonNumber: parseInt(getTag(itemXml, "itunes:season")) || null,
      });
      count++;
    }

    return new Response(JSON.stringify({ podcast: podcastInfo, episodes: items, feedUrl: resolvedFeedUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to parse feed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
