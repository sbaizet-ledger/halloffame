# AGENT.md - Hall of Fame Project Context

**Project**: Hall of Fame - Self-hosted sportive achievement tracker  
**Owner**: Individual runner/trail athlete  
**Deployment**: Raspberry Pi via Docker  
**Status**: Initial setup phase

## Project Purpose

Personal achievement tracker for running and trail racing. User wants to maintain a visual hall of fame of their best performances with detailed race information, rankings, and media links. No social features - single user, self-hosted on local network.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router, React Server Components)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Data Storage**: JSON file at `/data/achievements.json` (no database)
- **Authentication**: Simple password protection for edit operations (environment variable)
- **Deployment**: Docker on Raspberry Pi (ARM64)

## Achievement Data Model

Each achievement contains:

```typescript
interface Achievement {
  id: string;                        // UUID
  date: string;                      // ISO format YYYY-MM-DD
  category: "Trail" | "Run";         // Event type
  distance: number;                  // Kilometers (decimal)
  name: string;                      // Event name
  photoLinks: string[];              // External URLs only
  videoLinks: string[];              // External URLs only
  eventWebsite: string;              // Official event URL
  rankingScratch: number;            // Overall position
  rankingCategory: string;           // Age/gender category with gender suffix
  rankingCategoryPosition: number;   // Position within category
}
```

**Sample data**: See `/data/achievements.json`

## Category Reference

Age/gender categories follow French athletics standards. Format: `[Category] [M/F]`

**Categories**:
- Poussin (U10)
- Benjamin (U12)
- Minime (U14)
- Cadet (U16)
- Junior (U18)
- Espoir (U20)
- Senior (20-34)
- Master 0 (35-39)
- Master 1 (40-44)
- Master 2 (45-49)
- Master 3 (50-54)
- Master 4 (55-59)
- Master 5 (60-64)
- Master 6 (65-69)
- Master 7 (70-74)
- Master 8 (75-79)
- Master 9 (80-84)
- Master 10 (85+)

**Gender**: M (Homme) or F (Femme)

Examples: `Senior H`, `Master 1 F`, `Espoir M`

## Key Requirements

### Must Have
1. **View achievements** - Display all achievements in attractive card layout
2. **Add achievement** - Form to create new entries (requires auth)
3. **Edit achievement** - Modify existing entries (requires auth)
4. **Delete achievement** - Remove entries (requires auth)
5. **Sort/Filter** - By date, distance, category (Trail/Run)
6. **Authentication** - Password protect edit operations
7. **Responsive UI** - Works on desktop and mobile
8. **Docker deployment** - ARM64 compatible for Raspberry Pi

### Design Priorities
- **UI Quality**: Use shadcn/ui components for polished, modern aesthetic
- **Performance**: Lightweight for Raspberry Pi (optimize images, minimize JS)
- **Simplicity**: No database setup, simple JSON file operations
- **Data Safety**: Validate JSON writes to prevent corruption

### Explicitly NOT Needed
- User registration/multi-user support
- Photo/video upload (external links only)
- Social features (sharing, comments, likes)
- Statistics/analytics dashboard (future enhancement)
- Mobile app (web interface sufficient)

## File Structure

```
halloffame/
├── app/
│   ├── page.tsx                    # Homepage - achievement gallery
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── components/
│   │   ├── achievement-card.tsx    # Display single achievement
│   │   ├── achievement-form.tsx    # Add/edit form
│   │   ├── achievement-list.tsx    # Main gallery view
│   │   ├── filter-toolbar.tsx      # Sort/filter controls
│   │   └── auth-dialog.tsx         # Password prompt
│   └── api/
│       └── achievements/
│           ├── route.ts            # GET (list), POST (create)
│           └── [id]/
│               └── route.ts        # PUT (update), DELETE (delete)
├── lib/
│   ├── achievements.ts             # JSON file operations
│   ├── auth.ts                     # Password verification
│   └── utils.ts                    # Shared utilities
├── data/
│   └── achievements.json           # Achievement storage
├── public/                         # Static assets
├── components.json                 # shadcn/ui config
├── Dockerfile                      # Docker build
├── .dockerignore                   # Docker ignore rules
├── .env.local                      # Local environment vars
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Development Guidelines

### Code Style
- **TypeScript**: Strict mode, explicit types for Achievement model
- **Server Components**: Default to RSC, use 'use client' only when needed
- **API Routes**: Use App Router route handlers (not Pages API)
- **Error Handling**: Graceful fallbacks, validate JSON before writes
- **Comments**: Document non-obvious logic, especially JSON file operations

### shadcn/ui Components to Use
- `Card`, `CardHeader`, `CardContent` - Achievement cards
- `Button` - Actions (add, edit, delete)
- `Dialog` - Auth prompt, confirmation modals
- `Form`, `Input`, `Select`, `Textarea` - Achievement form
- `Badge` - Category pills (Trail/Run)
- `Tabs` - Filter UI
- `Alert` - Error messages

### Authentication Pattern
```typescript
// Simple password check against env var
// ADMIN_PASSWORD in .env.local
// No sessions/tokens needed - prompt on each edit action
// Use Dialog component for password input
```

### JSON File Operations
```typescript
// Read: fs.readFileSync + JSON.parse with try/catch
// Write: JSON.stringify with 2-space indent + fs.writeFileSync
// Always validate schema before write
// Create backup before destructive operations (optional)
```

### Docker Notes
- Requires `output: 'standalone'` in `next.config.js`
- Mount `/app/data` as volume for persistent storage
- Build command: `docker build -t halloffame:latest .`
- Run command: `docker run -d -p 3000:3000 -v $(pwd)/data:/app/data --name halloffame halloffame:latest`

## Testing Checklist

Before considering work complete:

- [ ] View page loads and displays sample achievements
- [ ] Add form creates new achievement and updates JSON
- [ ] Edit form modifies existing achievement correctly
- [ ] Delete removes achievement from JSON
- [ ] Auth dialog appears for edit operations
- [ ] Correct password grants access
- [ ] Wrong password shows error
- [ ] Sort by date/distance works
- [ ] Filter by Trail/Run works
- [ ] Responsive on mobile viewport
- [ ] Docker build succeeds
- [ ] Docker container runs and serves app
- [ ] JSON file persists after container restart

## Environment Variables

```bash
# .env.local (not committed to git)
ADMIN_PASSWORD=your-secure-password-here
```

## Common Commands

```bash
# Development
npm run dev                          # Start dev server

# Production
npm run build                        # Build Next.js app
npm start                            # Run production server

# Docker
docker build -t halloffame:latest .  # Build image
docker run -d -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --name halloffame \
  halloffame:latest                  # Run container
docker logs halloffame               # View logs
docker stop halloffame               # Stop container
docker rm halloffame                 # Remove container
```

## Future Enhancements (Not Immediate Priorities)

- Export achievements to PDF/CSV
- Statistics dashboard (total distance, race count, PR tracking)
- Photo upload capability (store locally vs external links)
- Search functionality
- Backup/restore feature
- Dark mode
- Multi-language support

## Agent Working Notes

Use this section to document decisions, gotchas, or context for future sessions:

- **Date**: 2026-07-20
- **Initial Setup**: Project structure defined, README created, sample data added
- **Tech Decisions**: Chose Next.js over Astro for richer ecosystem despite slightly higher resource usage on Pi

---

**Last Updated**: 2026-07-20  
**Next Steps**: Initialize Next.js app, setup shadcn/ui, build achievement list view
