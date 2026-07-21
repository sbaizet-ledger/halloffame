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
