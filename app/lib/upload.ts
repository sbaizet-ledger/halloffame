import { writeFile, mkdir } from 'fs/promises';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function saveAvatar(file: File): Promise<string> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large (max 5MB)');
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
  }

  // Ensure upload directory exists
  if (!fs.existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  // Read file buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Process image with sharp
  try {
    const processedBuffer = await sharp(buffer)
      .resize(512, 512, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toBuffer();

    // Generate filename
    const filename = `avatar-${Date.now()}.webp`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Save to disk
    await writeFile(filepath, processedBuffer);

    // Return public path
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
}
