import { NextResponse } from 'next/server';
import { readAchievements } from '@/lib/achievements';
import { Statistics, TimelineDataPoint } from '@/lib/types';

export async function GET() {
  try {
    const achievements = readAchievements();

    if (achievements.length === 0) {
      return NextResponse.json({
        overview: {
          totalRaces: 0,
          totalDistance: 0,
          totalTrailRaces: 0,
          totalTrailDistance: 0,
          totalRunRaces: 0,
          totalRunDistance: 0,
        },
        rankings: {
          avgScratch: 0,
          avgCategoryPosition: 0,
          bestScratch: null,
          bestCategoryPosition: null,
        },
        records: {
          longestTrail: null,
          longestRun: null,
        },
        timelineMonthly: [],
        timelineYearly: [],
      } as Statistics);
    }

    // Overview calculations
    const trailAchievements = achievements.filter(a => a.category === 'Trail');
    const runAchievements = achievements.filter(a => a.category === 'Run');

    const overview = {
      totalRaces: achievements.length,
      totalDistance: achievements.reduce((sum, a) => sum + a.distance, 0),
      totalTrailRaces: trailAchievements.length,
      totalTrailDistance: trailAchievements.reduce((sum, a) => sum + a.distance, 0),
      totalRunRaces: runAchievements.length,
      totalRunDistance: runAchievements.reduce((sum, a) => sum + a.distance, 0),
    };

    // Rankings calculations (only for achievements with ranking data)
    const rankedAchievements = achievements.filter(a => a.rankingScratch != null && a.rankingCategoryPosition != null);
    
    const rankings = rankedAchievements.length > 0
      ? (() => {
          const avgScratch = rankedAchievements.reduce((sum, a) => sum + (a.rankingScratch || 0), 0) / rankedAchievements.length;
          const avgCategoryPosition = rankedAchievements.reduce((sum, a) => sum + (a.rankingCategoryPosition || 0), 0) / rankedAchievements.length;

          const bestScratchAchievement = rankedAchievements.reduce((best, current) =>
            (current.rankingScratch || Infinity) < (best.rankingScratch || Infinity) ? current : best
          );

          const bestCategoryAchievement = rankedAchievements.reduce((best, current) =>
            (current.rankingCategoryPosition || Infinity) < (best.rankingCategoryPosition || Infinity) ? current : best
          );

          return {
            avgScratch: Math.round(avgScratch * 10) / 10,
            avgCategoryPosition: Math.round(avgCategoryPosition * 10) / 10,
            bestScratch: {
              position: bestScratchAchievement.rankingScratch!,
              raceName: bestScratchAchievement.name,
              date: bestScratchAchievement.date,
            },
            bestCategoryPosition: {
              position: bestCategoryAchievement.rankingCategoryPosition!,
              raceName: bestCategoryAchievement.name,
              date: bestCategoryAchievement.date,
            },
          };
        })()
      : {
          avgScratch: 0,
          avgCategoryPosition: 0,
          bestScratch: null,
          bestCategoryPosition: null,
        };

    // Records calculations
    const longestTrail = trailAchievements.length > 0
      ? trailAchievements.reduce((longest, current) =>
          current.distance > longest.distance ? current : longest
        )
      : null;

    const longestRun = runAchievements.length > 0
      ? runAchievements.reduce((longest, current) =>
          current.distance > longest.distance ? current : longest
        )
      : null;

    const records = {
      longestTrail: longestTrail
        ? {
            distance: longestTrail.distance,
            raceName: longestTrail.name,
            date: longestTrail.date,
          }
        : null,
      longestRun: longestRun
        ? {
            distance: longestRun.distance,
            raceName: longestRun.name,
            date: longestRun.date,
          }
        : null,
    };

    // Timeline calculations
    // Monthly aggregation
    const monthlyMap = new Map<string, { trail: number; run: number }>();
    achievements.forEach(a => {
      const month = a.date.substring(0, 7); // "YYYY-MM"
      const existing = monthlyMap.get(month) || { trail: 0, run: 0 };
      if (a.category === 'Trail') {
        existing.trail += a.distance;
      } else {
        existing.run += a.distance;
      }
      monthlyMap.set(month, existing);
    });

    const timelineMonthly: TimelineDataPoint[] = Array.from(monthlyMap.entries())
      .map(([period, data]) => ({
        period,
        trailDistance: Math.round(data.trail * 10) / 10,
        runDistance: Math.round(data.run * 10) / 10,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    // Yearly aggregation
    const yearlyMap = new Map<string, { trail: number; run: number }>();
    achievements.forEach(a => {
      const year = a.date.substring(0, 4); // "YYYY"
      const existing = yearlyMap.get(year) || { trail: 0, run: 0 };
      if (a.category === 'Trail') {
        existing.trail += a.distance;
      } else {
        existing.run += a.distance;
      }
      yearlyMap.set(year, existing);
    });

    const timelineYearly: TimelineDataPoint[] = Array.from(yearlyMap.entries())
      .map(([period, data]) => ({
        period,
        trailDistance: Math.round(data.trail * 10) / 10,
        runDistance: Math.round(data.run * 10) / 10,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    const statistics: Statistics = {
      overview,
      rankings,
      records,
      timelineMonthly,
      timelineYearly,
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Statistics API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate statistics' },
      { status: 500 }
    );
  }
}
