/**
 * Episode utilities for parsing and handling podcast episode URLs
 */

export interface EpisodeEmbedInfo {
  type: "spotify" | "apple";
  embedUrl: string;
  originalUrl: string;
}

/**
 * Parse a Spotify episode URL and return embed information
 * Supports formats:
 * - https://open.spotify.com/episode/EPISODE_ID
 * - https://open.spotify.com/episode/EPISODE_ID?si=...
 */
export function parseSpotifyUrl(url: string): EpisodeEmbedInfo | null {
  try {
    const urlObj = new URL(url);
    
    if (!urlObj.hostname.includes("spotify.com")) {
      return null;
    }

    const episodeMatch = urlObj.pathname.match(/\/episode\/([a-zA-Z0-9]+)/);
    if (!episodeMatch) {
      return null;
    }

    const episodeId = episodeMatch[1];
    return {
      type: "spotify",
      embedUrl: `https://open.spotify.com/embed/episode/${episodeId}`,
      originalUrl: url,
    };
  } catch {
    return null;
  }
}

/**
 * Parse an Apple Podcasts episode URL and return embed information
 * Supports formats:
 * - https://podcasts.apple.com/us/podcast/PODCAST_NAME/idPODCAST_ID?i=EPISODE_ID
 */
export function parseAppleUrl(url: string): EpisodeEmbedInfo | null {
  try {
    const urlObj = new URL(url);
    
    if (!urlObj.hostname.includes("apple.com")) {
      return null;
    }

    const episodeParam = urlObj.searchParams.get("i");
    if (!episodeParam) {
      return null;
    }

    return {
      type: "apple",
      embedUrl: `https://embed.podcasts.apple.com/us/podcast/${episodeParam}`,
      originalUrl: url,
    };
  } catch {
    return null;
  }
}

/**
 * Parse a podcast episode URL and return embed information
 * Automatically detects Spotify or Apple Podcasts
 */
export function parseEpisodeUrl(url: string): EpisodeEmbedInfo | null {
  if (!url) return null;
  
  const spotify = parseSpotifyUrl(url);
  if (spotify) return spotify;
  
  const apple = parseAppleUrl(url);
  if (apple) return apple;
  
  return null;
}

/**
 * Validate if a URL is a supported podcast episode URL
 */
export function isValidEpisodeUrl(url: string): boolean {
  return parseEpisodeUrl(url) !== null;
}
