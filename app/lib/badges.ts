import fs from "fs";
import path from "path";
import type { Badge, BadgesData, Achievement } from "./types";

const BADGES_PATH = path.join(process.cwd(), "data", "badges.json");

/**
 * Read badge definitions from badges.json
 */
export function readBadges(): Badge[] {
  try {
    const fileContents = fs.readFileSync(BADGES_PATH, "utf8");
    const data: BadgesData = JSON.parse(fileContents);
    return data.badges;
  } catch (error) {
    console.error("Error reading badges.json:", error);
    return [];
  }
}

/**
 * Get a specific badge by ID
 */
export function getBadgeById(badgeId: string): Badge | null {
  const badges = readBadges();
  return badges.find((b) => b.id === badgeId) || null;
}

/**
 * Check if an achievement meets badge criteria
 */
function meetsCriteria(
  badge: Badge,
  achievement: Achievement,
  allAchievements: Achievement[]
): boolean {
  const { criteria } = badge;

  switch (criteria.type) {
    case "distance":
      return achievement.distance >= criteria.value;

    case "ranking":
      return (
        achievement.rankingScratch != null &&
        achievement.rankingScratch > 0 &&
        achievement.rankingScratch <= criteria.position
      );

    case "count":
      // Count total races for streak badges
      return allAchievements.length >= criteria.value;

    case "manual":
      // Manual badges need explicit assignment
      return false;

    default:
      return false;
  }
}

/**
 * Assign badges to a single achievement based on criteria
 */
export function assignBadges(
  achievement: Achievement,
  allAchievements: Achievement[]
): string[] {
  const badges: string[] = [];
  const badgeDefinitions = readBadges();

  for (const badge of badgeDefinitions) {
    if (meetsCriteria(badge, achievement, allAchievements)) {
      badges.push(badge.id);
    }
  }

  return badges;
}

/**
 * Assign badges to all achievements (retroactive)
 * Returns updated achievements with badge arrays
 */
export function assignBadgesToAll(
  achievements: Achievement[]
): Achievement[] {
  return achievements.map((achievement) => ({
    ...achievement,
    badges: assignBadges(achievement, achievements),
  }));
}

/**
 * Get unique badges earned across all achievements
 */
export function getUniqueBadges(achievements: Achievement[]): Badge[] {
  const badgeIds = new Set<string>();

  achievements.forEach((achievement) => {
    achievement.badges?.forEach((badgeId) => badgeIds.add(badgeId));
  });

  const allBadges = readBadges();
  return allBadges.filter((badge) => badgeIds.has(badge.id));
}
