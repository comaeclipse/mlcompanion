import { createHash } from "node:crypto";

const API_BASE = "https://api.podcastindex.org/api/1.0";

function getAuthHeaders(): Record<string, string> {
  const key = process.env.PODCAST_INDEX_KEY;
  const secret = process.env.PODCAST_INDEX_SECRET;
  if (!key || !secret) {
    throw new Error("PODCAST_INDEX_KEY and PODCAST_INDEX_SECRET are required");
  }

  const epoch = Math.floor(Date.now() / 1000);
  const authHash = createHash("sha1")
    .update(key + secret + epoch)
    .digest("hex");

  return {
    "X-Auth-Key": key,
    "X-Auth-Date": String(epoch),
    Authorization: authHash,
    "User-Agent": "MLCompanion/1.0",
  };
}

async function apiRequest(path: string): Promise<any> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Podcast Index API error: ${response.status}`);
  }

  return response.json();
}

export interface PodcastIndexShow {
  id: number;
  title: string;
  description: string;
  author: string;
  image: string;
  url: string; // feed URL
  link: string; // website
  language: string;
  categories: Record<string, string>;
  episodeCount: number;
  explicit: boolean;
  itunesId: number | null;
}

export interface PodcastIndexEpisode {
  id: number;
  title: string;
  description: string;
  enclosureUrl: string;
  duration: number; // seconds
  datePublished: number; // epoch
  image: string;
  episode: number | null;
  season: number | null;
  episodeType: string;
  explicit: number;
  link: string;
}

export async function searchPodcasts(query: string): Promise<PodcastIndexShow[]> {
  const data = await apiRequest(`/search/byterm?q=${encodeURIComponent(query)}&max=10`);
  return data.feeds || [];
}

export async function getPodcastByFeedUrl(feedUrl: string): Promise<PodcastIndexShow | null> {
  const data = await apiRequest(`/podcasts/byfeedurl?url=${encodeURIComponent(feedUrl)}`);
  return data.feed?.id ? data.feed : null;
}

export async function getPodcastByItunesId(itunesId: number): Promise<PodcastIndexShow | null> {
  const data = await apiRequest(`/podcasts/byitunesid?id=${itunesId}`);
  return data.feed?.id ? data.feed : null;
}

export async function getEpisodes(feedId: number, max: number = 50): Promise<PodcastIndexEpisode[]> {
  const data = await apiRequest(`/episodes/byfeedid?id=${feedId}&max=${max}`);
  return data.items || [];
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function isPodcastIndexConfigured(): boolean {
  return !!(process.env.PODCAST_INDEX_KEY && process.env.PODCAST_INDEX_SECRET);
}
