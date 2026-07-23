import { NextResponse } from 'next/server';
import { readAchievements, createAchievement } from '@/lib/achievements';
import { getCurrentUserId, requireAuth } from '@/lib/user-helpers';
import { Achievement } from '@/lib/types';

/**
 * GET /api/achievements
 * Return all achievements (public with userId query param)
 */
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

/**
 * POST /api/achievements
 * Create new achievement (requires auth)
 */
export async function POST(request: Request) {
  try {
    const userId = await requireAuth();
    const achievementData = await request.json();

    // Validate required fields
    const required = ['date', 'category', 'distance', 'name'];
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

    // Validate optional fields
    if ('denivelePositive' in achievementData && (typeof achievementData.denivelePositive !== 'number' || achievementData.denivelePositive < 0)) {
      return NextResponse.json({ error: 'Denivele+ must be a non-negative number' }, { status: 400 });
    }
    if ('deniveleNegative' in achievementData && (typeof achievementData.deniveleNegative !== 'number' || achievementData.deniveleNegative < 0)) {
      return NextResponse.json({ error: 'Denivele- must be a non-negative number' }, { status: 400 });
    }
    if ('totalParticipants' in achievementData && (typeof achievementData.totalParticipants !== 'number' || achievementData.totalParticipants < 1)) {
      return NextResponse.json({ error: 'Total participants must be at least 1' }, { status: 400 });
    }
    if ('categoryParticipants' in achievementData) {
      if (typeof achievementData.categoryParticipants !== 'number' || achievementData.categoryParticipants < 1) {
        return NextResponse.json({ error: 'Category participants must be at least 1' }, { status: 400 });
      }
      if ('totalParticipants' in achievementData && achievementData.categoryParticipants > achievementData.totalParticipants) {
        return NextResponse.json({ error: 'Category participants cannot exceed total participants' }, { status: 400 });
      }
    }
    if ('rankingScratch' in achievementData && (typeof achievementData.rankingScratch !== 'number' || achievementData.rankingScratch <= 0)) {
      return NextResponse.json({ error: 'Scratch ranking must be a positive number' }, { status: 400 });
    }
    if ('rankingCategoryPosition' in achievementData && (typeof achievementData.rankingCategoryPosition !== 'number' || achievementData.rankingCategoryPosition <= 0)) {
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
    const newAchievement = createAchievement(userId, achievementData as Omit<Achievement, 'id'>);
    
    return NextResponse.json({ achievement: newAchievement }, { status: 201 });
  } catch (error) {
    console.error('POST /api/achievements error:', error);
    
    // Handle auth errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create achievement' },
      { status: 500 }
    );
  }
}
