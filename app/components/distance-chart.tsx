'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimelineDataPoint } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DistanceChartProps {
  monthlyData: TimelineDataPoint[];
  yearlyData: TimelineDataPoint[];
}

type Granularity = 'monthly' | 'yearly';

export function DistanceChart({ monthlyData, yearlyData }: DistanceChartProps) {
  const [granularity, setGranularity] = useState<Granularity>('monthly');
  const [dateRange, setDateRange] = useState<'all' | '1year' | '6months' | '3months'>('all');

  const data = granularity === 'monthly' ? monthlyData : yearlyData;

  // Filter data based on date range
  const filteredData = (() => {
    if (dateRange === 'all' || data.length === 0) return data;

    const now = new Date();
    const cutoffMonths = dateRange === '1year' ? 12 : dateRange === '6months' ? 6 : 3;
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - cutoffMonths, 1);
    const cutoffStr = cutoffDate.toISOString().substring(0, 7); // "YYYY-MM"

    return data.filter(d => d.period >= cutoffStr);
  })();

  // Transform data for recharts
  const chartData = filteredData.map(d => ({
    period: d.period,
    Trail: d.trailDistance,
    Run: d.runDistance,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Distance Over Time</CardTitle>
          <div className="flex gap-2">
            <Select value={granularity} onValueChange={(v) => setGranularity(v as Granularity)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            {granularity === 'monthly' && (
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available for the selected range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value) => `${value} km`}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Bar dataKey="Trail" fill="#10b981" stackId="distance" />
              <Bar dataKey="Run" fill="#3b82f6" stackId="distance" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
