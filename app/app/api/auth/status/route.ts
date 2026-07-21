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
