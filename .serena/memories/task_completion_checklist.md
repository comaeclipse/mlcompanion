# Task Completion Checklist

When you complete a coding task, follow this checklist to ensure code quality and correctness.

## 1. Schema Changes
If you modified `prisma/schema.prisma`:
- [ ] Run `npx prisma generate` to regenerate the Prisma client
- [ ] Run `npx prisma migrate dev --name <description>` to create and apply migration
- [ ] Verify migration was applied successfully

## 2. Code Quality Checks
- [ ] Verify all imports are correct (especially Prisma imports from custom location)
- [ ] Check that `@/` path alias is used for src/ imports
- [ ] Ensure TypeScript types are correct (no `any` unless necessary)
- [ ] Verify error handling is appropriate
- [ ] Check that authentication is enforced where required

## 3. Security Checks
- [ ] Passwords are hashed with bcryptjs (never stored plain)
- [ ] Session tokens are HttpOnly, Secure, SameSite=Lax
- [ ] User authorization is checked (users can only edit their own content)
- [ ] Input validation is performed on API endpoints
- [ ] SQL injection is prevented (Prisma handles this automatically)
- [ ] XSS is prevented (React handles this automatically for most cases)

## 4. Video-Related Changes
If you modified video management code:
- [ ] Soft delete pattern is maintained (isPublished flag, not actual deletion)
- [ ] Video ownership is verified before edit/delete operations
- [ ] Public endpoints only return isPublished: true videos
- [ ] YouTube URL parsing handles all formats (youtu.be, /watch, /shorts/, /embed/)

## 5. API Route Changes
If you modified API routes:
- [ ] Correct HTTP method is exported (GET, POST, PUT, DELETE)
- [ ] Authentication is enforced with `requireAuth()` where needed
- [ ] Appropriate status codes are returned (200, 201, 400, 401, 403, 404, 500)
- [ ] Content-Type header is set correctly
- [ ] Error responses have consistent format

## 6. React Component Changes
If you modified React components:
- [ ] Components are exported with named exports
- [ ] Props have explicit TypeScript interfaces
- [ ] Client directive (client:load) is used when needed in Astro
- [ ] Event handlers are properly typed

## 7. Testing (Manual)
Since automated tests are not set up:
- [ ] Test the changed functionality manually
- [ ] Test error cases and edge cases
- [ ] Verify authentication flows work correctly
- [ ] Check that UI renders correctly

## 8. Common Pitfalls to Avoid
- [ ] Never import from `@prisma/client` - use custom location or `@/lib/prisma`
- [ ] Never hard-delete videos - use isPublished: false
- [ ] Never skip session validation in protected routes
- [ ] Never forget to run `npx prisma generate` after schema changes
- [ ] Never store sensitive data in environment variables that are exposed to client
- [ ] Never trust user input without validation

## 9. Deployment Considerations
Before pushing to production:
- [ ] Environment variables are set in Vercel dashboard
- [ ] Database migrations can be applied (test in development first)
- [ ] No console.log statements in production code (or minimal)
- [ ] Build completes successfully (`npm run build`)

## 10. Documentation
- [ ] Update CLAUDE.md if architectural patterns change
- [ ] Update this checklist if new patterns emerge
- [ ] Document any unusual decisions or workarounds in comments