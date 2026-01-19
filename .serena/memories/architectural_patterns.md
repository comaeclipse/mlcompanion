# Architectural Patterns and Best Practices

## Database Architecture

### Prisma Custom Output Location
**Critical**: Prisma client generates to `src/generated/prisma/` instead of default `node_modules/.prisma/client`.

```typescript
// ✅ CORRECT - Custom location
import { PrismaClient } from "../src/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// ❌ WRONG - Default location (will fail)
import { PrismaClient } from "@prisma/client";
```

### Connection Pooling for Serverless
Uses `@prisma/adapter-pg` with pg Pool for serverless compatibility (Vercel).

```typescript
// src/lib/prisma.ts pattern
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
```

Always use the exported `prisma` instance from `@/lib/prisma`.

### Soft Delete Pattern
Videos are **never hard-deleted**. Use `isPublished` boolean for soft deletes.

```typescript
// ✅ Soft delete (correct)
await prisma.video.update({
  where: { id },
  data: { isPublished: false }
});

// ❌ Hard delete (incorrect)
await prisma.video.delete({ where: { id } });
```

Public endpoints filter by `isPublished: true`:
```typescript
const videos = await prisma.video.findMany({
  where: { isPublished: true }
});
```

## Authentication Architecture

### Session-Based Authentication
Custom implementation (not Better Auth, despite dependency):
- Email/password with bcryptjs (10 salt rounds)
- Session tokens stored in database (Session table)
- HttpOnly, Secure cookies (SameSite=Lax, 7-day expiry)

### Auth Flow
1. User submits email/password to `/api/auth/login`
2. `verifyCredentials()` checks Account table for matching hash
3. `createSession()` creates random token and Session record
4. Cookie `session_token` is set
5. Subsequent requests validated via `getSessionFromRequest()`

### Protected API Routes
```typescript
import type { APIRoute } from "astro";
import { requireAuth } from "@/lib/auth-utils";

export const POST: APIRoute = async (context) => {
  // Returns Response on auth failure, or { session, user } on success
  const authResult = await requireAuth(context);
  if (authResult instanceof Response) return authResult;

  const { user, session } = authResult;
  // ... authenticated logic
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

const { user, session } = result;
---
```

## Authorization Pattern

### User Ownership
Users can only edit/delete their own videos. Check `createdBy` field:

```typescript
const video = await prisma.video.findUnique({ where: { id } });

if (!video || video.createdBy !== user.id) {
  return new Response(JSON.stringify({ error: "Not authorized" }), {
    status: 403
  });
}
```

## React in Astro Pattern

### Client Directives
Use `client:load` for interactive components:

```astro
---
import { LoginForm } from "@/components/LoginForm";
---
<LoginForm client:load />
```

### Dynamic React Mounting
For conditional UI (modals, dropdowns), mount React dynamically:

```astro
<script>
  import { createRoot } from "react-dom/client";
  import { VideoPlayerModal } from "@/components/VideoPlayerModal";
  
  const container = document.getElementById("modal-root");
  const root = createRoot(container);
  
  root.render(<VideoPlayerModal video={videoData} />);
</script>
```

## API Route Patterns

### Response Structure
Consistent JSON responses:

```typescript
// Success
return new Response(JSON.stringify({ data }), {
  status: 200,
  headers: { "Content-Type": "application/json" }
});

// Error
return new Response(JSON.stringify({ error: "Message" }), {
  status: 400,
  headers: { "Content-Type": "application/json" }
});
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad request (validation error)
- **401**: Unauthorized (not logged in)
- **403**: Forbidden (logged in, but insufficient permissions)
- **404**: Not found
- **500**: Server error

## YouTube Integration

### URL Parsing
Use `parseYouTubeUrl()` from `@/lib/video-utils` to extract video IDs:
- Handles: youtu.be, youtube.com/watch, /shorts/, /embed/

### Metadata Fetching
`POST /api/videos/metadata` endpoint:
- Extracts video ID from URL
- Calls YouTube Data API v3
- Returns: title, description, thumbnailUrl, duration, channelName, publishedAt, tags
- Requires `YOUTUBE_API_KEY` environment variable
- Auto-selects highest quality thumbnail

### Thumbnail Selection Priority
1. maxresdefault (1280x720)
2. standard (640x480)
3. high (480x360)
4. medium (320x180)

## Styling Patterns

### Mixed Styling Approach
Combines inline styles, Tailwind classes, and CSS variables:

```tsx
<div
  style={{ color: "var(--muted-color)" }}
  className="flex gap-4"
>
  {/* ... */}
</div>
```

### CSS Variables
Defined in `src/styles/global.css`:
- `--accent-color`
- `--muted-color`
- `--border-color`
- `--paper-color`

## Error Handling

### API Routes
Catch errors and return 500 with error message:

```typescript
try {
  // ... logic
} catch (error) {
  console.error(error);
  return new Response(JSON.stringify({ 
    error: "Internal server error" 
  }), { status: 500 });
}
```

### Database Errors
Prisma throws specific errors:
- `PrismaClientKnownRequestError`: Known errors (unique constraint, etc.)
- `PrismaClientUnknownRequestError`: Unknown database errors
- `PrismaClientValidationError`: Invalid query parameters

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `YOUTUBE_API_KEY`: YouTube Data API v3 key

### Optional
- None currently (auth is cookie-based, no secret required)

### Access Pattern
```typescript
const apiKey = process.env.YOUTUBE_API_KEY;
if (!apiKey) {
  throw new Error("YOUTUBE_API_KEY not configured");
}
```

## Deployment Architecture

### Vercel Serverless
- API routes become serverless functions
- Connection pooling required (uses pg Pool)
- Migrations must be applied before deployment
- Environment variables set in Vercel dashboard

### Build Process
1. `npm install` - Install dependencies
2. `npx prisma generate` - Generate Prisma client (postinstall hook)
3. `astro build` - Build SSR application
4. Deploy to Vercel

### Limitations
- No admin panel (users only see their own videos)
- No test infrastructure
- No migration rollback (use `npx prisma migrate reset` to reset database)