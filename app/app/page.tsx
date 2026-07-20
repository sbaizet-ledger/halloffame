'use client';

import { useState, useEffect } from 'react';
import { Achievement } from '@/lib/types';
import { AchievementCard } from '@/components/achievement-card';
import { AchievementForm } from '@/components/achievement-form';
import { AuthDialog } from '@/components/auth-dialog';
import { FilterToolbar } from '@/components/filter-toolbar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trophy, Loader2 } from 'lucide-react';

type CategoryFilter = 'all' | 'Trail' | 'Run';
type SortOption = 'date' | 'distance';

export default function Home() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filtered, setFiltered] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<((password: string) => Promise<void>) | null>(null);
  
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date');

  // Fetch achievements on mount
  useEffect(() => {
    fetchAchievements();
  }, []);

  // Apply filters/sorts when data or filters change
  useEffect(() => {
    let result = [...achievements];

    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter(a => a.category === categoryFilter);
    }

    // Sort
    if (sortOption === 'date') {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      result.sort((a, b) => b.distance - a.distance);
    }

    setFiltered(result);
  }, [achievements, categoryFilter, sortOption]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/achievements');
      if (!res.ok) throw new Error('Failed to fetch achievements');
      const data = await res.json();
      setAchievements(data.achievements || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Auth flow
  const requireAuth = (action: (password: string) => Promise<void>) => {
    setPendingAction(() => action);
    setShowAuth(true);
  };

  const handleAuthSubmit = async (password: string) => {
    if (!pendingAction) return;

    try {
      await pendingAction(password);
      setShowAuth(false);
      setPendingAction(null);
    } catch (err) {
      throw err; // Let AuthDialog handle error display
    }
  };

  // CRUD operations
  const handleCreate = async (data: Omit<Achievement, 'id'>) => {
    requireAuth(async (password) => {
      const res = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create achievement');
      }

      await fetchAchievements();
    });
  };

  const handleUpdate = async (data: Omit<Achievement, 'id'>) => {
    if (!editingAchievement) return;

    requireAuth(async (password) => {
      const res = await fetch(`/api/achievements/${editingAchievement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update achievement');
      }

      await fetchAchievements();
      setEditingAchievement(null);
    });
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    
    requireAuth(async (password) => {
      const res = await fetch(`/api/achievements/${deletingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete achievement');
      }

      await fetchAchievements();
      setShowDeleteConfirm(false);
      setDeletingId(null);
    });
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: Omit<Achievement, 'id'>) => {
    if (editingAchievement) {
      await handleUpdate(data);
    } else {
      await handleCreate(data);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAchievement(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Hall of Fame</h1>
              <p className="text-sm text-muted-foreground">Track your running achievements</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Achievement
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filter Toolbar */}
        {!loading && achievements.length > 0 && (
          <div className="mb-6">
            <FilterToolbar
              onCategoryFilter={setCategoryFilter}
              onSort={setSortOption}
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty State */}
        {!loading && achievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No achievements yet</h2>
            <p className="text-muted-foreground mb-4">
              Start tracking your running and trail achievements
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Achievement
            </Button>
          </div>
        )}

        {/* Achievement Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

        {/* No Results After Filter */}
        {!loading && achievements.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No achievements match the current filters
            </p>
          </div>
        )}

        {/* Dialogs */}
        <AchievementForm
          open={showForm}
          achievement={editingAchievement || undefined}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />

        <AuthDialog
          open={showAuth}
          onClose={() => {
            setShowAuth(false);
            setPendingAction(null);
          }}
          onSubmit={handleAuthSubmit}
        />

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this achievement.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingId(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
