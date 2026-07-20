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

    // Validate data types
    if (typeof achievementData.name !== 'string' || !achievementData.name.trim()) {
      return NextResponse.json({ error: 'Name must be a non-empty string' }, { status: 400 });
    }
    if (typeof achievementData.category !== 'string' || !['Trail', 'Run'].includes(achievementData.category)) {
      return NextResponse.json({ error: 'Category must be "Trail" or "Run"' }, { status: 400 });
    }
    if (typeof achievementData.distance !== 'number' || achievementData.distance <= 0) {
      return NextResponse.json({ error: 'Distance must be a positive number' }, { status: 400 });
    }
    if (typeof achievementData.rankingScratch !== 'number' || achievementData.rankingScratch <= 0) {
      return NextResponse.json({ error: 'Scratch ranking must be a positive number' }, { status: 400 });
    }
    if (typeof achievementData.rankingCategoryPosition !== 'number' || achievementData.rankingCategoryPosition <= 0) {
      return NextResponse.json({ error: 'Category ranking must be a positive number' }, { status: 400 });
    }

    // Validate URLs if provided
    const urlPattern = /^https?:\/\/.+/;
    if (achievementData.eventWebsite && !urlPattern.test(achievementData.eventWebsite)) {
      return NextResponse.json({ error: 'Event website must be a valid URL' }, { status: 400 });
    }
    if (achievementData.photoLinks) {
      if (!Array.isArray(achievementData.photoLinks)) {
        return NextResponse.json({ error: 'Photo links must be an array' }, { status: 400 });
      }
      for (const link of achievementData.photoLinks) {
        if (link && !urlPattern.test(link)) {
          return NextResponse.json({ error: 'All photo links must be valid URLs' }, { status: 400 });
        }
      }
    }
    if (achievementData.videoLinks) {
      if (!Array.isArray(achievementData.videoLinks)) {
        return NextResponse.json({ error: 'Video links must be an array' }, { status: 400 });
      }
      for (const link of achievementData.videoLinks) {
        if (link && !urlPattern.test(link)) {
          return NextResponse.json({ error: 'All video links must be valid URLs' }, { status: 400 });
        }
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
