'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Props {
  onCategoryFilter: (category: 'all' | 'Trail' | 'Run') => void;
  onSort: (sort: 'date' | 'distance') => void;
}

export function FilterToolbar({ onCategoryFilter, onSort }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Category Filter */}
      <Tabs defaultValue="all" onValueChange={(value) => onCategoryFilter(value as 'all' | 'Trail' | 'Run')}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Trail">Trail</TabsTrigger>
          <TabsTrigger value="Run">Run</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sort Select */}
      <div className="flex items-center gap-2">
        <Label htmlFor="sort" className="text-sm text-muted-foreground">
          Sort by:
        </Label>
        <Select defaultValue="date" onValueChange={(value) => onSort(value as 'date' | 'distance')}>
          <SelectTrigger id="sort" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date (Newest)</SelectItem>
            <SelectItem value="distance">Distance</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
