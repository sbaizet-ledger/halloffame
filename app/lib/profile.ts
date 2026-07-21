import fs from 'fs';
import path from 'path';
import { UserProfile } from './types';

const PROFILE_PATH = path.join(process.cwd(), 'data', 'profile.json');

export function getDefaultProfile(): UserProfile {
  return {
    nickname: 'Runner',
    theme: {
      primaryColor: 'oklch(0.65 0.24 45)'
    },
    showQuoteOfTheDay: true
  };
}

export function readProfile(): UserProfile {
  try {
    if (!fs.existsSync(PROFILE_PATH)) {
      return getDefaultProfile();
    }

    const data = fs.readFileSync(PROFILE_PATH, 'utf-8');
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

export function writeProfile(profile: UserProfile): void {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(PROFILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing profile:', error);
    throw new Error('Failed to save profile');
  }
}
