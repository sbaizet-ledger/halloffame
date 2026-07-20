import { Achievement } from '@/lib/types';
import { FeaturedCard } from './featured-card';
import { Trophy } from 'lucide-react';

interface FeaturedAchievementsProps {
  achievements: Achievement[];
}

export function FeaturedAchievements({ achievements }: FeaturedAchievementsProps) {
  const featured = achievements
    .filter(a => a.featured)
    .slice(0, 3); // Max 3

  if (featured.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-7 w-7 text-primary" />
        <h2 className="text-3xl font-bold">Highlights</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map(achievement => (
          <FeaturedCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </section>
  );
}
