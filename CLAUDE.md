# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MLCompanion is a Learning Hub for Socialism and Marxism - an educational platform with video library management, user authentication, and structured learning paths. Built with Astro (SSR), React, Prisma, and Better Auth, deployed to Vercel with a Neon PostgreSQL database.

## Development Commands

```bash
# Development
npm run dev              # Start dev server at localhost:4321
npm run build            # Build for production
npm run preview          # Preview production build

# Database
npx prisma migrate dev   # Create and apply new migration
npx prisma generate      # Regenerate Prisma Client after schema changes
npx prisma studio        # Open database GUI
npx prisma migrate status # Check migration status

# Admin utilities
npm run create-admin     # Create admin user account (see scripts/create-admin.ts)
```

## Architecture Overview

### SSR Configuration
- **Output mode**: `server` (full SSR, not static)
- **Adapter**: Vercel serverless
- **Path alias**: `@/` maps to `src/`

### Database Layer (Prisma)
- **Custom output**: Prisma Client generates to `src/generated/prisma/` (not default location)
- **Adapter pattern**: Uses `@prisma/adapter-pg` with pg Pool for connection pooling (required for serverless)
- **Configuration**: Uses `prisma.config.ts` (loads dotenv automatically)

**When working with Prisma:**
```typescript
// CORRECT: Import from custom location
import { PrismaClient } from "../src/generated/prisma/client";
import { prisma } from "@/lib/prisma"; // Already configured with adapter

// INCORRECT: Don't use default import
import { PrismaClient } from "@prisma/client"; // Will fail
```

**Always run `npx prisma generate` after schema changes** to regenerate the client in the custom location.

### Authentication Architecture (Simple Session-based)

Custom auth implementation at `src/lib/auth.ts`:
- Email/password authentication
- Session-based (tokens stored in Session table)
- Password hashing uses bcryptjs (10 salt rounds)

**API Handler:**
- Login route: `src/pages/api/auth/login.ts`
- POST endpoint that verifies credentials and sets session cookie
- Cookie: `session_token` (HttpOnly, Secure, SameSite=Lax, 7-day expiry)

**Auth utilities** (`src/lib/auth-utils.ts`):
- `getSession(request)`: Fetch current session
- `requireAuth(context)`: Middleware-style auth check, returns Response on failure or { session, user } on success

**Auth functions** (`src/lib/auth.ts`):
- `verifyCredentials(email, password)`: Check credentials against database
- `createSession(userId)`: Create new session token
- `getSessionFromRequest(request)`: Extract and validate session from cookie
- `deleteSession(token)`: Remove session

**Database schema:**
- User → Account (1:many) for credential storage
- User → Session (1:many) for session management
- Account.providerId = "credential" for email/password auth
- Account.password stores bcrypt hash

### Video Management

**Authorization model:**
- Videos have `createdBy` foreign key to User
- Users can only edit/delete their own videos
- `isPublished` boolean controls visibility (soft delete pattern)
- GET endpoints filter by `isPublished: true`
- DELETE sets `isPublished: false` (doesn't actually delete)

**Video utilities** (`src/lib/video-utils.ts`):
- `parseYouTubeUrl()`: Extract video ID from YouTube URLs
- `getYouTubeThumbnail()`: Generate thumbnail URL from video ID
- `validateVideoUrl()`: Validate YouTube/Vimeo URLs

**API Routes:**
- `GET /api/videos` - List published videos
- `POST /api/videos` - Create video (requires auth)
- `GET /api/videos/:id` - Get single video
- `PUT /api/videos/:id` - Update video (requires ownership)
- `DELETE /api/videos/:id` - Soft delete video (requires ownership)
- `POST /api/videos/metadata` - Fetch YouTube video metadata (requires auth)

### YouTube Metadata Integration

**Endpoint:** `POST /api/videos/metadata`

Fetches video metadata from YouTube Data API v3:
- Extracts video ID from various YouTube URL formats (youtu.be, youtube.com/watch, /shorts/, /embed/)
- Calls YouTube API with `part=snippet,contentDetails`
- Returns: title, description, thumbnailUrl, duration, channelName, publishedAt, tags, category
- Duration is parsed from ISO 8601 format to human-readable (e.g., "12:34")
- Automatically selects highest quality thumbnail available (maxresdefault → standard → high → medium)
- PublishedAt is returned in ISO 8601 format

**Database fields:**
- `thumbnailUrl`: High-quality YouTube thumbnail URL
- `channelName`: YouTube channel name
- `publishedAt`: Video publish date (DateTime)
- `duration`: Human-readable duration string
- `tags`: String array of video tags

**Usage in UI:**
- VideoForm has "Fetch" button next to URL field
- Auto-fills title, description, thumbnailUrl, duration, channelName, publishedAt, and tags
- Requires `YOUTUBE_API_KEY` environment variable

### React Integration

**Client directives:**
- Use `client:load` for forms and interactive components
- React components are in `src/components/*.tsx`
- Components use Radix UI primitives wrapped with Tailwind

**Pattern for React in Astro:**
```astro
---
import { LoginForm } from "@/components/LoginForm";
---
<LoginForm client:load />
```

**Dynamic React mounting** (see `src/pages/videos/manage.astro`):
- Uses `createRoot()` from `react-dom/client` in `<script>` tags
- Mount React components dynamically in response to user actions
- Useful for modals and conditional UI

## Database Schema Notes

### Key Models
- **User**: Core auth entity with email, name, emailVerified flag
- **Account**: Provider credentials (providerId, password hash, tokens)
- **Session**: Active sessions with expiration, IP, user agent
- **Video**: Content with tags (String[]), category, order, isPublished
- **Book**: Content with ISBN, authors (String[]), publisher, categories (String[]), tags (String[]), order, isPublished
- **Verification**: Email verification tokens

### Important Indexes
- Account: `@@unique([providerId, accountId])`, `@@index([userId])`
- Session: `@@index([userId])`
- Video: `@@index([createdBy])`, `@@index([isPublished])`
- Book: `@@index([createdBy])`, `@@index([isPublished])`, `@@index([isbn])`, `@@index([isbn13])`

### Book Management

**Authorization model:**
- Books have `createdBy` foreign key to User
- Users can only edit/delete their own books
- `isPublished` boolean controls visibility (soft delete pattern)
- GET endpoints filter by `isPublished: true`
- DELETE sets `isPublished: false` (doesn't actually delete)

**Book utilities** (`src/lib/book-utils.ts`):
- `parseISBN()`: Extract ISBN-10/ISBN-13 from various formats
- `validateISBN()`: Validate ISBN checksums
- `getGoogleBooksCover()`: Generate Google Books cover URLs
- `getOpenLibraryCover()`: Generate Open Library cover URLs
- `formatAuthors()`: Format author arrays for display

**API Routes:**
- `GET /api/books` - List published books
- `POST /api/books` - Create book (requires auth)
- `GET /api/books/:id` - Get single book
- `PUT /api/books/:id` - Update book (requires ownership)
- `DELETE /api/books/:id` - Soft delete book (requires ownership)
- `POST /api/books/metadata` - Fetch book metadata from Google Books and Open Library

### Book Metadata Integration

**Endpoint:** `POST /api/books/metadata`

Fetches book metadata from **Google Books API** and **Open Library API**:
- Accepts ISBN-10, ISBN-13, or book title as search query
- Calls both Google Books API (primary) and Open Library API (fallback)
- Returns: title, description, ISBN-10, ISBN-13, authors, publisher, publishedDate, thumbnailUrl, pageCount, categories, language, preview/info links
- Automatically selects highest quality cover image (Google Books → Open Library → generated)
- Works with or without `GOOGLE_BOOKS_API_KEY` (limited quota without key)

**Database fields:**
- `isbn`, `isbn13`: ISBN identifiers
- `authors`: String array of author names
- `publisher`, `publishedDate`: Publication info
- `thumbnailUrl`: Book cover image URL
- `pageCount`: Number of pages
- `categories`: String array of book categories
- `language`: ISO language code
- `previewLink`, `infoLink`: External book links
- `tags`: String array of user-defined tags

**Usage in UI:**
- BookForm has search field for ISBN or title
- "Fetch" button auto-fills all metadata fields
- Optional `GOOGLE_BOOKS_API_KEY` environment variable increases rate limits

## Environment Variables Required

```env
DATABASE_URL=postgresql://...           # Neon PostgreSQL connection string
YOUTUBE_API_KEY=...                     # YouTube Data API v3 key (for video metadata)
GOOGLE_BOOKS_API_KEY=...                # Google Books API key (optional, for book metadata)
```

**Optional (for development):**
- Auth is cookie-based and doesn't require environment configuration
- Admin user must be created via `npm run create-admin` script

## Common Patterns

### API Route Structure
```typescript
import type { APIRoute } from "astro";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const POST: APIRoute = async (context) => {
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  // authResult.user and authResult.session are available
  const body = await context.request.json();

  // ... business logic

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
```

### Protected Astro Pages
```astro
---
import { getSessionFromRequest } from "@/lib/auth";

const result = await getSessionFromRequest(Astro.request);
if (!result?.user) {
  return Astro.redirect("/login");
}
// result.user and result.session are available
---
```

## Project-Specific Considerations

- **No admin panel yet**: `/videos/manage` and `/books/manage` only show user's own content, not all content
- **Soft deletes**: Videos and books are never hard-deleted, only unpublished (isPublished: false)
- **YouTube-centric**: Video utilities assume YouTube/Vimeo, extend for other platforms
- **No tests**: Test infrastructure not yet set up
- **No migration rollback**: Use `npx prisma migrate reset` to reset database (destructive)
- **Homepage**: Shows 5 most recently added videos in Video Library section (ordered by createdAt desc)

## Deployment Notes

### Deployment Workflow
- Git repository hosted on GitHub
- Commit changes: `git add . && git commit -m "message"`
- Push to GitHub: `git push origin main`
- Deploy to Vercel: `vercel --prod` (deploys directly via Vercel CLI, not automatic from git push)

### Environment Variables
- Set via Vercel CLI: `echo "value" | vercel env add VAR_NAME production`
- Or via Vercel dashboard: project settings → Environment Variables
- Must be set for all environments: production, preview, development

### Deployment Checklist
1. Run `npx prisma generate` locally after schema changes (if applicable)
2. Run `npx prisma migrate dev` to create migration locally (if schema changed)
3. Commit: `git add . && git commit -m "message"`
4. Push: `git push origin main`
5. Deploy: `vercel --prod`
6. Vercel automatically runs build (`npm run build`) and includes migrations

### Architecture
- Deployed on Vercel with serverless functions
- Database hosted on Neon (PostgreSQL)
- Connection pooling via `@prisma/adapter-pg` required for serverless
- Each API route becomes a separate serverless function
