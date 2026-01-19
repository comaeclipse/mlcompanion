# MLCompanion Codebase Analysis

**Date**: 2026-01-16
**Analysis Tool**: Context7 MCP Plugin + Manual Code Review

---

## Project Overview

**MLCompanion** is a Learning Hub for Socialism and Marxism - a curated educational platform featuring:
- Video library management with tagging and categorization
- User authentication and session management
- Learning paths for structured education
- Study guides and glossary system

---

## Tech Stack

### Core Framework
- **Astro 5.16.10** - Static site generator with SSR capability
- **React 19.2.3** - Interactive UI components
- **TypeScript** - Type-safe development

### Database & ORM
- **PostgreSQL** - Primary database (hosted on Neon)
- **Prisma 7.2.0** - Type-safe ORM
- **@prisma/adapter-pg** - PostgreSQL connection pooling adapter

### Authentication
- **Better Auth 1.4.13** - Framework-agnostic authentication library
- Session-based authentication
- Multi-provider support (OAuth ready)

### UI & Styling
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
  - @radix-ui/react-dialog
  - @radix-ui/react-select
  - @radix-ui/react-slot
- **Lucide React 0.562.0** - Icon library
- **class-variance-authority** - Component variant management
- **tailwind-merge** - Utility class merging

### Deployment
- **Vercel** - Hosting platform
- **@astrojs/vercel 9.0.4** - Vercel adapter for SSR

---

## Database Schema

### User Model
```prisma
model User {
  id            String    @id @default(uuid())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String
  image         String?
  accounts      Account[]
  sessions      Session[]
  videos        Video[]
}
```

**Purpose**: Core user entity with authentication metadata

### Account Model
```prisma
model Account {
  id                     String    @id @default(uuid())
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
  providerId             String
  accountId              String
  userId                 String
  accessToken            String?
  refreshToken           String?
  idToken                String?
  accessTokenExpiresAt   DateTime?
  refreshTokenExpiresAt  DateTime?
  scope                  String?
  password               String?
  user                   User      @relation(...)

  @@unique([providerId, accountId])
  @@index([userId])
}
```

**Purpose**: OAuth provider accounts and credential storage

### Session Model
```prisma
model Session {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?
  user      User     @relation(...)

  @@index([userId])
}
```

**Purpose**: User session management with metadata tracking

### Video Model
```prisma
model Video {
  id           String   @id @default(uuid())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  title        String
  description  String   @db.Text
  url          String
  thumbnailUrl String?
  duration     String?
  tags         String[]
  category     String?
  order        Int      @default(0)
  isPublished  Boolean  @default(true)
  createdBy    String
  creator      User     @relation(...)

  @@index([createdBy])
  @@index([isPublished])
}
```

**Purpose**: Video content management with rich metadata

### Verification Model
```prisma
model Verification {
  id         String   @id @default(uuid())
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  value      String
  expiresAt  DateTime
  identifier String

  @@index([identifier])
}
```

**Purpose**: Email verification and token management

---

## Project Structure

### Key Configuration Files
- **prisma/schema.prisma** - Database schema with custom output path
- **package.json** - Dependencies and scripts
- **astro.config.mjs** - Astro configuration with Vercel adapter

### Pages Structure
```
src/pages/
├── index.astro              # Landing page with learning paths
├── login.astro              # Authentication page
├── videos/                  # Video library pages
└── api/
    ├── auth/[...all].ts     # Better Auth catch-all handler
    └── videos/              # Video management API endpoints
```

### Components
```
src/components/
├── LoginForm.tsx            # Authentication form
├── VideoCard.tsx            # Video display component
├── VideoForm.tsx            # Video creation/editing form
└── ui/                      # Radix UI wrapper components
```

### Utilities
```
src/lib/
├── prisma.ts                # Prisma client initialization
├── auth-utils.ts            # Authentication helper functions
└── video-utils.ts           # Video management utilities
```

### Generated Files
```
src/generated/prisma/        # Prisma Client output directory
```

---

## Authentication Architecture

### Better Auth Integration

**Configuration Location**: `src/lib/prisma.ts` or dedicated auth file

**Recommended Setup**:
```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  })
});
```

### API Route Handler

**File**: `src/pages/api/auth/[...all].ts`

**Pattern**:
```typescript
import { auth } from "~/lib/auth";
import type { APIRoute } from "astro";

export const ALL: APIRoute = async (ctx) => {
  // Optional: Set forwarded headers for rate limiting
  // ctx.request.headers.set("x-forwarded-for", ctx.clientAddress);
  return auth.handler(ctx.request);
};
```

### Middleware Pattern (Optional)

**File**: `src/middleware.ts`

**Purpose**: Global authentication state
```typescript
import { auth } from "@/lib/auth";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (session) {
    context.locals.user = session.user;
    context.locals.session = session.session;
  }

  return next();
});
```

---

## Prisma Configuration

### Custom Output Directory
```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

**Rationale**: Keeps generated code within src for better IDE integration

### PostgreSQL Adapter Setup
```typescript
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
```

**Benefits**: Connection pooling for serverless environments (Vercel)

---

## Astro + React Integration

### React Components in Astro

**Client Directives**:
- `client:load` - Hydrate on page load
- `client:idle` - Hydrate when browser is idle
- `client:visible` - Hydrate when component is visible
- `client:only` - Only render on client (no SSR)

**Example Usage**:
```astro
---
import { LoginForm } from "@/components/LoginForm";
---

<LoginForm client:load />
```

### API Routes in Astro

**Pattern**: Export HTTP method handlers
```typescript
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  // Handle GET request
  return new Response(JSON.stringify(data));
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  // Handle POST request
  return new Response(JSON.stringify(result));
};
```

---

## Video Management Features

### Data Model Capabilities
- **Tagging System**: `String[]` for flexible categorization
- **Ordering**: Manual sort order via `order` field
- **Publishing**: Draft/published workflow with `isPublished`
- **Rich Metadata**: Title, description, thumbnail, duration
- **Creator Tracking**: Foreign key to User model

### Suggested API Endpoints

```
GET    /api/videos          # List all videos (with filters)
GET    /api/videos/:id      # Get single video
POST   /api/videos          # Create new video
PUT    /api/videos/:id      # Update video
DELETE /api/videos/:id      # Delete video
PATCH  /api/videos/:id/publish  # Toggle publish status
```

---

## Deployment Configuration

### Vercel Setup

**Adapter**: `@astrojs/vercel`

**astro.config.mjs**:
```javascript
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import react from '@astrojs/react';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [react()]
});
```

### Environment Variables (Required)

```env
DATABASE_URL=postgresql://...         # Neon PostgreSQL connection
BETTER_AUTH_SECRET=...                # Auth secret key
BETTER_AUTH_URL=https://your-app.vercel.app
```

---

## Git Status Analysis

### Modified Files
- `package.json`, `package-lock.json` - Dependency updates
- `prisma/schema.prisma` - Schema modifications
- `src/lib/prisma.ts` - Client configuration
- `src/pages/api/auth/[...all].ts` - Auth handler
- `src/pages/index.astro` - Landing page
- `src/styles/global.css` - Styling updates

### New (Untracked) Files
- `.claude/` - Claude Code configuration
- `prisma/migrations/` - **IMPORTANT**: Should be committed
- `src/components/LoginForm.tsx`
- `src/components/VideoCard.tsx`
- `src/components/VideoForm.tsx`
- `src/components/ui/` - UI component library
- `src/lib/auth-utils.ts`
- `src/lib/video-utils.ts`
- `src/pages/api/videos/` - Video API routes
- `src/pages/login.astro`
- `src/pages/videos/` - Video pages
- Multiple `tmpclaude-*-cwd` temp files - **Should be cleaned up**

---

## Recommendations

### Immediate Actions

1. **Commit Prisma Migrations**
   ```bash
   git add prisma/migrations/
   git commit -m "Add database migrations"
   ```

2. **Clean Up Temp Files**
   ```bash
   # Add to .gitignore
   echo "tmpclaude-*-cwd" >> .gitignore
   # Remove existing temp files
   git clean -fd
   ```

3. **Track New Components**
   ```bash
   git add src/components/ src/lib/ src/pages/
   git commit -m "Add authentication and video management features"
   ```

### Architecture Improvements

1. **API Route Organization**
   - Create consistent CRUD patterns for video endpoints
   - Add input validation with Zod or similar
   - Implement proper error handling

2. **Type Safety**
   - Create shared TypeScript types for API responses
   - Use Prisma types throughout the application
   - Add proper typing for Astro context locals

3. **Security**
   - Implement CSRF protection
   - Add rate limiting on auth endpoints
   - Validate user permissions on video operations
   - Sanitize video URLs and metadata

4. **Performance**
   - Implement pagination for video listings
   - Add caching for published videos
   - Optimize database queries with proper indexes

### Feature Enhancements

1. **Video Management**
   - Add video search functionality
   - Implement tag-based filtering
   - Create category browsing
   - Add video playlists

2. **User Experience**
   - Progress tracking for learning paths
   - Bookmarking system
   - User notes on videos
   - Email notifications

3. **Admin Features**
   - Bulk video operations
   - Analytics dashboard
   - User management
   - Content moderation

---

## Context7 Documentation References

### Astro
- **Library ID**: `/llmstxt/astro_build_llms-full_txt`
- **Key Topics**: SSR, React integration, API routes, Vercel deployment
- **Snippets Available**: 18,023 code examples

### Prisma
- **Library ID**: `/prisma/docs`
- **Key Topics**: Schema design, PostgreSQL adapter, custom output
- **Snippets Available**: 4,691 code examples

### Better Auth
- **Library ID**: `/llmstxt/better-auth_llms_txt`
- **Key Topics**: Prisma integration, session management, API handlers
- **Snippets Available**: 3,022 code examples

---

## Development Commands

```bash
# Development
npm run dev              # Start dev server

# Database
npx prisma migrate dev   # Create and apply migrations
npx prisma generate      # Generate Prisma Client
npx prisma studio        # Open database GUI

# Build & Deploy
npm run build            # Build for production
npm run preview          # Preview production build
vercel                   # Deploy to Vercel
```

---

## Recent Commits

```
eaea4dd Configure for Vercel deployment with Neon database
8f9ee24 Initial commit from Astro
```

---

## Notes

- Project is in active development with authentication and video features being added
- Database schema is well-designed for the use case
- Proper separation of concerns with utilities and components
- Ready for Vercel deployment with SSR configuration
- Consider implementing middleware for global auth state
- Video management API needs to be completed

---

**Last Updated**: 2026-01-16
**Generated By**: Claude Code via Context7 MCP Plugin
