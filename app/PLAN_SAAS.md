# Multi-User SaaS Transformation Plan
## NextAuth.js v5 + Google OAuth + JSON Files

---

## Overview

Transform single-user app → multi-user SaaS with:
- **Auth:** NextAuth.js v5 (Google OAuth only)
- **Storage:** Per-user JSON files (`/data/users/{userId}/`)
- **Session:** JWT-based (no database needed)
- **Scale:** Works for ~15 users
- **Public Access:** Achievements viewable by anyone, editing requires sign-in

---

## Phase 1: Install NextAuth.js v5

### 1.1 Install Package

```bash
npm install next-auth@beta
```

### 1.2 Generate Auth Secret

```bash
npx auth secret
```

This creates `AUTH_SECRET` in `.env.local`

### 1.3 Get Google OAuth Credentials

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project (or use existing)
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://halloffame.lepetitmontagnard.org/api/auth/callback/google`
7. Copy Client ID and Client Secret

### 1.4 Environment Variables

**Update `.env.local`:**
```env
# NextAuth.js
AUTH_SECRET=<generated-by-npx-auth-secret>
AUTH_GOOGLE_ID=<your-google-client-id>
AUTH_GOOGLE_SECRET=<your-google-client-secret>

# App Configuration
NEXTAUTH_URL=http://localhost:3000
# For production: NEXTAUTH_URL=https://halloffame.lepetitmontagnard.org

# Optional: Keep for migration script
ADMIN_PASSWORD=changeme123
JWT_SECRET=QvPPSoL/x36C65fuYQ9GnvZf9CdLTGtA4ZxMIv9Cf0Y=
```

---

## Phase 2: Create NextAuth.js Configuration

### 2.1 Create `auth.ts` (root of app directory)

**File:** `app/auth.ts`

```typescript
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  ],
  pages: {
    signIn: '/auth/signin',  // Custom sign-in page
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtectedRoute = nextUrl.pathname.startsWith('/profile')
      
      if (isProtectedRoute && !isLoggedIn) {
        return false
      }
      
      return true
    },
    session({ session, token }) {
      // Add user ID to session
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    }
  }
})
```

### 2.2 Create API Route Handler

**File:** `app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

### 2.3 Update Middleware

**Replace** `middleware.ts`:

```typescript
export { auth as middleware } from "@/auth"

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
```

### 2.4 Create Custom Sign-In Page

**File:** `app/auth/signin/page.tsx`

```typescript
import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign in to Hall of Fame</h1>
        <p className="text-muted-foreground mb-6 text-center">
          Track your running achievements
        </p>
        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/" })
          }}
        >
          <Button type="submit" className="w-full" size="lg">
            Sign in with Google
          </Button>
        </form>
      </div>
    </div>
  )
}
```

### 2.5 Update TypeScript Types

**Add to** `lib/types.ts`:

```typescript
// Add user ID to session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
```

---

## Phase 3: Transform Data Layer (Per-User Storage)

### 3.1 New File Structure

**Current:**
```
/data/
  achievements.json
  profile.json
  badges.json
```

**New:**
```
/data/
  users/
    {googleUserId}/      # e.g., "108234567890123456789"
      achievements.json
      profile.json
  badges.json           # Shared across all users
```

### 3.2 Update `lib/achievements.ts`

**Changes needed:**

**Before (line 6):**
```typescript
const DATA_PATH = path.join(process.cwd(), 'data', 'achievements.json');
```

**After:**
```typescript
function getAchievementsPath(userId: string): string {
  return path.join(process.cwd(), 'data', 'users', userId, 'achievements.json');
}
```

**Function signature changes:**
- `readAchievements()` → `readAchievements(userId: string)`
- `writeAchievements(achievements)` → `writeAchievements(userId: string, achievements)`
- `createAchievement(achievement)` → `createAchievement(userId: string, achievement)`
- `updateAchievement(id, updates)` → `updateAchievement(userId: string, id, updates)`
- `deleteAchievement(id)` → `deleteAchievement(userId: string, id)`
- `getAchievementById(id)` → `getAchievementById(userId: string, id)`

**Update all function bodies to use `getAchievementsPath(userId)` instead of `DATA_PATH`**

### 3.3 Update `lib/profile.ts`

**Changes needed:**

**Before (line 5):**
```typescript
const PROFILE_PATH = path.join(process.cwd(), 'data', 'profile.json');
```

**After:**
```typescript
function getProfilePath(userId: string): string {
  return path.join(process.cwd(), 'data', 'users', userId, 'profile.json');
}
```

**Function signature changes:**
- `readProfile()` → `readProfile(userId: string)`
- `writeProfile(profile)` → `writeProfile(userId: string, profile)`

**Update all function bodies to use `getProfilePath(userId)` instead of `PROFILE_PATH`**

### 3.4 Create User Helper Utility

**New file:** `lib/user-helpers.ts`

```typescript
import { auth } from "@/auth"

/**
 * Get current user ID from server-side auth
 * Use in API routes and Server Components
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

/**
 * Require authenticated user or throw 401
 * Use in API routes that need authentication
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}
```

---

## Phase 4: Update All API Routes

Every API route needs:
1. Extract user ID from session
2. Pass to data functions
3. Return 401 if unauthenticated (for write ops only - reads are public)

### 4.1 Update `app/api/achievements/route.ts`

**Changes:**

**Line 1-3:** Add imports
```typescript
import { NextResponse } from 'next/server';
import { readAchievements, createAchievement } from '@/lib/achievements';
import { getCurrentUserId, requireAuth } from '@/lib/user-helpers';
```

**Line 9-19:** GET handler - make public with userId from query param
```typescript
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // If no userId provided, use current authenticated user
    const finalUserId = userId || await getCurrentUserId();
    
    if (!finalUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const achievements = readAchievements(finalUserId);
    return NextResponse.json({ achievements });
  } catch (error) {
    console.error('GET /api/achievements error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
```

**Line 26-29:** POST handler - require auth
```typescript
export async function POST(request: Request) {
  try {
    const userId = await requireAuth();
    const achievementData = await request.json();
```

**Line 104:** Pass userId to create function
```typescript
    const newAchievement = createAchievement(userId, achievementData as Omit<Achievement, 'id'>);
```

### 4.2 Update `app/api/achievements/[id]/route.ts`

**Similar changes:**
- Import `requireAuth`, `getCurrentUserId`
- GET: allow public read with userId query param
- PUT/DELETE: require auth, use authenticated userId
- Pass `userId` to all data functions

### 4.3 Update `app/api/profile/route.ts`

**Changes:**

**GET handler - make public:**
```typescript
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // If no userId provided, use current authenticated user
    const finalUserId = userId || await getCurrentUserId();
    
    if (!finalUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const profile = readProfile(finalUserId);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile read error:', error);
    return NextResponse.json(
      { error: 'Failed to read profile' },
      { status: 500 }
    );
  }
}
```

**PUT handler - require auth:**
```typescript
export async function PUT(request: Request) {
  try {
    const userId = await requireAuth();
    const profile = await request.json();
    
    // ... validation ...
    
    writeProfile(userId, updatedProfile);
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
```

### 4.4 Update `app/api/statistics/route.ts`

**Make public with userId query param:**
```typescript
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const finalUserId = userId || await getCurrentUserId();
    
    if (!finalUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const achievements = readAchievements(finalUserId);
    // ... rest of statistics calculation ...
```

### 4.5 Update `app/api/milestones/route.ts`

**Make public with userId query param:**
```typescript
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const finalUserId = userId || await getCurrentUserId();
    
    if (!finalUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const achievements = readAchievements(finalUserId);
    const profile = readProfile(finalUserId) || getDefaultProfile();
    // ... rest of milestone calculation ...
```

### 4.6 Update `app/api/upload/route.ts`

**Changes:**
1. Extract userId (require auth)
2. Store uploads in `/public/uploads/{userId}/`
3. Return user-scoped path

**Example structure:**
```typescript
import { requireAuth } from '@/lib/user-helpers';

export async function POST(request: Request) {
  try {
    const userId = await requireAuth();
    
    // Create user-specific upload directory
    const userUploadDir = path.join(process.cwd(), 'public', 'uploads', userId);
    if (!fs.existsSync(userUploadDir)) {
      fs.mkdirSync(userUploadDir, { recursive: true });
    }
    
    // ... file processing ...
    
    // Save file with user prefix
    const fileName = `avatar-${Date.now()}.webp`;
    const filePath = path.join(userUploadDir, fileName);
    
    // ... save file ...
    
    // Return path: /uploads/{userId}/avatar-xxx.webp
    return NextResponse.json({ 
      path: `/uploads/${userId}/${fileName}` 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
```

### 4.7 Delete Old Auth Routes

**Remove these directories:**
- `app/api/auth/login/`
- `app/api/auth/logout/`
- `app/api/auth/status/`

(NextAuth.js handles these at `/api/auth/[...nextauth]`)

---

## Phase 5: Update Client-Side Components

### 5.1 Delete Old Auth Context

**Remove file:** `lib/auth-context.tsx`

### 5.2 Update `app/layout.tsx`

**Changes:**

1. Remove AuthProvider import
2. Add SessionProvider wrapper

```typescript
import { SessionProvider } from "next-auth/react"
// DELETE: import { AuthProvider } from "@/lib/auth-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

### 5.3 Update `app/page.tsx`

**Replace auth import:**
```typescript
// Before:
import { useAuth } from '@/lib/auth-context';

// After:
import { useSession } from 'next-auth/react';
```

**Replace auth hook:**
```typescript
// Before:
const { isAuthenticated, login, logout } = useAuth();

// After:
const { data: session, status } = useSession();
const isAuthenticated = status === 'authenticated';
```

**Remove:**
- `showLoginDialog` state
- `handleLoginSubmit` function
- `<AuthDialog>` component usage

**Update auth buttons (lines ~267-283):**
```typescript
{status === 'loading' ? (
  <Loader2 className="h-4 w-4 animate-spin" />
) : !isAuthenticated ? (
  <Button onClick={() => window.location.href = '/api/auth/signin'} size="lg">
    <Lock className="mr-2 h-4 w-4" />
    Sign In
  </Button>
) : (
  <>
    <Button onClick={() => setShowForm(true)} size="lg">
      <Plus className="h-4 w-4 mr-2" />
      Add Achievement
    </Button>
    <Button variant="outline" size="lg" onClick={() => window.location.href = '/api/auth/signout'}>
      Sign Out
    </Button>
  </>
)}
```

### 5.4 Update `app/profile/page.tsx`

**Same changes as page.tsx:**
- Replace `useAuth` with `useSession`
- Update button handlers
- Remove AuthDialog usage

### 5.5 Delete Auth Dialog Component

**Remove file:** `components/auth-dialog.tsx`

---

## Phase 6: Data Migration for Existing User

### 6.1 Create Migration Script

**File:** `scripts/migrate-to-multi-user.ts`

```typescript
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function migrate() {
  console.log('🔄 Multi-User Migration Script\n');

  // Check if old data exists
  const oldAchievementsPath = path.join(process.cwd(), 'data', 'achievements.json');
  const oldProfilePath = path.join(process.cwd(), 'data', 'profile.json');

  if (!fs.existsSync(oldAchievementsPath)) {
    console.log('❌ No achievements.json found. Nothing to migrate.');
    process.exit(0);
  }

  // Ask for user ID
  console.log('After signing in with Google, check your session data to get your user ID.');
  console.log('You can find it in the NextAuth.js session (session.user.id)\n');
  
  const userId = await question('Enter your Google user ID (or press Enter to use "legacy"): ');
  const finalUserId = userId.trim() || 'legacy';

  // Create user directory
  const userDir = path.join(process.cwd(), 'data', 'users', finalUserId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
    console.log(`✅ Created directory: ${userDir}`);
  }

  // Copy achievements
  const newAchievementsPath = path.join(userDir, 'achievements.json');
  if (fs.existsSync(newAchievementsPath)) {
    console.log('⚠️  achievements.json already exists for this user. Skipping.');
  } else {
    fs.copyFileSync(oldAchievementsPath, newAchievementsPath);
    console.log(`✅ Copied achievements.json`);
  }

  // Copy profile
  const newProfilePath = path.join(userDir, 'profile.json');
  if (fs.existsSync(oldProfilePath)) {
    if (fs.existsSync(newProfilePath)) {
      console.log('⚠️  profile.json already exists for this user. Skipping.');
    } else {
      fs.copyFileSync(oldProfilePath, newProfilePath);
      console.log(`✅ Copied profile.json`);
    }
  }

  // Backup old files
  const backupDir = path.join(process.cwd(), 'data', 'backup-single-user');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  fs.renameSync(oldAchievementsPath, path.join(backupDir, 'achievements.json'));
  console.log(`✅ Backed up old achievements.json to ${backupDir}`);
  
  if (fs.existsSync(oldProfilePath)) {
    fs.renameSync(oldProfilePath, path.join(backupDir, 'profile.json'));
    console.log(`✅ Backed up old profile.json to ${backupDir}`);
  }

  // Migrate uploads
  const oldUploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const newUploadsDir = path.join(process.cwd(), 'public', 'uploads', finalUserId);
  
  if (fs.existsSync(oldUploadsDir) && !fs.existsSync(newUploadsDir)) {
    // Get list of files
    const files = fs.readdirSync(oldUploadsDir).filter(f => f !== finalUserId);
    
    if (files.length > 0) {
      fs.mkdirSync(newUploadsDir, { recursive: true });
      
      for (const file of files) {
        const oldPath = path.join(oldUploadsDir, file);
        const newPath = path.join(newUploadsDir, file);
        
        // Only move files, not directories
        if (fs.statSync(oldPath).isFile()) {
          fs.renameSync(oldPath, newPath);
          console.log(`✅ Moved upload: ${file}`);
        }
      }
      
      // Update profile.json avatar path if exists
      if (fs.existsSync(newProfilePath)) {
        const profile = JSON.parse(fs.readFileSync(newProfilePath, 'utf-8'));
        if (profile.avatarPath) {
          profile.avatarPath = profile.avatarPath.replace('/uploads/', `/uploads/${finalUserId}/`);
          fs.writeFileSync(newProfilePath, JSON.stringify(profile, null, 2));
          console.log(`✅ Updated avatar path in profile`);
        }
      }
    }
  }

  console.log('\n✅ Migration complete!');
  console.log(`\nYour data is now in: /data/users/${finalUserId}/`);
  console.log('Old data backed up to: /data/backup-single-user/\n');

  rl.close();
}

migrate().catch(console.error);
```

### 6.2 Add Script to package.json

**Update** `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "migrate": "tsx scripts/migrate-to-multi-user.ts"
  }
}
```

Install tsx:
```bash
npm install -D tsx
```

---

## Phase 7: Clean Up Old Auth Files

**Files to delete:**

1. `lib/auth-context.tsx`
2. `lib/auth.ts`
3. `lib/jwt.ts`
4. `components/auth-dialog.tsx`
5. `app/api/auth/login/` (entire directory)
6. `app/api/auth/logout/` (entire directory)
7. `app/api/auth/status/` (entire directory)

---

## Phase 8: Testing & Migration Execution

### 8.1 Setup Testing

1. **Get Google OAuth credentials** (see Phase 1.3)
2. **Add to `.env.local`**
3. **Run dev server:** `npm run dev`

### 8.2 Test Auth Flow

- [ ] Visit `http://localhost:3000`
- [ ] Click "Sign In"
- [ ] Redirects to `/auth/signin`
- [ ] Click "Sign in with Google"
- [ ] Google OAuth consent screen appears
- [ ] After consent, redirects back to `/`
- [ ] Signed in (shows "Add Achievement" + "Sign Out" buttons)

### 8.3 Get Your User ID

**In browser console or check session:**
```typescript
// In browser console (after sign in):
fetch('/api/auth/session').then(r => r.json()).then(console.log)
// Look for: { user: { id: "108234567890123456789", ... } }
```

### 8.4 Run Migration

```bash
npm run migrate
```

Enter your user ID when prompted (from step 8.3)

### 8.5 Test CRUD Operations

- [ ] View achievements (should see your migrated data)
- [ ] Create new achievement
- [ ] Edit achievement
- [ ] Delete achievement
- [ ] Update profile
- [ ] Upload avatar

### 8.6 Test Multi-User

- [ ] Sign out
- [ ] Sign in with different Google account
- [ ] Should see empty achievements list (separate user)
- [ ] Create achievement for new user
- [ ] Sign back in as first user
- [ ] Should only see first user's achievements

### 8.7 Test Public Access

- [ ] Open incognito window (not signed in)
- [ ] Visit `http://localhost:3000/?userId={yourUserId}`
- [ ] Should see your achievements (read-only)
- [ ] No edit/delete buttons visible

---

## File Changes Summary

### New Files (7)

1. `auth.ts` - NextAuth.js config
2. `app/api/auth/[...nextauth]/route.ts` - Auth API handler
3. `app/auth/signin/page.tsx` - Custom sign-in page
4. `lib/user-helpers.ts` - User ID extraction utilities
5. `scripts/migrate-to-multi-user.ts` - Data migration script
6. `data/users/{userId}/` - Per-user data directories
7. `PLAN_SAAS.md` - This file

### Modified Files (15)

1. `package.json` - Add next-auth@beta, tsx
2. `.env.local` - Add AUTH_* variables
3. `middleware.ts` - Replace with NextAuth middleware
4. `lib/types.ts` - Add session type extension
5. `lib/achievements.ts` - Add userId parameter to all functions
6. `lib/profile.ts` - Add userId parameter to all functions
7. `app/layout.tsx` - Add SessionProvider
8. `app/page.tsx` - Replace useAuth with useSession
9. `app/profile/page.tsx` - Replace useAuth with useSession
10. `app/api/achievements/route.ts` - Extract userId, pass to functions
11. `app/api/achievements/[id]/route.ts` - Extract userId, pass to functions
12. `app/api/profile/route.ts` - Extract userId, pass to functions
13. `app/api/statistics/route.ts` - Extract userId, pass to functions
14. `app/api/milestones/route.ts` - Extract userId, pass to functions
15. `app/api/upload/route.ts` - User-scoped uploads

### Deleted Files (7)

1. `lib/auth-context.tsx`
2. `lib/auth.ts`
3. `lib/jwt.ts`
4. `components/auth-dialog.tsx`
5. `app/api/auth/login/` (directory)
6. `app/api/auth/logout/` (directory)
7. `app/api/auth/status/` (directory)

---

## Environment Variables Reference

### Development (`.env.local`)

```env
# NextAuth.js
AUTH_SECRET=<run: npx auth secret>
AUTH_GOOGLE_ID=<from Google Cloud Console>
AUTH_GOOGLE_SECRET=<from Google Cloud Console>
NEXTAUTH_URL=http://localhost:3000

# Optional: for migration only
ADMIN_PASSWORD=changeme123
JWT_SECRET=QvPPSoL/x36C65fuYQ9GnvZf9CdLTGtA4ZxMIv9Cf0Y=
```

### Production (Vercel/hosting platform)

```env
# NextAuth.js
AUTH_SECRET=<same as dev or regenerate>
AUTH_GOOGLE_ID=<same as dev>
AUTH_GOOGLE_SECRET=<same as dev>
NEXTAUTH_URL=https://halloffame.lepetitmontagnard.org
```

---

## Deployment Notes

### Google OAuth Setup

**Development:**
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

**Production:**
- Authorized redirect URI: `https://halloffame.lepetitmontagnard.org/api/auth/callback/google`

Add both to Google Cloud Console if testing both environments.

### Vercel Deployment

1. **Environment Variables:**
   - Set `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXTAUTH_URL` in Vercel dashboard
   - Remove `ADMIN_PASSWORD`, `JWT_SECRET` (no longer needed in production)

2. **File System:**
   - JSON files in `/data` persist across deploys on Vercel
   - Uploads in `/public/uploads` persist
   - For better scaling, consider Vercel Blob Storage later

3. **Domain:**
   - Configure custom domain: `halloffame.lepetitmontagnard.org`
   - Update `NEXTAUTH_URL` environment variable

---

## Future Enhancements (Optional)

### Public User Profiles

Create route: `app/users/[userId]/page.tsx` to show public profile and achievements without query params.

**Example:**
- `https://halloffame.lepetitmontagnard.org/users/108234567890123456789`

### User Discovery

Add `/users` page listing all users with their profile info (opt-in).

### Admin Role

Track admin users in profile.json to enable moderation features.

### Database Migration

When scaling beyond 15 users:
1. Choose database (Postgres/MongoDB)
2. Write migration script to export JSON → DB
3. Replace read/write functions with DB queries
4. Keep NextAuth.js (works with any database via adapters)

---

## Support & Troubleshooting

### Common Issues

**"Unauthorized" errors:**
- Check user is signed in: `fetch('/api/auth/session')`
- Verify userId is present in session
- Check middleware.ts is properly configured

**Google OAuth errors:**
- Verify callback URL matches Google Console exactly
- Check `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are correct
- Ensure `NEXTAUTH_URL` matches your domain

**Migration errors:**
- Ensure old data files exist before running migration
- Check file permissions on `/data` directory
- Run migration AFTER first Google sign-in to get correct userId

### Getting Help

- NextAuth.js docs: https://authjs.dev
- Google OAuth setup: https://console.cloud.google.com
- Check session debug: `http://localhost:3000/api/auth/session`

---

## Implementation Checklist

- [ ] Phase 1: Install NextAuth.js v5 and dependencies
- [ ] Phase 2: Create NextAuth.js configuration files
- [ ] Phase 3: Transform data layer (add userId parameters)
- [ ] Phase 4: Update all API routes
- [ ] Phase 5: Update client-side components
- [ ] Phase 6: Create migration script
- [ ] Phase 7: Clean up old auth files
- [ ] Phase 8: Test and run migration
- [ ] Production: Configure Google OAuth with production domain
- [ ] Production: Deploy to Vercel with environment variables

---

## Questions Answered

1. ✅ **Google account ready?** Yes
2. ✅ **Production domain?** halloffame.lepetitmontagnard.org (configurable via `NEXTAUTH_URL`)
3. ✅ **Public vs private?** Achievements viewable by anyone, editing requires sign-in
4. ✅ **Migration timing?** Run after first Google sign-in to get user ID

---

Ready to implement! Follow phases in order for smooth transformation.
