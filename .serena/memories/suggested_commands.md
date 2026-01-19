# Suggested Commands

## Development Commands (Windows)

### Starting Development
```bash
npm run dev              # Start dev server at localhost:4321
npm run build            # Build for production
npm run preview          # Preview production build locally
```

### Database Operations
```bash
npx prisma migrate dev   # Create and apply new migration
npx prisma generate      # Regenerate Prisma Client (REQUIRED after schema changes)
npx prisma studio        # Open database GUI
npx prisma migrate status # Check migration status
npx prisma migrate reset # Reset database (DESTRUCTIVE - deletes all data)
```

**IMPORTANT**: Always run `npx prisma generate` after modifying prisma/schema.prisma to regenerate the client in src/generated/prisma/

### Admin Utilities
```bash
npm run create-admin     # Create admin user account (interactive script)
```

### Package Management
```bash
npm install              # Install dependencies
npm install <package>    # Add new dependency
npm install -D <package> # Add dev dependency
```

### Windows-Specific Utilities
```powershell
# File operations (PowerShell)
ls                       # List files (alias for Get-ChildItem)
cd <directory>           # Change directory
cat <file>               # View file contents (alias for Get-Content)
rm <file>                # Remove file
mkdir <directory>        # Create directory

# Git operations
git status               # Check repository status
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push                 # Push to remote
git pull                 # Pull from remote
git log                  # View commit history

# Process management
Get-Process              # List running processes
Stop-Process -Name <name> # Kill process by name
netstat -ano             # List ports in use
```

### Astro CLI Commands
```bash
npm run astro add        # Add Astro integration
npm run astro check      # Type check Astro files
npm run astro -- --help  # Get help with Astro CLI
```

### Common Development Workflows

#### After modifying Prisma schema:
1. `npx prisma generate` - Regenerate client
2. `npx prisma migrate dev --name <description>` - Create and apply migration
3. Test changes

#### When pulling changes from git:
1. `git pull` - Get latest changes
2. `npm install` - Install new dependencies
3. `npx prisma generate` - Ensure Prisma client is up to date
4. `npx prisma migrate deploy` (production) or `npx prisma migrate dev` (development)

#### Deploying to Vercel:
- Automatic deployment on git push to main branch
- Migrations must be applied manually or via build command
- Environment variables must be set in Vercel dashboard