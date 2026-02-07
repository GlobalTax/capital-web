// ============= CHANNEL EVOLUTION BLOCK =============
// Weekly time series of new / qualified leads by channel

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChannelTimeSeriesPoint } from './types';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  data: ChannelTimeSeriesPoint[];
  isLoading: boolean;
}

type ViewMode = 'new' | 'qualified';

const CHANNEL_LINE_COLORS: Record<string, string> = {
  'Meta Ads': 'hsl(220, 90%, 56%)',
  'Google Ads': 'hsl(142, 70%, 45%)',
  'Sin canal': 'hsl(0, 0%, 60%)',
};

const getLineColor = (name: string, idx: number) =>
  CHANNEL_LINE_COLORS[name] || `hsl(${(idx * 80 + 200) % 360}, 55%, 50%)`;

export const ChannelEvolutionBlock: React.FC<Props> = ({ data, isLoading }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('new');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (!data.length) return null;

  // Get all unique channel names
  const allChannels = new Set<string>();
  data.forEach(point => {
    Object.keys(point.channels).forEach(ch => allChannels.add(ch));
  });
  const channelNames = Array.from(allChannels).sort((a, b) => {
    // Put Meta and Google first
    if (a === 'Meta Ads') return -1;
    if (b === 'Meta Ads') return 1;
    if (a === 'Google Ads') return -1;
    if (b === 'Google Ads') return 1;
    return a.localeCompare(b);
  });

  // Transform data for Recharts
  const chartData = data.map(point => {
    const row: Record<string, string | number> = {
      week: format(parseISO(point.week), 'dd MMM', { locale: es }),
    };
    channelNames.forEach(ch => {
      const entry = point.channels[ch];
      row[ch] = entry ? (viewMode === 'new' ? entry.newLeads : entry.qualifiedLeads) : 0;
    });
    return row;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Evolución semanal por canal
        </h4>
        <div className="flex gap-1">
          <Button
            variant={viewMode === 'new' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setViewMode('new')}
          >
            Nuevos
          </Button>
          <Button
            variant={viewMode === 'qualified' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setViewMode('qualified')}
          >
            Cualificados
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {channelNames.map((ch, idx) => (
                <Line
                  key={ch}
                  type="monotone"
                  dataKey={ch}
                  stroke={getLineColor(ch, idx)}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
