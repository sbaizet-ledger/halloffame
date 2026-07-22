'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Statistics, Milestone } from '@/lib/types';
import { StatCard } from '@/components/stat-card';
import { DistanceChart } from '@/components/distance-chart';
import { RankingPercentageChart } from '@/components/ranking-percentage-chart';
import { MilestonesTimeline } from '@/components/milestones-timeline';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Trophy, 
  MapPin, 
  Mountain, 
  Route,
  Award,
  Target,
  Medal,
  TrendingUp,
  Loader2
} from 'lucide-react';

export default function StatisticsPage() {
  const router = useRouter();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
    fetchMilestones();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/statistics');
      if (!res.ok) throw new Error('Failed to fetch statistics');
      const data = await res.json();
      setStatistics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async () => {
    try {
      const res = await fetch('/api/milestones');
      if (!res.ok) throw new Error('Failed to fetch milestones');
      const data = await res.json();
      setMilestones(data.milestones || []);
    } catch (err) {
      console.error('Milestones fetch error:', err);
      // Non-critical, continue without milestones
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hall of Fame
          </Button>
        </div>
      </div>
    );
  }

  if (!statistics || statistics.overview.totalRaces === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-6">
            <Button onClick={() => router.push('/')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hall of Fame
            </Button>
          </div>
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
            <p className="text-muted-foreground mb-4">
              Add some achievements to see your statistics
            </p>
            <Button onClick={() => router.push('/')}>
              Go to Hall of Fame
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { overview, rankings, records } = statistics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Button onClick={() => router.push('/')} variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hall of Fame
            </Button>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
                <p className="text-sm text-muted-foreground">Your performance overview</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Races"
              value={overview.totalRaces}
              subtitle={`${overview.totalDistance.toFixed(1)} km total`}
              icon={Trophy}
              iconColor="text-yellow-600"
            />
            <StatCard
              title="Trail Races"
              value={overview.totalTrailRaces}
              subtitle={`${overview.totalTrailDistance.toFixed(1)} km`}
              icon={Mountain}
              iconColor="text-green-600"
            />
            <StatCard
              title="Road Runs"
              value={overview.totalRunRaces}
              subtitle={`${overview.totalRunDistance.toFixed(1)} km`}
              icon={Route}
              iconColor="text-blue-600"
            />
          </div>
        </div>

        {/* Rankings Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Rankings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Avg Scratch Position"
              value={rankings.avgScratch}
              icon={Award}
              iconColor="text-purple-600"
            />
            <StatCard
              title="Best Scratch"
              value={rankings.bestScratch?.position || 'N/A'}
              subtitle={rankings.bestScratch ? rankings.bestScratch.raceName : undefined}
              icon={Target}
              iconColor="text-red-600"
            />
            <StatCard
              title="Avg Category Position"
              value={rankings.avgCategoryPosition}
              icon={Medal}
              iconColor="text-orange-600"
            />
            <StatCard
              title="Best Category Position"
              value={rankings.bestCategoryPosition?.position || 'N/A'}
              subtitle={rankings.bestCategoryPosition ? rankings.bestCategoryPosition.raceName : undefined}
              icon={Medal}
              iconColor="text-amber-600"
            />
          </div>
        </div>

        {/* Records Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Records</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Longest Trail"
              value={records.longestTrail ? `${records.longestTrail.distance} km` : 'N/A'}
              subtitle={records.longestTrail ? records.longestTrail.raceName : 'No trail races yet'}
              icon={Mountain}
              iconColor="text-green-600"
            />
            <StatCard
              title="Longest Run"
              value={records.longestRun ? `${records.longestRun.distance} km` : 'N/A'}
              subtitle={records.longestRun ? records.longestRun.raceName : 'No road runs yet'}
              icon={Route}
              iconColor="text-blue-600"
            />
          </div>
        </div>

        {/* Distance Chart */}
        <div className="mb-8">
          <DistanceChart
            monthlyData={statistics.timelineMonthly}
            yearlyData={statistics.timelineYearly}
          />
        </div>

        {/* Ranking Percentage Chart */}
        <div className="mb-8">
          <RankingPercentageChart data={statistics.rankingPercentageTimeline} />
        </div>
      </div>
    </div>
  );
}
