/**
 * Test badge assignment logic
 */

import { assignBadges } from '../lib/badges';
import { Achievement } from '../lib/types';

// Test achievement with rankingScratch = 23
const testAchievement: Achievement = {
  id: "test",
  date: "2026-01-01",
  category: "Trail",
  distance: 15.5,
  name: "Test Race",
  rankingScratch: 23,
  rankingCategory: "M0H",
  rankingCategoryPosition: 5,
  photoLinks: [],
  videoLinks: [],
  eventWebsite: ""
};

const allAchievements = [testAchievement];

console.log('Testing badge assignment for rankingScratch = 23');
console.log('Expected: no badges (23 > 10)');

const badges = assignBadges(testAchievement, allAchievements);
console.log('Assigned badges:', badges);

// Test with rankingScratch = 5
const testAchievement2: Achievement = {
  ...testAchievement,
  id: "test2",
  rankingScratch: 5
};

console.log('\nTesting badge assignment for rankingScratch = 5');
console.log('Expected: podium, top-10');

const badges2 = assignBadges(testAchievement2, [testAchievement2]);
console.log('Assigned badges:', badges2);

// Test with distance = 50km
const testAchievement3: Achievement = {
  ...testAchievement,
  id: "test3",
  distance: 50,
  rankingScratch: 100
};

console.log('\nTesting badge assignment for distance = 50km');
console.log('Expected: ultra');

const badges3 = assignBadges(testAchievement3, [testAchievement3]);
console.log('Assigned badges:', badges3);
