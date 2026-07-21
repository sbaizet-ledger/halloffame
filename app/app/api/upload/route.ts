import { NextResponse } from 'next/server';
import { saveAvatar } from '@/lib/upload';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

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
