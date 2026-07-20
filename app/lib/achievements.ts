import fs from 'fs';
import path from 'path';
import { Achievement, AchievementsData } from './types';
import { assignBadges } from './badges';

const DATA_PATH = path.join(process.cwd(), 'data', 'achievements.json');

/**
 * Read all achievements from JSON file
 */
export function readAchievements(): Achievement[] {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create file with empty array if doesn't exist
    if (!fs.existsSync(DATA_PATH)) {
      fs.writeFileSync(DATA_PATH, JSON.stringify({ achievements: [] }, null, 2));
      return [];
    }

    const content = fs.readFileSync(DATA_PATH, 'utf-8');
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
export function writeAchievements(achievements: Achievement[]): void {
  try {
    const dataDir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const data: AchievementsData = { achievements };
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing achievements:', error);
    throw new Error('Failed to write achievements');
  }
}

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | null {
  const achievements = readAchievements();
  return achievements.find((a) => a.id === id) || null;
}

/**
 * Create new achievement
 */
export function createAchievement(achievement: Omit<Achievement, 'id'>): Achievement {
  const achievements = readAchievements();
  
  const newAchievement: Achievement = {
    ...achievement,
    id: crypto.randomUUID(),
  };

  // Auto-assign badges
  newAchievement.badges = assignBadges(newAchievement, [...achievements, newAchievement]);

  achievements.push(newAchievement);
  writeAchievements(achievements);

  return newAchievement;
}

/**
 * Update existing achievement
 */
export function updateAchievement(id: string, updates: Partial<Achievement>): Achievement | null {
  const achievements = readAchievements();
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

  writeAchievements(achievements);
  return achievements[index];
}

/**
 * Delete achievement by ID
 */
export function deleteAchievement(id: string): boolean {
  const achievements = readAchievements();
  const filtered = achievements.filter((a) => a.id !== id);

  if (filtered.length === achievements.length) {
    return false; // ID not found
  }

  writeAchievements(filtered);
  return true;
}
