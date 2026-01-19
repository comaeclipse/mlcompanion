# Tech Stack

## Frontend
- **Astro 5.16.10**: Full SSR (server output mode, not static)
- **React 19**: For interactive components with client:load directive
- **TypeScript**: Strict mode enabled
- **Tailwind CSS 4**: Utility-first styling
- **Radix UI**: Component primitives (Dialog, Select, Slot)
- **Lucide React**: Icon library
- **CSS Variables**: For theming (see src/styles/global.css)

## Backend
- **Astro API Routes**: SSR endpoints in src/pages/api/
- **Prisma 7.2.0**: ORM with custom output location (src/generated/prisma/)
- **PostgreSQL**: Via Neon serverless
- **@prisma/adapter-pg**: Connection pooling for serverless (required)
- **pg**: PostgreSQL client with Pool for connection management

## Authentication
- **Custom session-based auth**: No third-party library
- **bcryptjs**: Password hashing (10 salt rounds)
- **Cookie-based sessions**: session_token cookie (HttpOnly, Secure, SameSite=Lax, 7-day expiry)
- **Database-backed sessions**: Session table stores tokens

## External APIs
- **YouTube Data API v3**: Metadata fetching (requires YOUTUBE_API_KEY)

## Build & Deployment
- **Vercel Adapter**: @astrojs/vercel for serverless deployment
- **Vite**: Build tooling
- **tsx**: TypeScript execution for scripts
- **dotenv**: Environment variable loading

## Key Dependencies
- class-variance-authority: Component variant styling
- clsx + tailwind-merge: Utility for conditional classes