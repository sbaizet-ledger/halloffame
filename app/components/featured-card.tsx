import { Achievement } from '@/lib/types';
import { Calendar, MapPin, Award, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { BadgeIcon } from '@/components/badge-icon';

interface FeaturedCardProps {
  achievement: Achievement;
}

export function FeaturedCard({ achievement }: FeaturedCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      {/* Featured ribbon */}
      <div className="absolute top-0 right-0 z-10">
        <div className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold transform translate-x-2 translate-y-2 rotate-12">
          FEATURED
        </div>
      </div>

      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6 space-y-4">
        {/* Category badge */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            achievement.category === 'Trail' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}>
            {achievement.category}
          </span>
          <Award className="h-5 w-5 text-primary" />
        </div>

        {/* Race name */}
        <div>
          <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
            {achievement.name}
          </h3>
          {achievement.badges && achievement.badges.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {achievement.badges.map((badgeId) => (
                <BadgeIcon key={badgeId} badgeId={badgeId} />
              ))}
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4" />
              <span>Distance</span>
            </div>
            <p className="text-2xl font-bold">{achievement.distance}km</p>
          </div>

          {achievement.rankingScratch && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>Rank</span>
              </div>
              <p className="text-2xl font-bold">
                #{achievement.rankingScratch}
              </p>
            </div>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(achievement.date)}</span>
        </div>

        {/* Category position if available */}
        {achievement.rankingCategory && achievement.rankingCategoryPosition != null && achievement.rankingCategoryPosition > 0 && (
          <div className="text-xs text-muted-foreground">
            {achievement.rankingCategory}: #{achievement.rankingCategoryPosition}
          </div>
        )}
      </div>
    </Card>
  );
}
