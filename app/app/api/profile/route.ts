import { NextResponse } from 'next/server';
import { readProfile, writeProfile } from '@/lib/profile';
import { verifyPassword } from '@/lib/auth';
import { UserProfile } from '@/lib/types';

export async function GET() {
  try {
    const profile = readProfile();
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile read error:', error);
    return NextResponse.json(
      { error: 'Failed to read profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { password, profile } = body;

    // Verify password
    if (!password || !verifyPassword(password)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate profile data
    if (!profile || typeof profile !== 'object') {
      return NextResponse.json(
        { error: 'Invalid profile data' },
        { status: 400 }
      );
    }

    // Ensure required fields
    const updatedProfile: UserProfile = {
      ...profile,
      nickname: profile.nickname || 'Runner',
      theme: profile.theme || { primaryColor: 'oklch(0.65 0.24 45)' }
    };

    writeProfile(updatedProfile);

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
