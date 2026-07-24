import { NextResponse } from 'next/server';
import { saveAvatar } from '@/lib/upload';
import { requireAuth } from '@/lib/user-helpers';

export async function POST(request: Request) {
  try {
    const userId = await requireAuth();
    const formData = await request.formData();

    // Get file
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Save and process avatar (user-scoped)
    const avatarPath = await saveAvatar(userId, file);

    return NextResponse.json({ avatarPath });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle auth errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
