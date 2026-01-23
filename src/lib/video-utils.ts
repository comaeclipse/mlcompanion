export function parseYouTubeUrl(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname.toLowerCase();

    if (host === "youtu.be") {
      return urlObj.pathname.slice(1).split("/")[0] || null;
    }

    if (host.indexOf("youtube.com") !== -1) {
      const searchId = urlObj.searchParams.get("v");
      if (searchId) return searchId;

      const parts = urlObj.pathname.split("/").filter(Boolean);
      if (
        parts.length >= 2 &&
        (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "v")
      ) {
        return parts[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function validateVideoUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/.test(url);
}
