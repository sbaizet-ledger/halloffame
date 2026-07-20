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
