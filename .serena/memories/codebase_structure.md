# Codebase Structure

## Root Directory
```
MLCompanion/
├── .astro/              # Astro build artifacts
├── .claude/             # Claude Code configuration
├── .serena/             # Serena agent configuration
├── .vercel/             # Vercel deployment configuration
├── .vscode/             # VS Code settings
├── dist/                # Production build output
├── node_modules/        # npm dependencies
├── prisma/              # Prisma schema and migrations
│   ├── migrations/      # Database migration files
│   └── schema.prisma    # Database schema definition
├── public/              # Static assets served as-is
├── scripts/             # Utility scripts (e.g., create-admin.ts)
├── src/                 # Main source code
├── .env                 # Environment variables (not in git)
├── .gitignore           # Git ignore rules
├── astro.config.mjs     # Astro configuration
├── CLAUDE.md            # Project documentation for Claude
├── components.json      # UI component configuration
├── package.json         # npm package configuration
├── package-lock.json    # npm lockfile
├── prisma.config.ts     # Prisma client configuration
├── README.md            # Generic Astro readme
├── tailwind.config.cjs  # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## src/ Directory Structure

### Core Directories
```
src/
├── assets/              # Images, SVGs, etc.
│   ├── astro.svg
│   └── background.svg
├── components/          # React and Astro components
│   ├── ui/              # Radix UI wrapper components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── textarea.tsx
│   ├── LoginForm.tsx
│   ├── ManageVideosPage.tsx
│   ├── ManageVideosWrapper.tsx
│   ├── VideoCard.tsx
│   ├── VideoForm.tsx
│   ├── VideoLibrary.tsx
│   ├── VideoLibraryWithToggle.tsx
│   ├── VideoPlayerModal.tsx
│   └── Welcome.astro
├── generated/           # Generated code (DO NOT EDIT MANUALLY)
│   └── prisma/          # Prisma client (custom output location)
│       ├── client.ts    # Main Prisma client export
│       ├── models/      # Generated model types
│       └── internal/    # Prisma internal types
├── layouts/             # Astro layout components
│   └── Layout.astro     # Main page layout
├── lib/                 # Utility functions and shared code
│   ├── auth-utils.ts    # Auth helper functions (getSession, requireAuth)
│   ├── auth.ts          # Core auth logic (verifyCredentials, createSession)
│   ├── prisma.ts        # Prisma client instance (with adapter)
│   ├── tag-utils.ts     # Tag manipulation utilities
│   ├── utils.ts         # General utility functions
│   └── video-utils.ts   # Video URL parsing and validation
├── pages/               # Astro pages and API routes
│   ├── api/             # API endpoints
│   │   ├── auth/
│   │   │   └── login.ts # POST login endpoint
│   │   └── videos/
│   │       ├── [id].ts  # GET/PUT/DELETE single video
│   │       ├── index.ts # GET/POST video list
│   │       └── metadata.ts # POST fetch YouTube metadata
│   ├── videos/
│   │   ├── tag/
│   │   │   └── [slug].astro # Videos filtered by tag
│   │   ├── index.astro  # Public video library
│   │   └── manage.astro # User's video management page
│   ├── index.astro      # Homepage
│   └── login.astro      # Login page
└── styles/
    └── global.css       # Global styles and CSS variables
```

## Key Files Explained

### Configuration Files
- **astro.config.mjs**: Astro configuration (SSR mode, Vercel adapter, React integration)
- **tsconfig.json**: TypeScript config (path alias @/ → src/, strict mode)
- **tailwind.config.cjs**: Tailwind CSS configuration
- **prisma.config.ts**: Prisma client setup with pg adapter for connection pooling
- **components.json**: Radix UI component configuration

### Database
- **prisma/schema.prisma**: Database schema (User, Account, Session, Verification, Video)
- **src/lib/prisma.ts**: Configured Prisma client instance (uses adapter for serverless)
- **src/generated/prisma/**: Generated Prisma client code (custom location)

### Authentication
- **src/lib/auth.ts**: Core auth functions (session creation, credential verification)
- **src/lib/auth-utils.ts**: Auth helpers for pages and API routes
- **src/pages/api/auth/login.ts**: Login API endpoint

### Video Management
- **src/lib/video-utils.ts**: YouTube URL parsing and validation
- **src/pages/api/videos/**: Video CRUD API endpoints
- **src/components/Video*.tsx**: Video-related React components

### UI Components
- **src/components/ui/**: Radix UI wrappers styled with Tailwind
- **src/layouts/Layout.astro**: Main page wrapper with head, styles
- **src/styles/global.css**: Global styles, CSS variables, theme colors

## Important Patterns

### URL Structure
- `/` - Homepage
- `/login` - Login page
- `/videos` - Public video library
- `/videos/manage` - User's video management (auth required)
- `/videos/tag/[slug]` - Videos filtered by tag
- `/api/auth/login` - Login endpoint
- `/api/videos` - Video CRUD endpoints
- `/api/videos/metadata` - YouTube metadata fetching

### Import Patterns
```typescript
// Path alias for src/
import { prisma } from "@/lib/prisma";
import { VideoCard } from "@/components/VideoCard";

// Prisma client from CUSTOM location (never @prisma/client)
import { PrismaClient } from "../src/generated/prisma/client";

// Type-only imports
import type { APIRoute } from "astro";
```