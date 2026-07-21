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
