import { NextResponse } from 'next/server';
import { readAchievements, createAchievement } from '@/lib/achievements';
import { verifyPassword } from '@/lib/auth';
import { Achievement } from '@/lib/types';

/**
 * GET /api/achievements
 * Return all achievements
 */
export async function GET() {
  try {
    const achievements = readAchievements();
    return NextResponse.json({ achievements });
  } catch (error) {
    console.error('GET /api/achievements error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/achievements
 * Create new achievement (requires auth)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check auth
    const password = body.password;
    if (!password || !verifyPassword(password)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Remove password from data
    const { password: _, ...achievementData } = body;

    // Validate required fields
    const required = ['date', 'category', 'distance', 'name', 'rankingScratch', 'rankingCategory', 'rankingCategoryPosition'];
    for (const field of required) {
      if (!(field in achievementData)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create achievement
    const newAchievement = createAchievement(achievementData as Omit<Achievement, 'id'>);
    
    return NextResponse.json({ achievement: newAchievement }, { status: 201 });
  } catch (error) {
    console.error('POST /api/achievements error:', error);
    return NextResponse.json(
      { error: 'Failed to create achievement' },
      { status: 500 }
    );
  }
}
