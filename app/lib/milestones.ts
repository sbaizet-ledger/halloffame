import type { Achievement, Milestone, UserProfile } from "./types";

function groupByYear(achievements: Achievement[]): Record<string, Achievement[]> {
  const groups: Record<string, Achievement[]> = {};
  
  for (const achievement of achievements) {
    const year = new Date(achievement.date).getFullYear().toString();
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(achievement);
  }
  
  return groups;
}

export function computeMilestones(
  achievements: Achievement[],
  profile: UserProfile
): Milestone[] {
  const milestones: Milestone[] = [];

  if (achievements.length === 0) {
    return milestones;
  }

  // Sort achievements chronologically
  const sorted = [...achievements].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // First race ever
  milestones.push({
    date: sorted[0].date,
    title: "First Race",
    description: sorted[0].name,
    type: "first-race",
    icon: "🎯",
    achievement: sorted[0]
  });

  // Longest trail race
  const trailRaces = achievements.filter(a => a.category === "Trail");
  if (trailRaces.length > 0) {
    const longestTrail = trailRaces.sort((a, b) => b.distance - a.distance)[0];
    milestones.push({
      date: longestTrail.date,
      title: `Longest Trail: ${longestTrail.distance}km`,
      description: longestTrail.name,
      type: "personal-best",
      icon: "🏔️",
      achievement: longestTrail
    });
  }

  // Longest run race
  const runRaces = achievements.filter(a => a.category === "Run");
  if (runRaces.length > 0) {
    const longestRun = runRaces.sort((a, b) => b.distance - a.distance)[0];
    milestones.push({
      date: longestRun.date,
      title: `Longest Run: ${longestRun.distance}km`,
      description: longestRun.name,
      type: "personal-best",
      icon: "🏃",
      achievement: longestRun
    });
  }

  // Best overall ranking
  const rankedAchievements = achievements.filter(a => a.rankingScratch > 0);
  if (rankedAchievements.length > 0) {
    const bestRank = rankedAchievements.sort((a, b) => 
      a.rankingScratch - b.rankingScratch
    )[0];
    milestones.push({
      date: bestRank.date,
      title: `Best Overall: #${bestRank.rankingScratch}`,
      description: bestRank.name,
      type: "personal-best",
      icon: "🥇",
      achievement: bestRank
    });
  }

  // Year summaries (only for years with 3+ races)
  const byYear = groupByYear(achievements);
  for (const [year, yearAchievements] of Object.entries(byYear)) {
    if (yearAchievements.length >= 3) {
      const totalDist = yearAchievements.reduce((sum, a) => sum + a.distance, 0);
      milestones.push({
        date: `${year}-12-31`,
        title: `${year} Year Summary`,
        description: `${yearAchievements.length} races, ${Math.round(totalDist)}km`,
        type: "year-summary",
        icon: "📅"
      });
    }
  }

  // Add custom milestones from profile
  if (profile.customMilestones) {
    milestones.push(...profile.customMilestones.map(m => ({
      ...m,
      type: "custom" as const
    })));
  }

  // Sort chronologically
  return milestones.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
