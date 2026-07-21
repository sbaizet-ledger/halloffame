import { NextResponse } from 'next/server';
import { readProfile, writeProfile } from '@/lib/profile';
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
    const profile = await request.json();

    // Validate profile data
    if (!profile || typeof profile !== 'object') {
      return NextResponse.json(
        { error: 'Invalid profile data' },
        { status: 400 }
      );
    }

    // Validate gender if provided
    if (profile.gender && !['H', 'F'].includes(profile.gender)) {
      return NextResponse.json(
        { error: 'Gender must be H or F' },
        { status: 400 }
      );
    }

    // Validate birthday format if provided
    if (profile.birthday) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(profile.birthday)) {
        return NextResponse.json(
          { error: 'Birthday must be in YYYY-MM-DD format' },
          { status: 400 }
        );
      }
      // Check if valid date
      const date = new Date(profile.birthday);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Invalid birthday date' },
          { status: 400 }
        );
      }
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
