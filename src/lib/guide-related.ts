import { prisma } from "./prisma";
import type { GuideRelatedConfig } from "./guide-content";

export interface GuideRelatedResources {
  videos: Array<{
    id: string;
    title: string;
    description: string;
    url: string;
    thumbnailUrl: string | null;
    duration: string | null;
    channelName: string | null;
    tags: string[];
  }>;
  books: Array<{
    id: string;
    title: string;
    description: string;
    isbn: string | null;
    isbn13: string | null;
    authors: string[];
    publisher: string | null;
    publishedDate: string | null;
    thumbnailUrl: string | null;
    pageCount: number | null;
    categories: string[];
    tags: string[];
    previewLink: string | null;
    infoLink: string | null;
    readFreeLinks: string[];
    purchaseLinks: {
      amazon?: string;
      custom?: Array<{ label: string; url: string }>;
    } | null;
  }>;
}

const VIDEO_SELECT = {
  id: true,
  title: true,
  description: true,
  url: true,
  thumbnailUrl: true,
  duration: true,
  channelName: true,
  tags: true,
};

const BOOK_SELECT = {
  id: true,
  title: true,
  description: true,
  isbn: true,
  isbn13: true,
  authors: true,
  publisher: true,
  publishedDate: true,
  thumbnailUrl: true,
  pageCount: true,
  categories: true,
  tags: true,
  previewLink: true,
  infoLink: true,
  readFreeLinks: true,
  purchaseLinks: true,
};

export async function getGuideRelatedResources(
  related: GuideRelatedConfig,
  { videoLimit = 3, bookLimit = 3 } = {}
): Promise<GuideRelatedResources> {
  const videoOr: Array<Record<string, unknown>> = [];
  if (related.videoTags.length) {
    videoOr.push({ tags: { hasSome: related.videoTags } });
  }
  if (related.videoCategories?.length) {
    videoOr.push({ category: { in: related.videoCategories } });
  }

  const bookOr: Array<Record<string, unknown>> = [];
  if (related.bookAuthors.length) {
    bookOr.push({ authors: { hasSome: related.bookAuthors } });
  }
  if (related.bookTags.length) {
    bookOr.push({ tags: { hasSome: related.bookTags } });
  }

  const [videos, books] = await Promise.all([
    prisma.video.findMany({
      where: {
        isPublished: true,
        ...(videoOr.length ? { OR: videoOr } : {}),
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: videoLimit,
      select: VIDEO_SELECT,
    }),
    prisma.book.findMany({
      where: {
        isPublished: true,
        ...(bookOr.length ? { OR: bookOr } : {}),
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: bookLimit,
      select: BOOK_SELECT,
    }),
  ]);

  return { videos, books };
}
