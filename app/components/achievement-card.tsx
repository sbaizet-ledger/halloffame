'use client';

import { useState, useEffect } from 'react';
import { Achievement } from '@/lib/types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar, MapPin, Trophy, TrendingUp, Image as ImageIcon, Video, ExternalLink, Pencil, Trash2, Star, Clock, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BadgeIcon } from '@/components/badge-icon';
import { calculatePace, formatPace, calculateEffortSpeed, calculateEffortPace, formatSpeed } from '@/lib/calculations';

interface Props {
  achievement: Achievement;
  onEdit?: (achievement: Achievement) => void;
  onDelete?: (id: string) => void;
  onToggleFeatured?: (id: string, featured: boolean) => void;
  onViewDetails?: (achievement: Achievement) => void;
}

export function AchievementCard({ achievement, onEdit, onDelete, onToggleFeatured, onViewDetails }: Props) {
  const [speedFormat, setSpeedFormat] = useState<'speed' | 'pace'>('pace');

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.speedDisplayFormat) {
          setSpeedFormat(data.speedDisplayFormat);
        }
      })
      .catch(() => {});
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons or links
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;
    
    if (onViewDetails) {
      onViewDetails(achievement);
    }
  };

  return (
    <Card 
      className={cn("hover:shadow-lg transition-shadow", onViewDetails && "cursor-pointer")}
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={achievement.category === 'Trail' ? 'default' : 'secondary'}>
                {achievement.category}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(achievement.date)}
              </span>
            </div>
            {achievement.badges && achievement.badges.length > 0 && (
              <div className="flex items-center gap-1 mb-2 flex-wrap">
                {achievement.badges.map((badgeId) => (
                  <BadgeIcon key={badgeId} badgeId={badgeId} />
                ))}
              </div>
            )}
            <CardTitle className="text-xl">{achievement.name}</CardTitle>
            <CardDescription className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {achievement.distance} km
              </span>
              {achievement.time && (
                <>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {achievement.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {formatPace(calculatePace(achievement.distance, achievement.time))}/km
                  </span>
                  {achievement.denivelePositive && (
                    <span className="flex items-center gap-1">
                      <Gauge className="h-3 w-3" />
                      {speedFormat === 'speed' 
                        ? `${formatSpeed(calculateEffortSpeed(achievement.distance, achievement.time, achievement.denivelePositive))} km/h effort`
                        : `${formatPace(calculateEffortPace(achievement.distance, achievement.time, achievement.denivelePositive))}/km effort`
                      }
                    </span>
                  )}
                </>
              )}
            </CardDescription>
          </div>
          {(onEdit || onDelete || onToggleFeatured) && (
            <div className="flex gap-1">
              {onToggleFeatured && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleFeatured(achievement.id, !achievement.featured)}
                  aria-label={achievement.featured ? "Remove from featured" : "Add to featured"}
                  title={achievement.featured ? "Remove from featured" : "Add to featured"}
                >
                  <Star className={cn("h-4 w-4", achievement.featured && "fill-primary text-primary")} />
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(achievement)}
                  aria-label="Edit achievement"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(achievement.id)}
                  aria-label="Delete achievement"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rankings */}
        {(achievement.rankingScratch || achievement.rankingCategoryPosition) && (
          <div className="grid grid-cols-2 gap-3">
            {achievement.rankingScratch && (
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="font-medium">Scratch</div>
                  <div className="text-muted-foreground">#{achievement.rankingScratch}</div>
                </div>
              </div>
            )}
            {achievement.rankingCategoryPosition && achievement.rankingCategory && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium">{achievement.rankingCategory}</div>
                  <div className="text-muted-foreground">#{achievement.rankingCategoryPosition}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-2">
          {achievement.photoLinks && achievement.photoLinks.length > 0 && (
            <a
              href={achievement.photoLinks[0]}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex items-center gap-1")}
            >
              <ImageIcon className="h-3 w-3" />
              Photos ({achievement.photoLinks.length})
            </a>
          )}
          {achievement.videoLinks && achievement.videoLinks.length > 0 && (
            <a
              href={achievement.videoLinks[0]}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex items-center gap-1")}
            >
              <Video className="h-3 w-3" />
              Videos ({achievement.videoLinks.length})
            </a>
          )}
          {achievement.eventWebsite && (
            <a
              href={achievement.eventWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex items-center gap-1")}
            >
              <ExternalLink className="h-3 w-3" />
              Event Website
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
