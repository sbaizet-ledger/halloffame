import { NextResponse } from 'next/server';
import { updateAchievement, deleteAchievement, getAchievementById } from '@/lib/achievements';
import { verifyPassword } from '@/lib/auth';

/**
 * PUT /api/achievements/[id]
 * Update existing achievement (requires auth)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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

    // Check achievement exists
    const existing = getAchievementById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    // Remove password from updates
    const { password: _, ...updates } = body;

    // Validate data types if provided
    if ('name' in updates && (typeof updates.name !== 'string' || !updates.name.trim())) {
      return NextResponse.json({ error: 'Name must be a non-empty string' }, { status: 400 });
    }
    if ('category' in updates && (typeof updates.category !== 'string' || !['Trail', 'Run'].includes(updates.category))) {
      return NextResponse.json({ error: 'Category must be "Trail" or "Run"' }, { status: 400 });
    }
    if ('distance' in updates && (typeof updates.distance !== 'number' || updates.distance <= 0)) {
      return NextResponse.json({ error: 'Distance must be a positive number' }, { status: 400 });
    }
    if ('rankingScratch' in updates && (typeof updates.rankingScratch !== 'number' || updates.rankingScratch <= 0)) {
      return NextResponse.json({ error: 'Scratch ranking must be a positive number' }, { status: 400 });
    }
    if ('rankingCategoryPosition' in updates && (typeof updates.rankingCategoryPosition !== 'number' || updates.rankingCategoryPosition <= 0)) {
      return NextResponse.json({ error: 'Category ranking must be a positive number' }, { status: 400 });
    }

    // Validate URLs if provided
    const urlPattern = /^https?:\/\/.+/;
    if ('eventWebsite' in updates && updates.eventWebsite && !urlPattern.test(updates.eventWebsite)) {
      return NextResponse.json({ error: 'Event website must be a valid URL' }, { status: 400 });
    }
    if ('photoLinks' in updates) {
      if (!Array.isArray(updates.photoLinks)) {
        return NextResponse.json({ error: 'Photo links must be an array' }, { status: 400 });
      }
      for (const link of updates.photoLinks) {
        if (link && !urlPattern.test(link)) {
          return NextResponse.json({ error: 'All photo links must be valid URLs' }, { status: 400 });
        }
      }
    }
    if ('videoLinks' in updates) {
      if (!Array.isArray(updates.videoLinks)) {
        return NextResponse.json({ error: 'Video links must be an array' }, { status: 400 });
      }
      for (const link of updates.videoLinks) {
        if (link && !urlPattern.test(link)) {
          return NextResponse.json({ error: 'All video links must be valid URLs' }, { status: 400 });
        }
      }
    }

    // Update achievement
    const updated = updateAchievement(id, updates);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update achievement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ achievement: updated });
  } catch (error) {
    console.error(`PUT /api/achievements/${id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to update achievement' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/achievements/[id]
 * Delete achievement (requires auth)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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

    // Delete achievement
    const success = deleteAchievement(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/achievements/${id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete achievement' },
      { status: 500 }
    );
  }
}
