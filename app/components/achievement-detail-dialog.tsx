'use client';

import { useState, useEffect } from 'react';
import { Achievement } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Trophy, 
  TrendingUp, 
  Image as ImageIcon, 
  Video, 
  ExternalLink, 
  Clock, 
  Gauge,
  Users,
  Mountain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BadgeIcon } from '@/components/badge-icon';
import { calculatePace, formatPace, calculateEffortSpeed, calculateEffortPace, formatSpeed } from '@/lib/calculations';

interface Props {
  achievement: Achievement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AchievementDetailDialog({ achievement, open, onOpenChange }: Props) {
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

  if (!achievement) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const calculatePercentage = (position: number, total: number): string => {
    const percentage = ((position / total) * 100).toFixed(1);
    return `${percentage}%`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={achievement.category === 'Trail' ? 'default' : 'secondary'}>
              {achievement.category}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(achievement.date)}
            </span>
          </div>
          <DialogTitle className="text-2xl">{achievement.name}</DialogTitle>
          {achievement.badges && achievement.badges.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap pt-2">
              {achievement.badges.map((badgeId) => (
                <BadgeIcon key={badgeId} badgeId={badgeId} />
              ))}
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Core Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Distance</div>
                <div className="text-2xl font-bold">{achievement.distance} km</div>
              </div>
            </div>
            
            {achievement.time && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Time</div>
                  <div className="text-2xl font-bold">{achievement.time}</div>
                </div>
              </div>
            )}
          </div>

          {/* Pace & Speed */}
          {achievement.time && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Average Pace</div>
                  <div className="text-xl font-semibold">
                    {formatPace(calculatePace(achievement.distance, achievement.time))}/km
                  </div>
                </div>
              </div>

              {achievement.denivelePositive && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Gauge className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Effort {speedFormat === 'speed' ? 'Speed' : 'Pace'}</div>
                    <div className="text-xl font-semibold">
                      {speedFormat === 'speed' 
                        ? `${formatSpeed(calculateEffortSpeed(achievement.distance, achievement.time, achievement.denivelePositive))} km/h`
                        : `${formatPace(calculateEffortPace(achievement.distance, achievement.time, achievement.denivelePositive))}/km`
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Elevation */}
          {(achievement.denivelePositive || achievement.deniveleNegative) && (
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Mountain className="h-4 w-4" />
                Elevation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievement.denivelePositive && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground">D+</div>
                    <div className="text-lg font-semibold">{achievement.denivelePositive}m</div>
                  </div>
                )}
                {achievement.deniveleNegative && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground">D-</div>
                    <div className="text-lg font-semibold">{achievement.deniveleNegative}m</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rankings */}
          {(achievement.rankingScratch || achievement.rankingCategoryPosition) && (
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Rankings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievement.rankingScratch && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-muted-foreground">Overall Scratch</div>
                      {achievement.totalParticipants && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {achievement.totalParticipants}
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold text-yellow-600">#{achievement.rankingScratch}</div>
                      {achievement.totalParticipants && (
                        <div className="text-sm text-muted-foreground">
                          (Top {calculatePercentage(achievement.rankingScratch, achievement.totalParticipants)})
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {achievement.rankingCategoryPosition && achievement.rankingCategory && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-muted-foreground">{achievement.rankingCategory}</div>
                      {achievement.categoryParticipants && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {achievement.categoryParticipants}
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold text-blue-600">#{achievement.rankingCategoryPosition}</div>
                      {achievement.categoryParticipants && (
                        <div className="text-sm text-muted-foreground">
                          (Top {calculatePercentage(achievement.rankingCategoryPosition, achievement.categoryParticipants)})
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Media & Links */}
          {(achievement.photoLinks?.length > 0 || achievement.videoLinks?.length > 0 || achievement.eventWebsite) && (
            <div>
              <h3 className="text-sm font-medium mb-3">Links & Media</h3>
              <div className="flex flex-wrap gap-2">
                {achievement.photoLinks && achievement.photoLinks.length > 0 && (
                  <>
                    {achievement.photoLinks.map((link, index) => (
                      <a
                        key={`photo-${index}`}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex items-center gap-1")}
                      >
                        <ImageIcon className="h-3 w-3" />
                        Photo {achievement.photoLinks!.length > 1 ? `${index + 1}` : ''}
                      </a>
                    ))}
                  </>
                )}
                
                {achievement.videoLinks && achievement.videoLinks.length > 0 && (
                  <>
                    {achievement.videoLinks.map((link, index) => (
                      <a
                        key={`video-${index}`}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex items-center gap-1")}
                      >
                        <Video className="h-3 w-3" />
                        Video {achievement.videoLinks!.length > 1 ? `${index + 1}` : ''}
                      </a>
                    ))}
                  </>
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
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
