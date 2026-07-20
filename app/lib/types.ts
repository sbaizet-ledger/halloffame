export interface Achievement {
  id: string;
  date: string;
  category: "Trail" | "Run";
  distance: number;
  name: string;
  photoLinks: string[];
  videoLinks: string[];
  eventWebsite: string;
  rankingScratch: number;
  rankingCategory: string;
  rankingCategoryPosition: number;
}

export interface AchievementsData {
  achievements: Achievement[];
}

export interface RankingRecord {
  position: number;
  raceName: string;
  date: string;
}

export interface DistanceRecord {
  distance: number;
  raceName: string;
  date: string;
}

export interface TimelineDataPoint {
  period: string;
  trailDistance: number;
  runDistance: number;
}

export interface Statistics {
  overview: {
    totalRaces: number;
    totalDistance: number;
    totalTrailRaces: number;
    totalTrailDistance: number;
    totalRunRaces: number;
    totalRunDistance: number;
  };
  rankings: {
    avgScratch: number;
    avgCategoryPosition: number;
    bestScratch: RankingRecord | null;
    bestCategoryPosition: RankingRecord | null;
  };
  records: {
    longestTrail: DistanceRecord | null;
    longestRun: DistanceRecord | null;
  };
  timelineMonthly: TimelineDataPoint[];
  timelineYearly: TimelineDataPoint[];
}
