import fs from 'fs';
import path from 'path';
import { Achievement, AchievementsData } from './types';
import { assignBadges } from './badges';

/**
 * Get user-specific achievements file path
 */
function getAchievementsPath(userId: string): string {
  return path.join(process.cwd(), 'data', 'users', userId, 'achievements.json');
}

/**
 * Read all achievements from JSON file
 */
export function readAchievements(userId: string): Achievement[] {
  try {
    const dataPath = getAchievementsPath(userId);
    const dataDir = path.dirname(dataPath);
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create file with empty array if doesn't exist
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify({ achievements: [] }, null, 2));
      return [];
    }

    const content = fs.readFileSync(dataPath, 'utf-8');
    const data: AchievementsData = JSON.parse(content);
    return data.achievements || [];
  } catch (error) {
    console.error('Error reading achievements:', error);
    return [];
  }
}

/**
 * Write achievements to JSON file
 */
export function writeAchievements(userId: string, achievements: Achievement[]): void {
  try {
    const dataPath = getAchievementsPath(userId);
    const dataDir = path.dirname(dataPath);
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const data: AchievementsData = { achievements };
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing achievements:', error);
    throw new Error('Failed to write achievements');
  }
}

/**
 * Get achievement by ID
 */
export function getAchievementById(userId: string, id: string): Achievement | null {
  const achievements = readAchievements(userId);
  return achievements.find((a) => a.id === id) || null;
}

/**
 * Create new achievement
 */
export function createAchievement(userId: string, achievement: Omit<Achievement, 'id'>): Achievement {
  const achievements = readAchievements(userId);
  
  const newAchievement: Achievement = {
    ...achievement,
    id: crypto.randomUUID(),
  };

  // Auto-assign badges
  newAchievement.badges = assignBadges(newAchievement, [...achievements, newAchievement]);

  achievements.push(newAchievement);
  writeAchievements(userId, achievements);

  return newAchievement;
}

/**
 * Update existing achievement
 */
export function updateAchievement(userId: string, id: string, updates: Partial<Achievement>): Achievement | null {
  const achievements = readAchievements(userId);
  const index = achievements.findIndex((a) => a.id === id);

  if (index === -1) {
    return null;
  }

  achievements[index] = {
    ...achievements[index],
    ...updates,
    id, // Ensure ID doesn't change
  };

  // Re-assign badges after update
  achievements[index].badges = assignBadges(achievements[index], achievements);

  writeAchievements(userId, achievements);
  return achievements[index];
}

/**
 * Delete achievement by ID
 */
export function deleteAchievement(userId: string, id: string): boolean {
  const achievements = readAchievements(userId);
  const filtered = achievements.filter((a) => a.id !== id);

  if (filtered.length === achievements.length) {
    return false; // ID not found
  }

  writeAchievements(userId, filtered);
  return true;
}
