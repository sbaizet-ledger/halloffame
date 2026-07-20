# Personalization Implementation Plan

## Overview

Transform Hall of Fame into personal achievement showcase with:
1. Profile hero section with uploaded avatar
2. Custom color theming 
3. Featured achievements (highlight best performances)
4. Personal milestones timeline
5. Achievement badges/icons system

## Architecture Decisions

### File Storage Strategy
- **Profile data**: `/data/profile.json` (nickname, bio, theme settings)
- **Avatar upload**: `/public/uploads/avatar.jpg` (served statically)
- **Badge icons**: `/public/badges/` directory (custom achievement icons)
- **API routes**: New `/api/profile` and `/api/upload` endpoints

### Color Theme System
**Approach**: User-customizable accent color applied via CSS variables

- Store primary color in `profile.json` as hex/oklch
- Inject into `:root` CSS variables dynamically
- Override `--primary`, `--accent`, trophy icons, chart colors
- Provide color picker in settings UI

**Decision**: Primary color only (affects buttons, headers, accents) - Option A

### Featured Achievements
**Mechanism**: Add `featured: boolean` flag to Achievement type

- Achievements with `featured=true` display in hero section
- **Hard limit: 3 featured maximum** - enforced in UI and API
- Show in separate "Highlights" carousel/grid above main list

### Badges System
**Design**: Predefined + custom badge icons for special achievements

**Decision**: Hybrid approach - emoji defaults + custom icon upload capability

**Badge types:**
- Distance milestones (first 10k, 21k, 42k, 50k+, 100k+)
- Ranking achievements (podium finish, top 10, top 50)
- Streak badges (races per year, consecutive months)
- Custom badges (user-defined with uploaded icon)

**Storage:**
- `Achievement.badges: string[]` (array of badge IDs)
- `/data/badges.json` - badge definitions (id, name, icon, criteria)
- Auto-assign badges based on achievement data
- Custom badge icons in `/public/badges/custom/`

### Milestones Timeline
**Implementation**: New component showing key moments

**Decision**: Dual display - preview on homepage + full page in statistics

**Data source**: Compute from achievements:
- First race ever
- Personal bests (distance, ranking)
- Year summaries
- Custom manual milestones (injuries, comebacks, training phases)

**Storage:** 
- Auto-generated from achievements
- `profile.json` can add custom milestones with `{ date, title, description, type }`

### Avatar Upload Strategy
**Decision**: Server-side validation + image processing with `sharp` library

- Validate image format (JPEG, PNG, WebP)
- Resize to 512x512px
- Optimize file size (<200KB)
- Convert to WebP for better performance
- Malicious content validation

---

## Detailed Implementation

### Phase 1: Profile System & Avatar Upload

**1.1 Data Model**

Create `/data/profile.json`:
```json
{
  "nickname": "Sebastien",
  "bio": "Trail runner pushing limits",
  "avatarPath": "/uploads/avatar.jpg",
  "joinedYear": 2020,
  "location": "French Alps",
  "theme": {
    "primaryColor": "oklch(0.65 0.24 45)"
  },
  "socialLinks": {
    "strava": "https://strava.com/athletes/...",
    "instagram": "@runner_nickname"
  },
  "customMilestones": [
    {
      "date": "2020-06-15",
      "title": "First Trail Race",
      "description": "Started my journey",
      "icon": "star"
    }
  ]
}
```

**1.2 TypeScript Types**

Add to `lib/types.ts`:
```typescript
export interface UserProfile {
  nickname: string;
  bio?: string;
  avatarPath?: string;
  joinedYear?: number;
  location?: string;
  theme: ThemeConfig;
  socialLinks?: {
    strava?: string;
    instagram?: string;
    website?: string;
  };
  customMilestones?: CustomMilestone[];
}

export interface ThemeConfig {
  primaryColor: string;  // oklch format
}

export interface CustomMilestone {
  date: string;
  title: string;
  description?: string;
  icon?: string;
}
```

**1.3 API Routes**

**`/api/profile/route.ts`** (GET/PUT):
```typescript
// GET - read profile.json
// PUT - update profile (auth required)
```

**`/api/upload/route.ts`** (POST):
```typescript
// Accept multipart/form-data
// Validate image (jpg/png, max 5MB)
// Process with sharp (resize 512x512, optimize, WebP)
// Save to /public/uploads/
// Return new file path
// Auth required
```

**1.4 Profile Library**

Create `lib/profile.ts`:
```typescript
import fs from 'fs';
import path from 'path';

const PROFILE_PATH = path.join(process.cwd(), 'data', 'profile.json');

export function readProfile(): UserProfile | null {
  // Read and parse profile.json
  // Return default if not exists
}

export function writeProfile(profile: UserProfile): void {
  // Write profile.json
}

export function getDefaultProfile(): UserProfile {
  return {
    nickname: 'Runner',
    theme: { primaryColor: 'oklch(0.65 0.24 45)' }
  };
}
```

**1.5 File Upload Handler**

Create `lib/upload.ts`:
```typescript
import { writeFile } from 'fs/promises';
import sharp from 'sharp';
import path from 'path';

export async function saveAvatar(file: File): Promise<string> {
  // Validate file type and size
  // Process with sharp:
  //   - Resize to 512x512
  //   - Convert to WebP
  //   - Optimize quality
  // Generate unique filename
  // Save to /public/uploads/
  // Return path
}
```

**Dependencies:** Add `sharp` to package.json

**1.6 ProfileHero Component**

Create `components/profile-hero.tsx`:
```typescript
interface ProfileHeroProps {
  profile: UserProfile;
  stats: {
    totalRaces: number;
    totalDistance: number;
    yearsActive: number;
  };
}

export function ProfileHero({ profile, stats }: ProfileHeroProps) {
  return (
    <div className="profile-hero-section">
      {/* Avatar - circular, 120px, centered */}
      {/* Nickname - h2, bold */}
      {/* Bio - text-muted */}
      {/* Quick stats row - races | km | years */}
      {/* Social links icons */}
    </div>
  );
}
```

Layout:
```
┌────────────────────────────────────────┐
│                                        │
│          ╭─────────────╮               │
│          │   AVATAR    │               │
│          │   120x120   │               │
│          ╰─────────────╯               │
│                                        │
│        Sebastien's Hall of Fame       │
│     Trail runner pushing limits       │
│                                        │
│   42 races  •  856 km  •  5 years    │
│         [Strava] [Instagram]          │
│                                        │
└────────────────────────────────────────┘
```

---

### Phase 2: Custom Color Theming

**2.1 Theme Provider**

Create `components/theme-provider.tsx`:
```typescript
'use client';

import { useEffect } from 'react';

export function ThemeProvider({ primaryColor }: { primaryColor: string }) {
  useEffect(() => {
    // Inject CSS variable overrides
    document.documentElement.style.setProperty('--primary', primaryColor);
    // Convert to foreground color (high contrast)
    // Update accent colors
  }, [primaryColor]);

  return null;
}
```

**2.2 Layout Integration**

Modify `app/layout.tsx`:
```typescript
import { readProfile } from '@/lib/profile';

export default function RootLayout({ children }) {
  const profile = readProfile() || getDefaultProfile();
  
  return (
    <html>
      <body>
        <ThemeProvider primaryColor={profile.theme.primaryColor} />
        {children}
      </body>
    </html>
  );
}
```

**2.3 Color Picker UI**

Create profile page `/app/profile/page.tsx`:
- Profile edit form (nickname, bio, location)
- Avatar upload button
- Color picker for primary color
- Preview section showing theme

Use shadcn `Input` with `type="color"` or custom color picker component.

---

### Phase 3: Featured Achievements

**3.1 Extend Achievement Type**

Update `lib/types.ts`:
```typescript
export interface Achievement {
  // ... existing fields
  featured?: boolean;  // NEW
  badges?: string[];   // NEW (for Phase 4)
}
```

**3.2 Featured Section Component**

Create `components/featured-achievements.tsx`:
```typescript
interface FeaturedAchievementsProps {
  achievements: Achievement[];
}

export function FeaturedAchievements({ achievements }: FeaturedAchievementsProps) {
  const featured = achievements
    .filter(a => a.featured)
    .slice(0, 3);  // Max 3

  if (featured.length === 0) return null;

  return (
    <section className="featured-section mb-8">
      <h2 className="text-2xl font-bold mb-4">🏆 Highlights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featured.map(achievement => (
          <FeaturedCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </section>
  );
}
```

**3.3 Featured Card Styling**

Enhanced styling for featured cards:
- Gradient border
- "Featured" badge ribbon
- Larger prominence
- Animated on hover

**3.4 Toggle Feature UI**

Add star/pin icon to achievement cards:
- Click to toggle `featured` flag
- **Max 3 featured enforced** (show error if trying to feature 4th)
- Requires auth

---

### Phase 4: Achievement Badges System

**4.1 Badge Definitions**

Create `/data/badges.json`:
```json
{
  "badges": [
    {
      "id": "first-race",
      "name": "First Steps",
      "description": "Completed first race",
      "icon": "🎯",
      "criteria": { "type": "manual" }
    },
    {
      "id": "marathon",
      "name": "Marathoner",
      "description": "Completed 42.195 km",
      "icon": "🏃",
      "criteria": { "type": "distance", "value": 42.195 }
    },
    {
      "id": "ultra",
      "name": "Ultra Runner",
      "description": "Completed 50+ km",
      "icon": "⚡",
      "criteria": { "type": "distance", "value": 50 }
    },
    {
      "id": "podium",
      "name": "Podium Finish",
      "description": "Top 3 overall",
      "icon": "🥇",
      "criteria": { "type": "ranking", "position": 3 }
    },
    {
      "id": "top-10",
      "name": "Elite Performance",
      "description": "Top 10 finish",
      "icon": "⭐",
      "criteria": { "type": "ranking", "position": 10 }
    },
    {
      "id": "century",
      "name": "Century Club",
      "description": "100+ km race",
      "icon": "💯",
      "criteria": { "type": "distance", "value": 100 }
    },
    {
      "id": "streak-10",
      "name": "Consistent Racer",
      "description": "10+ races completed",
      "icon": "🔥",
      "criteria": { "type": "count", "value": 10 }
    }
  ]
}
```

**4.2 Badge Auto-Assignment**

Create `lib/badges.ts`:
```typescript
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: BadgeCriteria;
}

type BadgeCriteria = 
  | { type: 'distance'; value: number }
  | { type: 'ranking'; position: number }
  | { type: 'count'; value: number }
  | { type: 'manual' };

export function assignBadges(achievement: Achievement, allAchievements: Achievement[]): string[] {
  const badges: string[] = [];
  const badgeDefinitions = readBadges();

  // Check each badge criteria
  for (const badge of badgeDefinitions) {
    if (meetsCriteria(badge, achievement, allAchievements)) {
      badges.push(badge.id);
    }
  }

  return badges;
}

function meetsCriteria(badge: Badge, achievement: Achievement, all: Achievement[]): boolean {
  // Implement criteria checking logic
}
```

**4.3 Badge Display**

Add to `AchievementCard` and `AchievementTable`:
```typescript
{achievement.badges?.map(badgeId => (
  <BadgeIcon key={badgeId} badgeId={badgeId} />
))}
```

Create `components/badge-icon.tsx`:
- Tooltip showing badge name/description
- Emoji or custom SVG icon (support both)
- Small, non-intrusive display
- Support custom uploaded icons from `/public/badges/custom/`

**4.4 Custom Badge Upload**

Settings page allows:
- Upload custom badge icon (SVG/PNG)
- Assign to badge definition
- Override default emoji

---

### Phase 5: Personal Milestones Timeline

**5.1 Milestone Computation**

Create `lib/milestones.ts`:
```typescript
export interface Milestone {
  date: string;
  title: string;
  description?: string;
  type: 'first-race' | 'personal-best' | 'badge' | 'custom' | 'year-summary';
  icon?: string;
  achievement?: Achievement;  // Reference if applicable
}

export function computeMilestones(
  achievements: Achievement[],
  profile: UserProfile
): Milestone[] {
  const milestones: Milestone[] = [];

  // First race ever
  const sorted = achievements.sort((a,b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  if (sorted.length > 0) {
    milestones.push({
      date: sorted[0].date,
      title: 'First Race',
      description: sorted[0].name,
      type: 'first-race',
      icon: '🎯',
      achievement: sorted[0]
    });
  }

  // Personal bests (longest distance, best ranking)
  const longestTrail = achievements
    .filter(a => a.category === 'Trail')
    .sort((a,b) => b.distance - a.distance)[0];
  
  if (longestTrail) {
    milestones.push({
      date: longestTrail.date,
      title: `Longest Trail: ${longestTrail.distance}km`,
      description: longestTrail.name,
      type: 'personal-best',
      icon: '🏔️',
      achievement: longestTrail
    });
  }

  // Best ranking
  const bestRank = achievements
    .filter(a => a.rankingScratch > 0)
    .sort((a,b) => a.rankingScratch - b.rankingScratch)[0];
  
  if (bestRank) {
    milestones.push({
      date: bestRank.date,
      title: `Best Overall: #${bestRank.rankingScratch}`,
      description: bestRank.name,
      type: 'personal-best',
      icon: '🥇',
      achievement: bestRank
    });
  }

  // Year summaries (group achievements by year)
  const byYear = groupByYear(achievements);
  for (const [year, yearAchievements] of Object.entries(byYear)) {
    if (yearAchievements.length >= 3) {  // Only if substantial year
      const totalDist = yearAchievements.reduce((sum, a) => sum + a.distance, 0);
      milestones.push({
        date: `${year}-12-31`,
        title: `${year} Year Summary`,
        description: `${yearAchievements.length} races, ${totalDist.toFixed(0)}km`,
        type: 'year-summary',
        icon: '📅'
      });
    }
  }

  // Add custom milestones from profile
  if (profile.customMilestones) {
    milestones.push(...profile.customMilestones.map(m => ({
      ...m,
      type: 'custom' as const
    })));
  }

  // Sort chronologically
  return milestones.sort((a,b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
```

**5.2 Timeline Component**

Create `components/milestones-timeline.tsx`:
```typescript
interface MilestonesTimelineProps {
  milestones: Milestone[];
  compact?: boolean;  // For homepage preview (3-5 items)
}

export function MilestonesTimeline({ milestones, compact = false }: MilestonesTimelineProps) {
  const displayMilestones = compact 
    ? milestones.slice(-5)  // Last 5 for preview
    : milestones;

  return (
    <div className="timeline-container">
      <h2 className="text-2xl font-bold mb-6">Journey Milestones</h2>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        
        {displayMilestones.map((milestone, idx) => (
          <div key={idx} className="milestone-item relative pl-12 pb-8">
            {/* Icon dot */}
            <div className="absolute left-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              {milestone.icon || '📍'}
            </div>
            
            {/* Content */}
            <div className="milestone-content">
              <div className="text-sm text-muted-foreground">
                {formatDate(milestone.date)}
              </div>
              <div className="font-semibold text-lg">
                {milestone.title}
              </div>
              {milestone.description && (
                <div className="text-muted-foreground">
                  {milestone.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {compact && milestones.length > 5 && (
        <Link href="/statistics" className="text-primary">
          View full timeline →
        </Link>
      )}
    </div>
  );
}
```

**5.3 Integration**

**Homepage preview:**
- Show 3-5 most recent milestones
- Link to full timeline

**Statistics page:**
- Full timeline display
- All milestones chronologically

**API route:**
- `/api/milestones/route.ts` - GET computed milestones

---

## Page Structure After Implementation

### Homepage (`/app/page.tsx`)

```
┌──────────────────────────────────────┐
│  ProfileHero                         │
│  - Avatar, nickname, bio, stats      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  FeaturedAchievements (3 cards)      │
│  - Highlighted personal bests        │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  MilestonesTimeline (compact, 3-5)   │
│  - Recent milestones preview         │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  FilterToolbar + Add Achievement     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Achievement List/Table              │
│  - With badge icons                  │
└──────────────────────────────────────┘
```

### Statistics Page (Enhanced)

```
- Overview stats
- Rankings
- Records
- Distance chart
- MilestonesTimeline (full)  ← NEW
```

### New Settings Page (`/app/settings/page.tsx`)

```
Profile Settings
├─ Avatar upload
├─ Nickname input
├─ Bio textarea
├─ Location input
├─ Joined year
├─ Theme color picker (primary only)
│  └─ Preview swatch
└─ Social links
   ├─ Strava URL
   └─ Instagram handle
```

---

## File Changes Summary

### New Files

**Data:**
- `/data/profile.json`
- `/data/badges.json`
- `/public/uploads/` (directory for avatar)
- `/public/badges/custom/` (directory for custom badge icons)

**Components:**
- `/components/profile-hero.tsx`
- `/components/featured-achievements.tsx`
- `/components/featured-card.tsx`
- `/components/badge-icon.tsx`
- `/components/milestones-timeline.tsx`
- `/components/theme-provider.tsx`
- `/components/profile-settings.tsx`
- `/components/avatar-upload.tsx`

**API Routes:**
- `/api/profile/route.ts` (GET, PUT)
- `/api/upload/route.ts` (POST)
- `/api/badges/route.ts` (GET)
- `/api/milestones/route.ts` (GET)

**Library:**
- `/lib/profile.ts`
- `/lib/upload.ts`
- `/lib/badges.ts`
- `/lib/milestones.ts`

**Pages:**
- `/app/settings/page.tsx`

### Modified Files

**Types:**
- `/lib/types.ts` - Add UserProfile, Badge, Milestone, ThemeConfig types, extend Achievement

**Pages:**
- `/app/page.tsx` - Integrate ProfileHero, FeaturedAchievements, MilestonesTimeline preview
- `/app/layout.tsx` - Add ThemeProvider
- `/app/statistics/page.tsx` - Add full MilestonesTimeline

**Components:**
- `/components/achievement-card.tsx` - Add badge display, feature toggle button
- `/components/achievement-table.tsx` - Add badge column
- `/components/achievement-form.tsx` - Add featured checkbox

**Docker:**
- `/Dockerfile` - Ensure `/public/uploads/` directory created, proper permissions

**Package:**
- `/app/package.json` - Add `sharp` dependency

---

## Implementation Order

### Sprint 1: Foundation (Profile + Avatar)
1. Create profile types and data model
2. Implement profile library (`lib/profile.ts`)
3. Install and configure `sharp` for image processing
4. Build avatar upload API (`/api/upload/route.ts`)
5. Create profile API (`/api/profile/route.ts`)
6. Build ProfileHero component
7. Integrate into homepage

**Deliverable:** Profile section with uploaded avatar displayed

### Sprint 2: Theming
1. Create ThemeProvider component
2. Integrate color injection in layout
3. Build settings page UI
4. Add color picker functionality
5. Test theme changes across pages

**Deliverable:** User can pick custom primary color, see theme update

### Sprint 3: Featured Achievements
1. Extend Achievement type with `featured` field
2. Create FeaturedAchievements component
3. Build FeaturedCard with enhanced styling
4. Add toggle feature UI to achievement cards
5. Enforce max 3 featured limit (UI + API validation)

**Deliverable:** Can pin up to 3 achievements as highlights

### Sprint 4: Badges
1. Create badge definitions in `badges.json`
2. Implement badge assignment logic (`lib/badges.ts`)
3. Build BadgeIcon component (support emoji + custom icons)
4. Integrate badge display in cards/table
5. Auto-assign badges on achievement create/update
6. Add custom badge icon upload in settings

**Deliverable:** Achievements show earned badges automatically

### Sprint 5: Milestones Timeline
1. Implement milestone computation (`lib/milestones.ts`)
2. Create MilestonesTimeline component (compact + full modes)
3. Add milestones API route
4. Integrate preview into homepage (3-5 items)
5. Integrate full timeline into statistics page
6. Add custom milestone management in settings

**Deliverable:** Timeline showing key moments in running journey

---

## Dependencies

### New NPM Packages

```json
{
  "dependencies": {
    "sharp": "^0.33.0"  // Image processing (resize, optimize, format conversion)
  }
}
```

**Installation:**
```bash
cd app
npm install sharp
```

**Docker consideration:** `sharp` includes native binaries - ensure Alpine Linux compatibility in Dockerfile

---

## Non-Functional Requirements

### Performance
- Avatar image optimized (<200KB WebP) via `sharp`
- Theme colors injected via CSS vars (no re-render)
- Milestones computed on-demand, cached in API response
- Badge assignment runs only on achievement mutation

### Security
- File upload validation:
  - Type: JPEG, PNG, WebP only
  - Size: max 5MB
  - Malicious content check via `sharp` (fails on corrupt images)
- Auth required for:
  - Profile updates
  - Avatar upload
  - Feature toggle
  - Badge management
- Sanitize user input (nickname, bio) to prevent XSS

### Accessibility
- Avatar has alt text with nickname
- Color picker has keyboard navigation
- Badge tooltips accessible via keyboard
- Timeline semantics (ordered list with proper ARIA)
- Color contrast meets WCAG AA standards

### Mobile Responsiveness
- Profile hero stacks vertically on mobile
- Featured achievements grid: 1 col mobile, 3 col desktop
- Timeline readable on narrow screens
- Settings page forms mobile-friendly
- Avatar upload works on mobile browsers

### Docker Compatibility
- Ensure `/public/uploads/` directory created in Dockerfile
- Set proper permissions for file uploads (nextjs user)
- Volume mount `/public/uploads/` to persist avatars
- Update `.dockerignore` to not exclude uploads
- `sharp` native binaries compatible with Alpine Linux

---

## Testing Checklist

### Manual Tests

**Profile & Avatar:**
- [ ] Upload JPG avatar (works, resized to 512x512 WebP)
- [ ] Upload PNG avatar (works, converted to WebP)
- [ ] Upload oversized image (resized, optimized)
- [ ] Upload non-image file (rejected with error)
- [ ] Upload >5MB file (rejected)
- [ ] Avatar displays in ProfileHero
- [ ] Update nickname (reflects immediately)
- [ ] Update bio (persists after reload)

**Theme:**
- [ ] Change primary color (UI updates)
- [ ] Color persists after reload
- [ ] Color affects buttons, icons, trophy
- [ ] Dark mode respects custom color
- [ ] Contrast remains accessible

**Featured Achievements:**
- [ ] Mark achievement as featured (displays in hero)
- [ ] Unmark featured (removes from hero)
- [ ] Try to feature 4th achievement (blocked with error message)
- [ ] Featured achievements display correctly
- [ ] Featured styling distinct from regular cards

**Badges:**
- [ ] Complete 42km race (earns marathon badge)
- [ ] Top 3 finish (earns podium badge)
- [ ] 10th race earns streak badge
- [ ] Badge displays on achievement card
- [ ] Badge tooltip shows description
- [ ] Custom badge icon upload works
- [ ] Retroactive badge assignment on existing achievements

**Milestones:**
- [ ] First race shows in timeline
- [ ] Personal bests detected correctly
- [ ] Year summaries calculated
- [ ] Custom milestones display
- [ ] Timeline sorted chronologically
- [ ] Homepage preview shows 3-5 recent
- [ ] Statistics page shows full timeline
- [ ] Link from preview to full timeline works

### Edge Cases

- [ ] No profile.json exists (creates default)
- [ ] No avatar uploaded (shows placeholder/initials)
- [ ] No achievements (timeline empty with message)
- [ ] No featured achievements (section hidden)
- [ ] Badge criteria edge cases (exactly 42.195km)
- [ ] Single achievement (milestones still render)
- [ ] Same date milestones (sort correctly)
- [ ] Invalid color in profile.json (falls back to default)

### Integration Tests

- [ ] Avatar upload + immediate display
- [ ] Color change + theme update across all pages
- [ ] Feature achievement + badge display together
- [ ] Delete featured achievement (removes from hero)
- [ ] Achievement create triggers badge assignment
- [ ] Milestone recomputation on achievement change

---

## Migration Path

For existing installations:

### Profile Initialization
- On first load, check if `profile.json` exists
- If not, create default with nickname "Runner"
- Show banner prompting user to customize profile
- Link to settings page

### Achievement Migration
- Existing achievements don't have `featured` or `badges` fields
- Backward compatible (undefined treated as false/empty)
- Run badge assignment retroactively on first API call
- Update all achievements with earned badges

### Docker Volume Setup
Update docker run command in README:
```bash
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/public/uploads \
  -e ADMIN_PASSWORD=your-secure-password \
  --restart unless-stopped \
  --name halloffame \
  halloffame:latest
```

### Data Backup Recommendation
Before upgrading, backup existing data:
```bash
cp -r data data.backup
```

---

## Documentation Updates

### README.md Additions

**Features section add:**
- ✨ Profile customization with avatar upload
- 🎨 Custom color theming
- ⭐ Featured achievements showcase
- 🏅 Achievement badges system (distance milestones, ranking achievements)
- 📅 Personal milestones timeline

**Configuration section:**
```bash
# Profile settings (optional, created on first run)
/data/profile.json

# Badge definitions (optional, defaults provided)
/data/badges.json

# Upload directory (auto-created by app)
/public/uploads/
/public/badges/custom/
```

**Docker Run Command Update:**
```bash
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/public/uploads \
  -e ADMIN_PASSWORD=your-password \
  --restart unless-stopped \
  --name halloffame \
  halloffame:latest
```

**New Settings Page:**
- Access at `/settings`
- Upload avatar (JPEG/PNG, auto-converted to WebP)
- Customize nickname, bio, location
- Pick primary theme color
- Add social links (Strava, Instagram)

---

## Decisions Summary

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Q1: Avatar Upload Security** | **Option B** - Server-side validation + `sharp` processing | Ensures consistent quality, security, and optimal performance with WebP conversion |
| **Q2: Color Theme Scope** | **Option A** - Primary color only | Simpler UX, focused customization, expandable later if needed |
| **Q3: Badge Icons** | **Option C** - Hybrid (emoji + custom upload) | Ship with emoji defaults (simple), allow advanced customization |
| **Q4: Milestones Location** | **Option D** - Preview on homepage + full in statistics | Best of both worlds: visibility without clutter |
| **Q5: Featured Limit** | **Option B** - Hard limit of 3 | Forces meaningful curation, maintains "highlight" significance |

---

## Estimated Effort

**Total:** ~20-30 hours across 5 sprints

**Breakdown:**
- Sprint 1 (Profile + Avatar): 6-8 hours
- Sprint 2 (Theming): 4-5 hours
- Sprint 3 (Featured): 4-5 hours
- Sprint 4 (Badges): 5-7 hours
- Sprint 5 (Milestones): 5-7 hours

**Testing & Polish:** 3-4 hours

**Documentation:** 1-2 hours

---

## Success Criteria

✅ User can upload avatar and see it displayed on homepage

✅ Custom color theme applies throughout app

✅ User can feature up to 3 achievements as highlights

✅ Badges automatically assigned based on achievement criteria

✅ Milestones timeline shows running journey progression

✅ All features work in Docker deployment

✅ Mobile responsive on all new UI

✅ No breaking changes to existing data

---

## Future Enhancements (Out of Scope)

- Multiple color schemes (light/dark variants)
- Advanced badge editor with criteria builder
- Milestone export to PDF/image
- Achievement comparison (year over year)
- Training log integration
- Goal tracking with progress bars
- Social sharing (generate achievement images)
- Multi-user support (family members)

---

## Notes

- All personalization features require authentication
- Default values provided for missing profile data
- Backward compatible with existing installations
- WebP format chosen for optimal performance (80-90% size reduction)
- Timeline computation is read-only (cached, recomputed on achievement change)
- Badge assignment is automatic but can be manually overridden in future enhancement
