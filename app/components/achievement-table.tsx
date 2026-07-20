'use client';

import { useState } from 'react';
import { Achievement } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BadgeIcon } from '@/components/badge-icon';

interface Props {
  achievements: Achievement[];
  onEdit?: (achievement: Achievement) => void;
  onDelete?: (id: string) => void;
  onToggleFeatured?: (id: string, featured: boolean) => void;
}

type SortField = 'name' | 'distance' | 'rankingScratch' | 'date';
type SortDirection = 'asc' | 'desc' | null;

export function AchievementTable({ achievements, onEdit, onDelete, onToggleFeatured }: Props) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 ml-1" />;
    }
    return <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const sortedAchievements = [...achievements];
  if (sortField && sortDirection) {
    sortedAchievements.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'date') {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const handleRowClick = (achievement: Achievement, e: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    
    if (onEdit) {
      onEdit(achievement);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Name
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Badges</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('distance')}
            >
              <div className="flex items-center">
                Distance
                {getSortIcon('distance')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('rankingScratch')}
            >
              <div className="flex items-center">
                Scratch
                {getSortIcon('rankingScratch')}
              </div>
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center">
                Date
                {getSortIcon('date')}
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAchievements.map(achievement => (
            <TableRow 
              key={achievement.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={(e) => handleRowClick(achievement, e)}
            >
              <TableCell className="font-medium">{achievement.name}</TableCell>
              <TableCell>
                <Badge variant={achievement.category === 'Trail' ? 'default' : 'secondary'}>
                  {achievement.category}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 flex-wrap">
                  {achievement.badges?.map((badgeId) => (
                    <BadgeIcon key={badgeId} badgeId={badgeId} />
                  ))}
                </div>
              </TableCell>
              <TableCell>{achievement.distance} km</TableCell>
              <TableCell>#{achievement.rankingScratch}</TableCell>
              <TableCell>
                {achievement.rankingCategory} - #{achievement.rankingCategoryPosition}
              </TableCell>
              <TableCell>{formatDate(achievement.date)}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  {onToggleFeatured && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFeatured(achievement.id, !achievement.featured);
                      }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(achievement);
                      }}
                      aria-label="Edit achievement"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(achievement.id);
                      }}
                      aria-label="Delete achievement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
