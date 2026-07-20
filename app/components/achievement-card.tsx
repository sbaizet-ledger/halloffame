'use client';

import { Achievement } from '@/lib/types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar, MapPin, Trophy, TrendingUp, Image as ImageIcon, Video, ExternalLink, Pencil, Trash2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  achievement: Achievement;
  onEdit?: (achievement: Achievement) => void;
  onDelete?: (id: string) => void;
  onToggleFeatured?: (id: string, featured: boolean) => void;
}

export function AchievementCard({ achievement, onEdit, onDelete, onToggleFeatured }: Props) {
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
            <CardTitle className="text-xl">{achievement.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {achievement.distance} km
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
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <div>
              <div className="font-medium">Scratch</div>
              <div className="text-muted-foreground">#{achievement.rankingScratch}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <div>
              <div className="font-medium">{achievement.rankingCategory}</div>
              <div className="text-muted-foreground">#{achievement.rankingCategoryPosition}</div>
            </div>
          </div>
        </div>

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
