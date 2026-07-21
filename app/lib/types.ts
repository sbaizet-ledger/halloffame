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
  featured?: boolean;
  badges?: string[];
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

export interface ThemeConfig {
  primaryColor: string;
}

export interface CustomMilestone {
  date: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface UserProfile {
  nickname: string;
  bio?: string;
  avatarPath?: string;
  joinedYear?: number;
  location?: string;
  theme: ThemeConfig;
  socialLinks?: {
    strava?: string;
    instagram?: string;
    website?: string;
  };
  customMilestones?: CustomMilestone[];
  showQuoteOfTheDay?: boolean;
  showJourneyMilestones?: boolean;
}

export type BadgeCriteria =
  | { type: "distance"; value: number }
  | { type: "ranking"; position: number }
  | { type: "count"; value: number }
  | { type: "manual" };

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: BadgeCriteria;
}

export interface BadgesData {
  badges: Badge[];
}

export interface Milestone {
  date: string;
  title: string;
  description?: string;
  type: "first-race" | "personal-best" | "badge" | "custom" | "year-summary";
  icon?: string;
  achievement?: Achievement;
}
