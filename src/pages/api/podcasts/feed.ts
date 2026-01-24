import type { APIRoute } from "astro";
import { XMLParser } from "fast-xml-parser";
import { requireAuth } from "../../../lib/auth-utils";
import { validateFeedUrl } from "../../../lib/podcast-utils";
import {
  getPodcastByFeedUrl,
  getPodcastByItunesId,
  getEpisodes,
  formatDuration,
  isPodcastIndexConfigured,
} from "../../../lib/podcast-index";

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

  const resolveAppleFeedUrl = async (url: string): Promise<{ feedUrl: string | null; itunesId: number | null }> => {
    const idMatch = url.match(/id(\d+)/);
    if (!idMatch) return { feedUrl: null, itunesId: null };

    const itunesId = parseInt(idMatch[1]);
    const lookupUrl = `https://itunes.apple.com/lookup?id=${itunesId}`;
    const response = await fetch(lookupUrl, { headers: { "User-Agent": "MLCompanion/1.0" } });
    if (!response.ok) return { feedUrl: null, itunesId };

    const data = await response.json().catch(() => null);
    if (!data || !Array.isArray(data.results) || data.results.length === 0) return { feedUrl: null, itunesId };

    return { feedUrl: data.results[0]?.feedUrl || null, itunesId };
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
    let itunesId: number | null = null;

    if (!resolvedFeedUrl && appleUrl) {
      const result = await resolveAppleFeedUrl(appleUrl);
      resolvedFeedUrl = result.feedUrl;
      itunesId = result.itunesId;
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

    // Primary: Podcast Index API
    if (isPodcastIndexConfigured()) {
      try {
        let show = await getPodcastByFeedUrl(resolvedFeedUrl);
        if (!show && itunesId) {
          show = await getPodcastByItunesId(itunesId);
        }

        if (show) {
          const episodes = await getEpisodes(show.id, 50);

          const podcastInfo = {
            title: show.title,
            description: show.description,
            author: show.author,
            imageUrl: show.image,
            link: show.link,
            language: show.language || null,
            categories: show.categories ? Object.values(show.categories) : [],
            explicit: show.explicit || false,
            episodeCount: show.episodeCount || episodes.length,
          };

          const items = episodes.map((ep) => ({
            title: ep.title,
            description: ep.description,
            audioUrl: ep.enclosureUrl,
            duration: formatDuration(ep.duration),
            publishedAt: ep.datePublished ? new Date(ep.datePublished * 1000).toISOString() : null,
            episodeNumber: ep.episode || null,
            seasonNumber: ep.season || null,
            episodeType: ep.episodeType || "full",
            imageUrl: ep.image || null,
            explicit: ep.explicit === 1,
            link: ep.link || null,
          }));

          return new Response(JSON.stringify({ podcast: podcastInfo, episodes: items, feedUrl: resolvedFeedUrl }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch {
        // Fall through to XML parsing
      }
    }

    // Fallback: Fetch and parse RSS with fast-xml-parser
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

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      isArray: (name) => name === "item",
    });

    const parsed = parser.parse(xml);
    const channel = parsed?.rss?.channel;

    if (!channel) {
      return new Response(JSON.stringify({ error: "Invalid RSS feed format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const getText = (val: any): string => {
      if (!val) return "";
      if (typeof val === "string") return val.trim();
      if (typeof val === "object" && val["#text"]) return String(val["#text"]).trim();
      return String(val).trim();
    };

    const podcastInfo = {
      title: getText(channel.title),
      description: getText(channel.description) || getText(channel["itunes:summary"]),
      author: getText(channel["itunes:author"]) || getText(channel.managingEditor),
      imageUrl: channel["itunes:image"]?.["@_href"] || getText(channel.image?.url) || "",
      link: getText(channel.link),
      language: getText(channel.language) || null,
      categories: [] as string[],
      explicit: getText(channel["itunes:explicit"]) === "yes" || getText(channel["itunes:explicit"]) === "true",
      episodeCount: null,
    };

    // Extract categories
    const itunesCategory = channel["itunes:category"];
    if (itunesCategory) {
      const cats = Array.isArray(itunesCategory) ? itunesCategory : [itunesCategory];
      for (const cat of cats) {
        if (cat?.["@_text"]) podcastInfo.categories.push(cat["@_text"]);
      }
    }

    // Parse episodes
    const rawItems = channel.item || [];
    const items = rawItems.slice(0, 50).map((item: any) => ({
      title: getText(item.title),
      description: getText(item.description) || getText(item["itunes:summary"]),
      audioUrl: item.enclosure?.["@_url"] || "",
      duration: getText(item["itunes:duration"]),
      publishedAt: item.pubDate ? new Date(getText(item.pubDate)).toISOString() : null,
      episodeNumber: parseInt(getText(item["itunes:episode"])) || null,
      seasonNumber: parseInt(getText(item["itunes:season"])) || null,
      episodeType: getText(item["itunes:episodeType"]) || "full",
      imageUrl: item["itunes:image"]?.["@_href"] || null,
      explicit: getText(item["itunes:explicit"]) === "yes" || getText(item["itunes:explicit"]) === "true",
      link: getText(item.link) || null,
    }));

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
