import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function migrate() {
  console.log('🔄 Multi-User Migration Script\n');

  // Check if old data exists
  const oldAchievementsPath = path.join(process.cwd(), 'data', 'achievements.json');
  const oldProfilePath = path.join(process.cwd(), 'data', 'profile.json');

  if (!fs.existsSync(oldAchievementsPath)) {
    console.log('❌ No achievements.json found. Nothing to migrate.');
    console.log('   This is normal if you already migrated or are a new user.');
    process.exit(0);
  }

  console.log('✅ Found existing single-user data\n');

  // Ask for user ID
  console.log('After signing in with Google, you need your Google user ID.');
  console.log('To find it:');
  console.log('  1. Sign in to the app');
  console.log('  2. Open browser console (F12)');
  console.log('  3. Run: fetch("/api/auth/session").then(r => r.json()).then(console.log)');
  console.log('  4. Look for "user.id" in the output\n');
  
  const userId = await question('Enter your Google user ID (or press Enter to use "legacy"): ');
  const finalUserId = userId.trim() || 'legacy';

  console.log(`\nUsing userId: ${finalUserId}\n`);

  // Create user directory
  const userDir = path.join(process.cwd(), 'data', 'users', finalUserId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
    console.log(`✅ Created directory: ${userDir}`);
  }

  // Copy achievements
  const newAchievementsPath = path.join(userDir, 'achievements.json');
  if (fs.existsSync(newAchievementsPath)) {
    console.log('⚠️  achievements.json already exists for this user. Skipping.');
  } else {
    fs.copyFileSync(oldAchievementsPath, newAchievementsPath);
    console.log(`✅ Copied achievements.json`);
  }

  // Copy profile
  const newProfilePath = path.join(userDir, 'profile.json');
  if (fs.existsSync(oldProfilePath)) {
    if (fs.existsSync(newProfilePath)) {
      console.log('⚠️  profile.json already exists for this user. Skipping.');
    } else {
      fs.copyFileSync(oldProfilePath, newProfilePath);
      console.log(`✅ Copied profile.json`);
    }
  }

  // Backup old files
  const backupDir = path.join(process.cwd(), 'data', 'backup-single-user');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  fs.renameSync(oldAchievementsPath, path.join(backupDir, 'achievements.json'));
  console.log(`✅ Backed up old achievements.json to ${backupDir}`);
  
  if (fs.existsSync(oldProfilePath)) {
    fs.renameSync(oldProfilePath, path.join(backupDir, 'profile.json'));
    console.log(`✅ Backed up old profile.json to ${backupDir}`);
  }

  // Migrate uploads
  const oldUploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const newUploadsDir = path.join(process.cwd(), 'public', 'uploads', finalUserId);
  
  if (fs.existsSync(oldUploadsDir) && !fs.existsSync(newUploadsDir)) {
    // Get list of files
    const files = fs.readdirSync(oldUploadsDir).filter(f => {
      const fullPath = path.join(oldUploadsDir, f);
      return fs.statSync(fullPath).isFile();
    });
    
    if (files.length > 0) {
      fs.mkdirSync(newUploadsDir, { recursive: true });
      
      for (const file of files) {
        const oldPath = path.join(oldUploadsDir, file);
        const newPath = path.join(newUploadsDir, file);
        
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Moved upload: ${file}`);
      }
      
      // Update profile.json avatar path if exists
      if (fs.existsSync(newProfilePath)) {
        const profile = JSON.parse(fs.readFileSync(newProfilePath, 'utf-8'));
        if (profile.avatarPath && !profile.avatarPath.includes(finalUserId)) {
          profile.avatarPath = profile.avatarPath.replace('/uploads/', `/uploads/${finalUserId}/`);
          fs.writeFileSync(newProfilePath, JSON.stringify(profile, null, 2));
          console.log(`✅ Updated avatar path in profile`);
        }
      }
    }
  }

  console.log('\n✅ Migration complete!');
  console.log(`\nYour data is now in: /data/users/${finalUserId}/`);
  console.log('Old data backed up to: /data/backup-single-user/\n');
  console.log('Next steps:');
  console.log('  1. Sign in with Google');
  console.log('  2. Your achievements should appear automatically\n');

  rl.close();
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  rl.close();
  process.exit(1);
});
