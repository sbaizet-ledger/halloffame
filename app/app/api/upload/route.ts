import { NextResponse } from 'next/server';
import { saveAvatar } from '@/lib/upload';
import { verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Verify password
    const password = formData.get('password') as string;
    if (!password || !verifyPassword(password)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get file
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Save and process avatar
    const avatarPath = await saveAvatar(file);

    return NextResponse.json({ avatarPath });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
