/**
 * Utility functions for parsing and embedding Apple Music and Spotify URLs
 */

export type MediaType = 'apple-music' | 'spotify' | 'unknown';

export interface ParsedMediaUrl {
  originalUrl: string;
  embedUrl: string;
  type: MediaType;
  title?: string;
}

/**
 * Detect media type from URL
 */
export function detectMediaType(url: string): MediaType {
  if (url.includes('music.apple.com')) return 'apple-music';
  if (url.includes('spotify.com') || url.includes('open.spotify.com')) return 'spotify';
  return 'unknown';
}

/**
 * Parse Apple Music URL and generate embed URL
 * 
 * Supported formats:
 * - https://music.apple.com/us/album/...
 * - https://music.apple.com/us/playlist/...
 * - https://embed.music.apple.com/...
 */
export function parseAppleMusicUrl(url: string): ParsedMediaUrl | null {
  try {
    // Already an embed URL
    if (url.includes('embed.music.apple.com')) {
      return {
        originalUrl: url,
        embedUrl: url,
        type: 'apple-music',
      };
    }

    // Convert regular Apple Music URL to embed URL
    // https://music.apple.com/us/album/... -> https://embed.music.apple.com/us/album/...
    const embedUrl = url.replace('music.apple.com', 'embed.music.apple.com');

    return {
      originalUrl: url,
      embedUrl,
      type: 'apple-music',
    };
  } catch (error) {
    console.error('Error parsing Apple Music URL:', error);
    return null;
  }
}

/**
 * Parse Spotify URL and generate embed URL
 * 
 * Supported formats:
 * - https://open.spotify.com/album/...
 * - https://open.spotify.com/playlist/...
 * - https://open.spotify.com/track/...
 * - https://open.spotify.com/show/... (podcast)
 * - https://open.spotify.com/episode/...
 */
export function parseSpotifyUrl(url: string): ParsedMediaUrl | null {
  try {
    // Extract the ID and type from Spotify URL
    // https://open.spotify.com/album/3IBcauSj5M2A6lTeffJzdv
    // https://open.spotify.com/track/3IBcauSj5M2A6lTeffJzdv?si=...
    
    const spotifyRegex = /spotify\.com\/(album|playlist|track|show|episode)\/([a-zA-Z0-9]+)/;
    const match = url.match(spotifyRegex);

    if (!match) {
      return null;
    }

    const [, type, id] = match;

    // Generate embed URL
    // https://open.spotify.com/embed/album/3IBcauSj5M2A6lTeffJzdv
    const embedUrl = `https://open.spotify.com/embed/${type}/${id}`;

    return {
      originalUrl: url,
      embedUrl,
      type: 'spotify',
    };
  } catch (error) {
    console.error('Error parsing Spotify URL:', error);
    return null;
  }
}

/**
 * Parse any supported media URL and generate embed URL
 */
export function parseMediaUrl(url: string): ParsedMediaUrl | null {
  const type = detectMediaType(url);

  switch (type) {
    case 'apple-music':
      return parseAppleMusicUrl(url);
    case 'spotify':
      return parseSpotifyUrl(url);
    default:
      return null;
  }
}

/**
 * Validate if URL is a supported media platform
 */
export function isValidMediaUrl(url: string): boolean {
  const type = detectMediaType(url);
  return type !== 'unknown';
}

/**
 * Get default iframe height for media type
 */
export function getMediaEmbedHeight(type: MediaType): number {
  switch (type) {
    case 'apple-music':
      return 450; // Apple Music player default height
    case 'spotify':
      return 352; // Spotify player default height
    default:
      return 400;
  }
}
