import { NextResponse } from 'next/server';
import { updateAchievement, deleteAchievement, getAchievementById, readAchievements } from '@/lib/achievements';

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
    const updates = await request.json();

    // Check achievement exists
    const existing = getAchievementById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    // Check featured limit (max 3)
    if ('featured' in updates && updates.featured === true && !existing.featured) {
      const allAchievements = readAchievements();
      const currentFeaturedCount = allAchievements.filter(a => a.featured && a.id !== id).length;
      
      if (currentFeaturedCount >= 3) {
        return NextResponse.json(
          { error: 'Maximum 3 featured achievements allowed. Remove one before adding another.' },
          { status: 400 }
        );
      }
    }

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
    if ('denivelePositive' in updates && (typeof updates.denivelePositive !== 'number' || updates.denivelePositive < 0)) {
      return NextResponse.json({ error: 'Denivele+ must be a non-negative number' }, { status: 400 });
    }
    if ('deniveleNegative' in updates && (typeof updates.deniveleNegative !== 'number' || updates.deniveleNegative < 0)) {
      return NextResponse.json({ error: 'Denivele- must be a non-negative number' }, { status: 400 });
    }
    if ('totalParticipants' in updates && (typeof updates.totalParticipants !== 'number' || updates.totalParticipants < 1)) {
      return NextResponse.json({ error: 'Total participants must be at least 1' }, { status: 400 });
    }
    if ('categoryParticipants' in updates) {
      if (typeof updates.categoryParticipants !== 'number' || updates.categoryParticipants < 1) {
        return NextResponse.json({ error: 'Category participants must be at least 1' }, { status: 400 });
      }
      const totalParts = 'totalParticipants' in updates ? updates.totalParticipants : existing.totalParticipants;
      if (totalParts && updates.categoryParticipants > totalParts) {
        return NextResponse.json({ error: 'Category participants cannot exceed total participants' }, { status: 400 });
      }
    }
    if ('rankingScratch' in updates && updates.rankingScratch !== null && (typeof updates.rankingScratch !== 'number' || updates.rankingScratch <= 0)) {
      return NextResponse.json({ error: 'Scratch ranking must be a positive number' }, { status: 400 });
    }
    if ('rankingCategoryPosition' in updates && updates.rankingCategoryPosition !== null && (typeof updates.rankingCategoryPosition !== 'number' || updates.rankingCategoryPosition <= 0)) {
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
