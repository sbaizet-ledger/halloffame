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
