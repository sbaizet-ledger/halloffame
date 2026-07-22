'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaceDataPoint } from '@/lib/types';
import { formatPace } from '@/lib/calculations';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  data: PaceDataPoint[];
  speedFormat: 'speed' | 'pace';
}

export function PaceChart({ data, speedFormat }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pace & Effort Speed Evolution</CardTitle>
          <CardDescription>Track your pace and effort-adjusted speed over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No pace data available yet. Add race times to see your evolution.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart
  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    raceName: d.raceName,
    pace: d.pace,
    paceFormatted: formatPace(d.pace),
    effortSpeed: d.effortSpeed ? Number(d.effortSpeed.toFixed(2)) : undefined,
    effortPace: d.effortPace ? d.effortPace : undefined,
    effortPaceFormatted: d.effortPace ? formatPace(d.effortPace) : undefined,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.raceName}</p>
          <p className="text-sm text-muted-foreground">{data.date}</p>
          <p className="text-sm mt-1">
            <span className="text-cyan-600 font-medium">Pace:</span> {data.paceFormatted}/km
          </p>
          {speedFormat === 'speed' && data.effortSpeed && (
            <p className="text-sm">
              <span className="text-purple-600 font-medium">Effort Speed:</span> {data.effortSpeed} km/h
            </p>
          )}
          {speedFormat === 'pace' && data.effortPaceFormatted && (
            <p className="text-sm">
              <span className="text-purple-600 font-medium">Effort Pace:</span> {data.effortPaceFormatted}/km
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
        <CardTitle>Pace & {speedFormat === 'speed' ? 'Effort Speed' : 'Effort Pace'} Evolution</CardTitle>
        <CardDescription>
          Track your pace (min/km) and effort-adjusted {speedFormat === 'speed' ? 'speed (km/h)' : 'pace (min/km)'} over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              yAxisId="left"
              label={{ value: 'Pace (min/km)', angle: -90, position: 'insideLeft' }}
              reversed
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              className="text-xs"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ 
                value: speedFormat === 'speed' ? 'Effort Speed (km/h)' : 'Effort Pace (min/km)',
                angle: 90,
                position: 'insideRight'
              }}
              reversed={speedFormat === 'pace'}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              className="text-xs"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="pace"
              stroke="hsl(180, 100%, 50%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(180, 100%, 50%)', r: 4 }}
              name="Pace (min/km)"
              activeDot={{ r: 6 }}
            />
            {speedFormat === 'speed' && chartData.some(d => d.effortSpeed !== undefined) && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="effortSpeed"
                stroke="hsl(270, 100%, 50%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(270, 100%, 50%)', r: 4 }}
                name="Effort Speed (km/h)"
                activeDot={{ r: 6 }}
              />
            )}
            {speedFormat === 'pace' && chartData.some(d => d.effortPace !== undefined) && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="effortPace"
                stroke="hsl(270, 100%, 50%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(270, 100%, 50%)', r: 4 }}
                name="Effort Pace (min/km)"
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
