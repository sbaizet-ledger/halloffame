/**
 * Retroactive badge assignment script
 * Run with: npx tsx scripts/assign-badges.ts
 */

import { readAchievements, writeAchievements } from '../lib/achievements';
import { assignBadgesToAll } from '../lib/badges';

console.log('🏅 Starting badge assignment...\n');

// Read all achievements
const achievements = readAchievements();
console.log(`Found ${achievements.length} achievements\n`);

// Assign badges
const withBadges = assignBadgesToAll(achievements);

// Show what changed
let totalBadges = 0;
withBadges.forEach(achievement => {
  if (achievement.badges && achievement.badges.length > 0) {
    console.log(`✅ ${achievement.name}`);
    console.log(`   Badges: ${achievement.badges.join(', ')}`);
    totalBadges += achievement.badges.length;
  }
});

console.log(`\n🎯 Assigned ${totalBadges} badges across ${withBadges.filter(a => a.badges && a.badges.length > 0).length} achievements\n`);

// Write back
writeAchievements(withBadges);
console.log('✅ Done! Achievements updated.\n');
