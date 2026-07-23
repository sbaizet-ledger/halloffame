import fs from 'fs';
import path from 'path';
import { UserProfile } from './types';

/**
 * Get user-specific profile file path
 */
function getProfilePath(userId: string): string {
  return path.join(process.cwd(), 'data', 'users', userId, 'profile.json');
}

export function getDefaultProfile(): UserProfile {
  return {
    nickname: 'Runner',
    theme: {
      primaryColor: 'oklch(0.65 0.24 45)'
    },
    showQuoteOfTheDay: true
  };
}

export function readProfile(userId: string): UserProfile {
  try {
    const profilePath = getProfilePath(userId);
    const dataDir = path.dirname(profilePath);
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(profilePath)) {
      return getDefaultProfile();
    }

    const data = fs.readFileSync(profilePath, 'utf-8');
    const profile = JSON.parse(data) as UserProfile;
    
    // Ensure theme exists
    if (!profile.theme) {
      profile.theme = getDefaultProfile().theme;
    }
    
    return profile;
  } catch (error) {
    console.error('Error reading profile:', error);
    return getDefaultProfile();
  }
}

export function writeProfile(userId: string, profile: UserProfile): void {
  try {
    const profilePath = getProfilePath(userId);
    const dataDir = path.dirname(profilePath);
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing profile:', error);
    throw new Error('Failed to save profile');
  }
}
