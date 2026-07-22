'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RankingPercentageDataPoint } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RankingPercentageChartProps {
  data: RankingPercentageDataPoint[];
}

export function RankingPercentageChart({ data }: RankingPercentageChartProps) {
  const [dateRange, setDateRange] = useState<'all' | '1year' | '6months' | '3months'>('all');

  // Filter data based on date range
  const filteredData = (() => {
    if (dateRange === 'all' || data.length === 0) return data;

    const now = new Date();
    const cutoffMonths = dateRange === '1year' ? 12 : dateRange === '6months' ? 6 : 3;
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - cutoffMonths, 1);
    const cutoffStr = cutoffDate.toISOString().substring(0, 10); // "YYYY-MM-DD"

    return data.filter(d => d.date >= cutoffStr);
  })();

  // Transform data for recharts
  const chartData = filteredData.map(d => ({
    date: d.date,
    raceName: d.raceName,
    'Scratch %': d.scratchPercentage,
    'Category %': d.categoryPercentage,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{data.raceName}</p>
          <p className="text-sm text-muted-foreground mb-2">{data.date}</p>
          {data['Scratch %'] != null && (
            <p className="text-sm" style={{ color: '#9333ea' }}>
              Scratch: {data['Scratch %'].toFixed(1)}%
            </p>
          )}
          {data['Category %'] != null && (
            <p className="text-sm" style={{ color: '#f97316' }}>
              Category: {data['Category %'].toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Ranking Performance Over Time</CardTitle>
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
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No ranking data available for the selected range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                label={{ value: 'Ranking %', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Scratch %" 
                stroke="#9333ea" 
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="Category %" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
