# Hall of Fame - Build Plan

**Status**: Ready for implementation  
**Last Updated**: 2026-07-20

## Overview

Build a self-hosted achievement tracker for running/trail racing using Next.js, Tailwind CSS, shadcn/ui, and JSON file storage. Deploy to Raspberry Pi via Docker.

## Prerequisites

- Node.js 18+
- npm or pnpm
- Docker (for deployment)
- Read AGENT.md for full project context

## Build Steps

### Phase 1: Foundation Setup ⏳

**1.1 Initialize Next.js Project**
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

**1.2 Configure Next.js**
- Edit `next.config.js`: Add `output: 'standalone'` for Docker
- Verify `tailwind.config.ts` includes shadcn/ui content paths

**1.3 Install shadcn/ui**
```bash
npx shadcn@latest init
```
Settings:
- Style: Default
- Base color: Slate
- CSS variables: Yes

**1.4 Add Required shadcn Components**
```bash
npx shadcn@latest add card button dialog form input select textarea badge tabs alert
```

**1.5 Create Environment Variables**
```bash
echo "ADMIN_PASSWORD=changeme123" > .env.local
```

**Verification**: 
- `npm run dev` starts without errors
- `http://localhost:3000` shows default Next.js page

---

### Phase 2: Data Layer 📊

**2.1 Create TypeScript Types**

Create `lib/types.ts`:
```typescript
export interface Achievement {
  id: string;
  date: string;
  category: "Trail" | "Run";
  distance: number;
  name: string;
  photoLinks: string[];
  videoLinks: string[];
  eventWebsite: string;
  rankingScratch: number;
  rankingCategory: string;
  rankingCategoryPosition: number;
}

export interface AchievementsData {
  achievements: Achievement[];
}
```

**2.2 Create JSON File Operations**

Create `lib/achievements.ts`:
```typescript
import fs from 'fs';
import path from 'path';
import { Achievement, AchievementsData } from './types';

const DATA_PATH = path.join(process.cwd(), 'data', 'achievements.json');

export function readAchievements(): Achievement[] {
  // Read JSON file
  // Parse and return achievements array
  // Handle errors gracefully
}

export function writeAchievements(achievements: Achievement[]): void {
  // Validate data
  // Write to JSON file with formatting
  // Handle errors
}

export function getAchievementById(id: string): Achievement | null {
  // Find achievement by ID
}

export function createAchievement(achievement: Omit<Achievement, 'id'>): Achievement {
  // Generate UUID
  // Add to achievements
  // Write to file
  // Return new achievement
}

export function updateAchievement(id: string, achievement: Partial<Achievement>): Achievement | null {
  // Find achievement
  // Update fields
  // Write to file
  // Return updated achievement
}

export function deleteAchievement(id: string): boolean {
  // Remove from array
  // Write to file
  // Return success
}
```

**2.3 Create Auth Utilities**

Create `lib/auth.ts`:
```typescript
export function verifyPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}
```

**Verification**:
- TypeScript compiles without errors
- Can import types and functions

---

### Phase 3: API Routes 🔌

**3.1 Create GET/POST Route**

Create `app/api/achievements/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { readAchievements, createAchievement } from '@/lib/achievements';
import { verifyPassword } from '@/lib/auth';

export async function GET() {
  // Return all achievements
}

export async function POST(request: Request) {
  // Verify password
  // Create achievement
  // Return new achievement
}
```

**3.2 Create PUT/DELETE Route**

Create `app/api/achievements/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { updateAchievement, deleteAchievement } from '@/lib/achievements';
import { verifyPassword } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  // Verify password
  // Update achievement
  // Return updated achievement
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // Verify password
  // Delete achievement
  // Return success
}
```

**Verification**:
- `curl http://localhost:3000/api/achievements` returns sample data
- POST/PUT/DELETE with correct password work
- Incorrect password returns 401

---

### Phase 4: UI Components 🎨

**4.1 Achievement Card Component**

Create `app/components/achievement-card.tsx`:
```typescript
'use client';

import { Achievement } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Props {
  achievement: Achievement;
  onEdit?: (achievement: Achievement) => void;
  onDelete?: (id: string) => void;
}

export function AchievementCard({ achievement, onEdit, onDelete }: Props) {
  // Display achievement data
  // Show category badge (Trail/Run)
  // Show date, distance, name
  // Show rankings
  // Show links (photos, videos, website)
  // Edit/Delete buttons (if callbacks provided)
}
```

**4.2 Auth Dialog Component**

Create `app/components/auth-dialog.tsx`:
```typescript
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
}

export function AuthDialog({ open, onClose, onSubmit }: Props) {
  // Password input field
  // Submit button
  // Error state
}
```

**4.3 Achievement Form Component**

Create `app/components/achievement-form.tsx`:
```typescript
'use client';

import { Achievement } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  achievement?: Achievement; // If editing
  onClose: () => void;
  onSubmit: (data: Omit<Achievement, 'id'>) => void;
}

export function AchievementForm({ open, achievement, onClose, onSubmit }: Props) {
  // Form fields for all achievement properties
  // Category select (Trail/Run)
  // Category ranking select (with all age groups)
  // Multi-input for photo/video links
  // Validation
  // Submit handler
}
```

**4.4 Filter Toolbar Component**

Create `app/components/filter-toolbar.tsx`:
```typescript
'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';

interface Props {
  onCategoryFilter: (category: 'all' | 'Trail' | 'Run') => void;
  onSort: (sort: 'date' | 'distance') => void;
}

export function FilterToolbar({ onCategoryFilter, onSort }: Props) {
  // Category tabs (All/Trail/Run)
  // Sort select (Date/Distance)
}
```

**Verification**:
- Components render without errors
- Props are typed correctly

---

### Phase 5: Main Page 🏠

**5.1 Create Homepage**

Edit `app/page.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Achievement } from '@/lib/types';
import { AchievementCard } from './components/achievement-card';
import { AchievementForm } from './components/achievement-form';
import { AuthDialog } from './components/auth-dialog';
import { FilterToolbar } from './components/filter-toolbar';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filtered, setFiltered] = useState<Achievement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Fetch achievements on mount
  // Filter/sort logic
  // Auth flow: prompt -> verify -> execute action
  // CRUD operations via API

  return (
    // Header with title + "Add Achievement" button
    // FilterToolbar
    // Grid of AchievementCards
    // AchievementForm dialog
    // AuthDialog
  );
}
```

**5.2 Update Layout**

Edit `app/layout.tsx`:
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hall of Fame',
  description: 'Personal achievement tracker for runners and trail athletes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**5.3 Style Globals**

Edit `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Add any custom global styles */
/* Ensure shadcn/ui CSS variables are included */
```

**Verification**:
- Homepage displays sample achievements
- Add button opens form
- Edit/delete buttons prompt for password
- Correct password allows operations
- Filters work
- Sort works
- Responsive on mobile

---

### Phase 6: Docker Setup 🐳

**6.1 Configure Next.js for Standalone**

Edit `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

module.exports = nextConfig;
```

**6.2 Test Docker Build**
```bash
docker build -t halloffame:latest .
```

**6.3 Test Docker Run**
```bash
docker run -d -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e ADMIN_PASSWORD=changeme123 \
  --name halloffame \
  halloffame:latest
```

**6.4 Verify Container**
```bash
docker logs halloffame
curl http://localhost:3000/api/achievements
```

**Verification**:
- Docker build succeeds
- Container starts without errors
- App accessible at `http://localhost:3000`
- JSON file persists after container restart
- Environment variables work

---

### Phase 7: Polish & Testing ✨

**7.1 UI Polish**
- Add loading states
- Add error messages (Alert component)
- Add empty state (no achievements yet)
- Add confirmation dialog for delete
- Improve mobile responsiveness
- Add subtle animations (optional)

**7.2 Data Validation**
- Validate form inputs (distance > 0, valid URLs, etc.)
- Validate API request bodies
- Handle malformed JSON file gracefully

**7.3 Error Handling**
- API error responses
- File system error handling
- Network error handling in UI

**7.4 Testing Checklist**

Run through full checklist from AGENT.md:
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

**7.5 Documentation**
- Add comments to complex code
- Update AGENT.md with any decisions made
- Verify README.md is accurate

---

## Deployment to Raspberry Pi

Once all phases complete:

**1. Build on Raspberry Pi**
```bash
# Clone repo on Pi
git clone <repo-url>
cd halloffame

# Build image
docker build -t halloffame:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -v /home/pi/halloffame-data:/app/data \
  -e ADMIN_PASSWORD=<strong-password> \
  --restart unless-stopped \
  --name halloffame \
  halloffame:latest
```

**2. Access**
- Local: `http://raspberrypi.local:3000`
- Network: `http://<pi-ip>:3000`

---

## Optional Enhancements (Post-MVP)

Not required for initial build, but nice-to-haves:

1. **Export Feature**: Download achievements as CSV/JSON
2. **Import Feature**: Bulk upload from CSV
3. **Statistics**: Total distance, race count, average rankings
4. **Photo Upload**: Store photos locally instead of external links
5. **Dark Mode**: Theme toggle
6. **Backup**: Auto-backup JSON file daily
7. **Search**: Text search across achievement names

---

## Troubleshooting

**JSON file not updating**
- Check file permissions in Docker container
- Verify volume mount is correct
- Check `/app/data` exists and is writable by nextjs user

**Docker build fails**
- Ensure `output: 'standalone'` in next.config.js
- Check Node version (need 18+)
- Try clearing Next.js cache: `rm -rf .next`

**Auth not working**
- Verify ADMIN_PASSWORD env var is set
- Check .env.local is not committed (in .gitignore)
- In Docker, pass via `-e` flag or docker-compose

**API routes 404**
- Verify file structure: `app/api/achievements/route.ts`
- Check Next.js is using App Router (not Pages Router)
- Clear .next and rebuild

---

## Success Criteria

Project is complete when:

1. All items in Phase 7 testing checklist pass
2. Docker image builds and runs on Raspberry Pi
3. User can add/edit/delete achievements via UI
4. Data persists across container restarts
5. UI is responsive and polished
6. Code is well-documented

---

**Next Agent**: Start with Phase 1, work sequentially through phases. Update this file with progress notes at bottom.

## Progress Log

| Date | Phase | Status | Notes |
|------|-------|--------|-------|
| 2026-07-20 | Planning | ✅ Complete | Initial plan created |
| 2026-07-20 | Phase 1 | ✅ Complete | Next.js init, shadcn/ui setup |
| 2026-07-20 | Phase 2 | ✅ Complete | Types, lib functions (achievements, auth) |
| 2026-07-20 | Phase 3 | ✅ Complete | API routes (GET/POST/PUT/DELETE). Fixed Next.js 16 async params |
| 2026-07-20 | Phase 4 | ✅ Complete | UI components (AchievementCard, AuthDialog, AchievementForm, FilterToolbar) |
| 2026-07-20 | Phase 5 | ✅ Complete | Main page with CRUD, filters, auth flow. Dev server running on :3000 |
| 2026-07-20 | Phase 6 | ✅ Complete | Docker build fixed (output:standalone), image builds, container runs, data persists |
| 2026-07-20 | Phase 7 | ✅ Complete | Delete confirmation, API validation, error handling, testing complete |
