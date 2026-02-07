// ============= CHANNEL CONVERSION BLOCK =============
// KPI cards + comparative bar chart + mini-funnel by acquisition channel

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Megaphone, TrendingUp, Users } from 'lucide-react';
import { ChannelConversionData } from './types';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  data: ChannelConversionData[];
  isLoading: boolean;
}

const CHANNEL_COLORS: Record<string, string> = {
  'Meta Ads': 'hsl(220, 90%, 56%)',
  'Google Ads': 'hsl(142, 70%, 45%)',
  'Sin canal': 'hsl(0, 0%, 60%)',
};

const getColor = (name: string, idx: number) =>
  CHANNEL_COLORS[name] || `hsl(${(idx * 60 + 30) % 360}, 55%, 50%)`;

export const ChannelConversionBlock: React.FC<Props> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (!data.length) return null;

  // Top 5 channels for display
  const topChannels = data.slice(0, 5);

  // Bar chart data: rates by channel
  const ratesData = topChannels.map(ch => ({
    name: ch.channelName,
    'Contactado': Math.round(ch.contactedRate * 10) / 10,
    'Cualificado': Math.round(ch.qualifiedRate * 10) / 10,
    'Avanzado': Math.round(ch.advancedRate * 10) / 10,
    'Ganado': Math.round(ch.wonRate * 10) / 10,
  }));

  return (
    <div className="space-y-4">
      <h4 className="text-base font-semibold flex items-center gap-2">
        <Megaphone className="h-4 w-4" />
        Conversión por Canal
      </h4>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {topChannels.map((ch, idx) => (
          <Card key={ch.channelName} className="border">
            <CardContent className="p-3 space-y-1">
              <p className="text-xs text-muted-foreground truncate">{ch.channelName}</p>
              <p className="text-xl font-bold">{ch.totalLeads}</p>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">Contact:</span>
                <span className="font-medium" style={{ color: getColor(ch.channelName, idx) }}>
                  {ch.contactedRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">Cualif:</span>
                <span className="font-medium" style={{ color: getColor(ch.channelName, idx) }}>
                  {ch.qualifiedRate.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparative Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tasas de conversión por canal (%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ratesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                formatter={(value: number) => [`${value}%`]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Contactado" fill="hsl(220, 70%, 60%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Cualificado" fill="hsl(142, 60%, 50%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Avanzado" fill="hsl(38, 90%, 55%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Ganado" fill="hsl(260, 60%, 55%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Mini Funnel Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Detalle por etapa y canal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Canal</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Total</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Contactado</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Cualificado</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Avanzado</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Ganado</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Perdido</th>
                </tr>
              </thead>
              <tbody>
                {topChannels.map((ch, idx) => (
                  <tr key={ch.channelName} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 pr-4 font-medium">{ch.channelName}</td>
                    <td className="text-right py-2 px-2">{ch.totalLeads}</td>
                    <td className="text-right py-2 px-2">
                      {ch.contactedCount} <span className="text-muted-foreground">({ch.contactedRate.toFixed(0)}%)</span>
                    </td>
                    <td className="text-right py-2 px-2">
                      {ch.qualifiedCount} <span className="text-muted-foreground">({ch.qualifiedRate.toFixed(0)}%)</span>
                    </td>
                    <td className="text-right py-2 px-2">
                      {ch.advancedCount} <span className="text-muted-foreground">({ch.advancedRate.toFixed(0)}%)</span>
                    </td>
                    <td className="text-right py-2 px-2">
                      {ch.wonCount} <span className="text-muted-foreground">({ch.wonRate.toFixed(0)}%)</span>
                    </td>
                    <td className="text-right py-2 px-2">
                      {ch.lostCount} <span className="text-muted-foreground">({ch.lostRate.toFixed(0)}%)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
