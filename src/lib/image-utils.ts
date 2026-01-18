type ImageProxyOptions = {
  width?: number;
  quality?: number;
};

export function getProxiedImageUrl(
  url: string | null | undefined,
  options?: ImageProxyOptions
): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/_vercel/image")) {
    return trimmed;
  }
  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("file:")
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) {
      return trimmed;
    }

    const params = new URLSearchParams();
    params.set("url", trimmed);
    if (options?.width) params.set("w", String(options.width));
    if (options?.quality) params.set("q", String(options.quality));

    return `/_vercel/image?${params.toString()}`;
  } catch {
    return trimmed;
  }
}
