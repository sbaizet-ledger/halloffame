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
import { Button } from '@/components/ui/button';
import { LayoutGrid, Table } from 'lucide-react';

interface Props {
  onCategoryFilter: (category: 'all' | 'Trail' | 'Run') => void;
  onSort: (sort: 'date' | 'distance') => void;
  onViewChange: (view: 'card' | 'table') => void;
  currentView: 'card' | 'table';
}

export function FilterToolbar({ onCategoryFilter, onSort, onViewChange, currentView }: Props) {
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

      {/* Sort Select and View Toggle */}
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

        {/* View Toggle */}
        <div className="flex gap-1 ml-2">
          <Button
            variant={currentView === 'card' ? 'default' : 'outline'}
            size="icon"
            onClick={() => onViewChange('card')}
            aria-label="Card view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={currentView === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => onViewChange('table')}
            aria-label="Table view"
          >
            <Table className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
