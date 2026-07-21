# Authentication System Migration Plan

## Overview

Migrate from per-action password prompts to session-based JWT authentication with httpOnly cookies.

**Current:** User enters password for every create/update/delete action  
**Target:** User logs in once, authenticated for 24 hours

---

## Architecture

### Security Features
- httpOnly cookies → XSS protection
- Secure flag → HTTPS only (production)
- SameSite=Strict → CSRF protection
- JWT secret from env var → rotation possible
- 24h expiry → limited exposure window
- Middleware validation → centralized auth

### Auth Flow

**Initial Login:**
1. User clicks "Login" button
2. Enters admin password in dialog
3. POST `/api/auth/login` with `{ password }`
4. Server validates via `verifyPassword()` (existing function)
5. Server signs JWT, sets httpOnly cookie (24h expiry)
6. Client stores auth state in React context
7. UI shows admin features (Add/Edit/Delete)

**Subsequent Actions:**
8. User performs action (e.g., add achievement)
9. Browser automatically sends cookie with request
10. Middleware validates JWT before route executes
11. If valid: request proceeds
12. If invalid/expired: returns 401

**Session Persistence:**
13. User refreshes page or reopens browser
14. Client calls `/api/auth/status` on mount
15. Server checks JWT cookie validity
16. Returns `{ authenticated: true/false }`
17. Client restores auth state

**Logout:**
18. User clicks "Logout"
19. POST `/api/auth/logout`
20. Server clears cookie (max-age=0)
21. Client clears auth state
22. UI hides admin features

---

## Implementation Details

### JWT Configuration

**Library:** `jose` (Edge Runtime compatible, no Node.js dependencies)

**Token Payload:**
```typescript
{
  authenticated: true,
  iat: timestamp,
  exp: timestamp + 24h
}
```

**Cookie Config:**
```typescript
{
  name: 'auth-token',
  value: signedJWT,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24, // 24 hours
  path: '/'
}
```

### Protected Routes

**Require JWT (POST/PUT/DELETE only):**
- `/api/achievements`
- `/api/achievements/[id]`
- `/api/profile`
- `/api/upload`
- `/api/milestones`

**Public (GET requests + auth endpoints):**
- All GET requests (viewing remains public)
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/status`

---

## Files to Create

### 1. `app/lib/jwt.ts` - JWT utilities

```typescript
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const JWT_EXPIRY = '24h';

export async function signAuthToken(): Promise<string> {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(secret);
}

export async function verifyAuthToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}
```

**Purpose:** Sign and verify JWT tokens using Web Crypto API

---

### 2. `app/middleware.ts` - Route protection

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken } from '@/lib/jwt';

const PROTECTED_ROUTES = [
  '/api/achievements',
  '/api/profile',
  '/api/upload',
  '/api/milestones'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route needs protection
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isWriteOperation = ['POST', 'PUT', 'DELETE'].includes(request.method);
  
  if (!isProtected || !isWriteOperation) {
    return NextResponse.next();
  }
  
  // Verify JWT from cookie
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

**Purpose:** Intercept API requests, validate JWT before reaching route handlers

---

### 3. `app/app/api/auth/login/route.ts` - Login endpoint

```typescript
import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';
import { signAuthToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    if (!password || !verifyPassword(password)) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
    
    const token = await signAuthToken();
    
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
```

**Purpose:** Validate password, issue JWT cookie

---

### 4. `app/app/api/auth/logout/route.ts` - Logout endpoint

```typescript
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  
  return response;
}
```

**Purpose:** Clear authentication cookie

---

### 5. `app/app/api/auth/status/route.ts` - Check auth status

```typescript
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuthToken } from '@/lib/jwt';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }
  
  const isValid = await verifyAuthToken(token);
  return NextResponse.json({ authenticated: isValid });
}
```

**Purpose:** Check if current session is valid (used on page load)

---

### 6. `app/lib/auth-context.tsx` - Client auth state management

```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }

    setIsAuthenticated(true);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Purpose:** React context for auth state, provides hooks for login/logout

---

## Files to Modify

### 7. `app/lib/auth.ts` - Add comment

**Current:**
```typescript
/**
 * Verify admin password
 */
export function verifyPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}
```

**Updated:**
```typescript
/**
 * Verify admin password
 * Used only for initial login - JWT authentication used for subsequent requests
 */
export function verifyPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}
```

**Changes:** Clarify usage (login only, not per-request)

---

### 8. `app/app/layout.tsx` - Add AuthProvider

**Add import:**
```typescript
import { AuthProvider } from '@/lib/auth-context';
```

**Wrap children:**
```typescript
<AuthProvider>
  {children}
</AuthProvider>
```

**Purpose:** Make auth context available to entire app

---

### 9. API Routes - Remove password validation

**Files:**
- `app/app/api/achievements/route.ts` (POST)
- `app/app/api/achievements/[id]/route.ts` (PUT, DELETE)
- `app/app/api/profile/route.ts` (POST/PUT)
- `app/app/api/upload/route.ts` (POST)

**Changes for each:**
1. **Remove** `import { verifyPassword } from '@/lib/auth';`
2. **Remove** password extraction: `const password = body.password;`
3. **Remove** auth check block:
   ```typescript
   if (!password || !verifyPassword(password)) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```
4. **Remove** password from destructuring: `const { password: _, ...data } = body;`

**Reason:** Middleware now handles authentication before route executes

**Example - Before:**
```typescript
export async function POST(request: Request) {
  const body = await request.json();
  const password = body.password;
  
  if (!password || !verifyPassword(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { password: _, ...data } = body;
  // ... business logic
}
```

**Example - After:**
```typescript
export async function POST(request: Request) {
  const data = await request.json();
  // ... business logic (auth already validated by middleware)
}
```

---

### 10. `app/app/page.tsx` - Update auth flow

**Add imports:**
```typescript
import { useAuth } from '@/lib/auth-context';
import { Lock } from 'lucide-react';
```

**Replace auth state:**
```typescript
// REMOVE these:
const [showAuth, setShowAuth] = useState(false);
const [pendingAction, setPendingAction] = useState<((password: string) => Promise<void>) | null>(null);

const requireAuth = (action: (password: string) => Promise<void>) => {
  setPendingAction(() => action);
  setShowAuth(true);
};

const handleAuthSubmit = async (password: string) => {
  if (!pendingAction) return;
  try {
    await pendingAction(password);
    setShowAuth(false);
    setPendingAction(null);
  } catch (err) {
    throw err;
  }
};

// ADD these:
const { isAuthenticated, login, logout } = useAuth();
const [showLoginDialog, setShowLoginDialog] = useState(false);

const handleLoginSubmit = async (password: string) => {
  await login(password);
  setShowLoginDialog(false);
};
```

**Update CRUD handlers:**
```typescript
// BEFORE:
const handleCreate = async (data: Omit<Achievement, 'id'>) => {
  requireAuth(async (password) => {
    const res = await fetch('/api/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, password }),
    });
    // ... rest
  });
};

// AFTER:
const handleCreate = async (data: Omit<Achievement, 'id'>) => {
  const res = await fetch('/api/achievements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data), // No password field
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create achievement');
  }
  
  await fetchAchievements();
  await fetchMilestones();
};
```

**Update UI:**
```typescript
// Add login/logout buttons
{!isAuthenticated ? (
  <Button onClick={() => setShowLoginDialog(true)}>
    <Lock className="mr-2 h-4 w-4" />
    Admin Login
  </Button>
) : (
  <>
    <Button onClick={() => setShowForm(true)}>
      <Plus className="mr-2 h-4 w-4" />
      Add Achievement
    </Button>
    <Button variant="outline" onClick={logout}>
      Logout
    </Button>
  </>
)}

// Update AuthDialog usage
<AuthDialog
  open={showLoginDialog}
  onClose={() => setShowLoginDialog(false)}
  onSubmit={handleLoginSubmit}
/>
```

**Conditional features:**
- Show "Add Achievement" only if `isAuthenticated`
- Pass `isAuthenticated` to child components
- Hide Edit/Delete buttons when not authenticated

---

### 11. `app/app/profile/page.tsx` - Same changes as page.tsx

Apply identical changes:
- Import `useAuth`
- Replace auth state management
- Simplify API calls (no password)
- Add login/logout UI
- Conditional admin features

---

### 12. `app/components/achievement-table.tsx` - Conditional actions

**Add prop:**
```typescript
interface Props {
  // ... existing props
  isAuthenticated?: boolean;
}
```

**Conditionally render actions:**
```typescript
{isAuthenticated && (
  <TableCell>
    <Button onClick={() => onEdit(achievement)}>Edit</Button>
    <Button onClick={() => onDelete(achievement.id)}>Delete</Button>
  </TableCell>
)}
```

---

### 13. `app/components/achievement-card.tsx` - Conditional actions

Same as achievement-table:
- Add `isAuthenticated` prop
- Hide Edit/Delete buttons when `!isAuthenticated`

---

### 14. `app/components/auth-dialog.tsx` - Update messaging

**Changes:**
```typescript
// Update title
<DialogTitle className="flex items-center gap-2">
  <Lock className="h-5 w-5" />
  Admin Login  {/* Changed from "Admin Authentication" */}
</DialogTitle>

// Update description
<DialogDescription>
  Enter the admin password to manage achievements.  
  {/* Changed from "...to continue with this action" */}
</DialogDescription>
```

**Purpose:** Clarify this is login, not per-action auth

---

### 15. Environment Configuration

**File:** `app/.env.local`

**Add:**
```bash
JWT_SECRET=your_random_64_character_secret_here
```

**Generate secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Example output:**
```
Z3x7K9mP2vQ8wE5tY6uI1oL4nM3jH0gF7dS9aR2cX8bV5kW1pN4qT6yU3hG0e=
```

**Complete .env.local:**
```bash
ADMIN_PASSWORD=your_existing_password
JWT_SECRET=Z3x7K9mP2vQ8wE5tY6uI1oL4nM3jH0gF7dS9aR2cX8bV5kW1pN4qT6yU3hG0e=
```

---

### 16. Documentation

**File:** `app/README.md`

**Add section:**
```markdown
## Authentication Setup

This application uses JWT-based session authentication with httpOnly cookies.

### Initial Setup

1. **Generate a secure JWT secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. **Configure environment variables:**
   
   Create `app/.env.local`:
   ```bash
   ADMIN_PASSWORD=your_admin_password
   JWT_SECRET=<paste_generated_secret_from_step_1>
   ```

3. **Security notes:**
   - Never commit `.env.local` to version control
   - Each deployment should use a unique `JWT_SECRET`
   - Regenerate secret if compromised

### How It Works

- **Login:** Enter admin password once
- **Session:** Valid for 24 hours
- **Persistence:** Session survives page refresh
- **Logout:** Manual logout or automatic after 24h

### For Open Source Users

When deploying your own instance:
1. Generate your own `JWT_SECRET` (never use example values)
2. Set your own `ADMIN_PASSWORD`
3. Keep `.env.local` private and secure
```

---

## Dependencies

**Add to `package.json`:**
```bash
npm install jose
```

**Package:** `jose` v5.x  
**Purpose:** JWT signing/verification for Edge Runtime  
**Size:** ~20KB gzipped  
**Why not `jsonwebtoken`?** Requires Node.js runtime (incompatible with Next.js middleware Edge Runtime)

---

## Testing Checklist

### Login Flow
- [ ] Visit site → see "Login" button
- [ ] Click login → dialog opens
- [ ] Enter wrong password → see error message
- [ ] Enter correct password → logged in successfully
- [ ] Dialog closes, see logout button
- [ ] Admin features visible (Add/Edit/Delete)

### Authenticated Actions
- [ ] Add achievement → no password prompt, works immediately
- [ ] Edit achievement → no password prompt, works immediately
- [ ] Delete achievement → no password prompt, works immediately
- [ ] Upload avatar → no password prompt, works immediately
- [ ] Update profile → no password prompt, works immediately

### Session Persistence
- [ ] Refresh page → still logged in
- [ ] Close tab, reopen site → still logged in (within 24h)
- [ ] Open in new tab → automatically logged in (same cookie)
- [ ] Wait 24h → session expired, shows login again

### Logout
- [ ] Click logout → admin features hidden
- [ ] Login button reappears
- [ ] Try admin action → blocked (401)
- [ ] Login again → works

### Security Tests
- [ ] Inspect cookies → `auth-token` present
- [ ] Cookie has `httpOnly` flag
- [ ] Cookie has `secure` flag (production only)
- [ ] Cookie has `sameSite=strict`
- [ ] Try API call without cookie → returns 401
- [ ] Try API call with expired JWT → returns 401
- [ ] Try API call with invalid JWT → returns 401
- [ ] XSS attempt to read cookie → fails (httpOnly protection)

### Error Handling
- [ ] Missing `JWT_SECRET` → clear error on login
- [ ] Network error during login → shows error message
- [ ] API returns 401 → client handles gracefully
- [ ] Concurrent logout in multiple tabs → all tabs update

### Cross-Browser
- [ ] Chrome → works
- [ ] Firefox → works
- [ ] Safari → works
- [ ] Edge → works

---

## Migration Steps

### Phase 1: Setup (5 minutes)
1. Install `jose`: `cd app && npm install jose`
2. Generate JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
3. Add to `app/.env.local`: `JWT_SECRET=<generated_secret>`

### Phase 2: Infrastructure (15 minutes)
4. Create `app/lib/jwt.ts`
5. Create `app/middleware.ts`
6. Create `app/app/api/auth/login/route.ts`
7. Create `app/app/api/auth/logout/route.ts`
8. Create `app/app/api/auth/status/route.ts`
9. Create `app/lib/auth-context.tsx`

### Phase 3: API Updates (10 minutes)
10. Update `app/lib/auth.ts` (add comment)
11. Update `app/app/api/achievements/route.ts` (remove password validation)
12. Update `app/app/api/achievements/[id]/route.ts` (remove password validation)
13. Update `app/app/api/profile/route.ts` (remove password validation)
14. Update `app/app/api/upload/route.ts` (remove password validation)

### Phase 4: Client Updates (20 minutes)
15. Update `app/app/layout.tsx` (add AuthProvider)
16. Update `app/app/page.tsx` (new auth flow)
17. Update `app/app/profile/page.tsx` (new auth flow)
18. Update `app/components/achievement-table.tsx` (conditional actions)
19. Update `app/components/achievement-card.tsx` (conditional actions)
20. Update `app/components/auth-dialog.tsx` (update messaging)

### Phase 5: Documentation (5 minutes)
21. Update `app/README.md` (add auth setup instructions)
22. Update `.gitignore` (ensure `.env.local` excluded)

### Phase 6: Testing (15 minutes)
23. Run dev server: `npm run dev`
24. Test login flow
25. Test authenticated actions
26. Test session persistence
27. Test logout
28. Test security (inspect cookies, try unauthorized calls)

**Total estimated time:** ~70 minutes

---

## Rollback Plan

If issues arise, rollback is straightforward:

1. **Revert new files:** Delete auth routes, middleware, jwt.ts, auth-context.tsx
2. **Revert API routes:** Restore password validation in achievements/profile/upload routes
3. **Revert client pages:** Restore per-action auth flow with `requireAuth()`
4. **Remove dependency:** `npm uninstall jose`
5. **Git revert:** `git revert <commit-hash>` or restore from backup

**Data safety:** No database schema changes, only code changes. Data remains intact.

---

## Security Considerations

### Strengths
✓ httpOnly cookies prevent XSS theft  
✓ SameSite=Strict prevents CSRF  
✓ JWT expiry limits exposure window  
✓ Middleware centralization prevents bypass  
✓ Secure flag enforces HTTPS (production)  
✓ No password storage client-side  

### Limitations
⚠ Single admin password (no user management)  
⚠ JWT stateless (can't revoke before expiry without blacklist)  
⚠ Client logout only clears local cookie (other devices unaffected)  
⚠ JWT secret rotation requires all users to re-login  

### Future Enhancements
- Add user management (multiple admins)
- Implement refresh tokens (extend sessions securely)
- Add token blacklist for instant revocation
- Add rate limiting on login endpoint
- Add 2FA/TOTP support
- Add audit logging for admin actions

---

## Architecture Decisions

### Why JWT over sessions?
- **Stateless:** No server-side session storage needed
- **Scalable:** Works in serverless/Edge environments
- **Simple:** No database/Redis dependency
- **Standard:** Well-understood, widely supported

### Why httpOnly cookies over localStorage?
- **Security:** XSS can't steal httpOnly cookies
- **Automatic:** Browser sends with every request
- **Standard:** Built-in CSRF protection with SameSite

### Why middleware over per-route checks?
- **DRY:** Single source of truth for auth
- **Secure:** Can't forget to add auth check
- **Maintainable:** Easy to update auth logic globally
- **Performance:** Validated before route handler executes

### Why 24h expiry?
- **Balance:** Security (limited window) vs UX (not too frequent)
- **Standard:** Common session duration
- **Flexible:** Easy to adjust in jwt.ts constant

---

## Questions & Answers

**Q: What if user forgets to logout on shared computer?**  
A: Session expires after 24h. For sensitive environments, recommend shorter expiry (e.g., 1h) or add "Remember Me" checkbox.

**Q: Can multiple people use same admin password?**  
A: Yes, but can't distinguish who did what. For multi-admin, need user management system.

**Q: What if JWT_SECRET is compromised?**  
A: Rotate immediately. All users forced to re-login. No persistent damage (JWTs expire in 24h max).

**Q: Can I extend session without re-login?**  
A: Not in current plan (24h hard limit). Could add sliding window or refresh tokens.

**Q: Does this work with Docker/serverless?**  
A: Yes. JWT stateless = no shared session store needed. Each instance validates independently.

**Q: What about rate limiting on login?**  
A: Not included. For production, add rate limiter middleware (e.g., `express-rate-limit` or Vercel Edge Config).

**Q: Can I customize session duration?**  
A: Yes. Change `JWT_EXPIRY = '24h'` in `app/lib/jwt.ts` and cookie `maxAge` in login route.

---

## Success Criteria

Implementation successful when:
✓ User enters password once per 24h (vs every action)  
✓ Session survives page refresh/browser reopen  
✓ All admin actions work without password prompt  
✓ Logout immediately revokes access  
✓ Unauthorized API calls return 401  
✓ Cookies have security flags (httpOnly, secure, sameSite)  
✓ No breaking changes to existing data/functionality  
✓ Clear setup docs for open-source users  

---

## File Summary

**New files (6):**
1. `app/lib/jwt.ts` - JWT signing/verification
2. `app/middleware.ts` - Route protection
3. `app/app/api/auth/login/route.ts` - Login endpoint
4. `app/app/api/auth/logout/route.ts` - Logout endpoint
5. `app/app/api/auth/status/route.ts` - Auth status check
6. `app/lib/auth-context.tsx` - Client auth state

**Modified files (13):**
1. `app/lib/auth.ts` - Add clarifying comment
2. `app/app/layout.tsx` - Wrap in AuthProvider
3. `app/app/page.tsx` - New auth flow
4. `app/app/profile/page.tsx` - New auth flow
5. `app/app/api/achievements/route.ts` - Remove password validation
6. `app/app/api/achievements/[id]/route.ts` - Remove password validation
7. `app/app/api/profile/route.ts` - Remove password validation
8. `app/app/api/upload/route.ts` - Remove password validation
9. `app/components/achievement-table.tsx` - Conditional actions
10. `app/components/achievement-card.tsx` - Conditional actions
11. `app/components/auth-dialog.tsx` - Update messaging
12. `app/.env.local` - Add JWT_SECRET
13. `app/README.md` - Document setup

**Dependencies:**
- Add: `jose` (JWT library, ~20KB)

**Estimated LOC:**
- Added: ~300 lines
- Modified: ~150 lines
- Removed: ~100 lines
- Net: ~350 lines

---

## Next Steps

1. Review this plan for any concerns
2. Run implementation phases 1-6
3. Test against checklist
4. Update documentation
5. Commit changes with descriptive message
6. Deploy to production

**Ready to proceed with implementation?**
