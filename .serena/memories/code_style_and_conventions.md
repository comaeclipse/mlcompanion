# Code Style and Conventions

## General
- **No ESLint/Prettier config**: Project does not use automated linting or formatting
- **TypeScript strict mode**: Enabled via astro/tsconfigs/strict
- **Path alias**: `@/` maps to `src/` directory

## TypeScript Conventions
- **Interfaces over types**: Use `interface` for object shapes (see VideoCard.tsx)
- **Explicit return types**: Functions should have explicit return types where non-obvious
- **Type imports**: Use `import type` for type-only imports (e.g., `import type { APIRoute } from "astro"`)
- **Null/undefined handling**: Use optional chaining and nullish coalescing

## Naming Conventions
- **camelCase**: Variables, functions, properties
- **PascalCase**: Interfaces, types, React components, Astro components
- **kebab-case**: File names for pages (e.g., manage.astro), API routes
- **PascalCase**: File names for React components (e.g., VideoCard.tsx)
- **lowercase with hyphens**: Database table names in Prisma follow convention

## File Organization
- **API routes**: src/pages/api/ - mirrors URL structure
- **React components**: src/components/ (*.tsx files)
- **Astro components**: src/components/ or src/layouts/ (*.astro files)
- **Utilities**: src/lib/ - organized by domain (auth-utils.ts, video-utils.ts, etc.)
- **UI primitives**: src/components/ui/ - Radix UI wrapper components

## React Component Patterns
- **Named exports**: Use named exports for components (e.g., `export function VideoCard()`)
- **Props interfaces**: Define explicit interfaces for component props
- **Inline styles**: Mix of inline styles and Tailwind classes (see VideoCard.tsx)
- **CSS variables**: Use var(--variable-name) for theme colors
- **Event handlers**: Prefix with "handle" (e.g., handleClick)

## Astro Patterns
- **Client directives**: Use `client:load` for interactive React components
- **Protected pages**: Check auth in frontmatter, redirect if unauthorized
- **Dynamic React mounting**: Use createRoot() in script tags for conditional rendering

## API Route Patterns
- **Export named handlers**: `export const GET: APIRoute`, `export const POST: APIRoute`
- **Auth middleware**: Use `requireAuth(context)` helper, check if Response returned
- **JSON responses**: Return `new Response(JSON.stringify(data), { status, headers })`
- **Error handling**: Return appropriate HTTP status codes with error messages

## Prisma Conventions
- **Custom client location**: Import from "@/generated/prisma/client" or "@/lib/prisma"
- **Never import**: `@prisma/client` directly - use custom location
- **Connection pooling**: Always use prisma instance from @/lib/prisma (has adapter)
- **UUID IDs**: All models use `@id @default(uuid())`
- **Timestamps**: createdAt, updatedAt on all models
- **Soft deletes**: Use isPublished boolean, not actual deletion

## Database Patterns
- **Cascade deletes**: Foreign keys use `onDelete: Cascade`
- **Indexes**: Add @@index for foreign keys and frequently queried fields
- **String arrays**: Use String[] for tags

## Authentication Patterns
- **Session validation**: Use getSessionFromRequest(request) in pages
- **API auth**: Use requireAuth(context) in API routes
- **Password hashing**: Use bcryptjs with 10 salt rounds
- **Session tokens**: Random crypto tokens stored in Session table

## Comment Style
- **Minimal comments**: Code should be self-documenting
- **Prisma comments**: Use // for comments in schema.prisma
- **JSDoc**: Not used consistently, not required