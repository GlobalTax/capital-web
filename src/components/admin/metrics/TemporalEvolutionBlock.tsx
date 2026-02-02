// ============= TEMPORAL EVOLUTION BLOCK =============
// Gráfico de evolución temporal de leads

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { TemporalDataPoint } from './types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface TemporalEvolutionBlockProps {
  data: TemporalDataPoint[];
  isLoading?: boolean;
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('es-ES').format(value);
};

export const TemporalEvolutionBlock: React.FC<TemporalEvolutionBlockProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 bg-muted rounded w-48" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  // Check if we have meaningful data (at least some non-zero values)
  const hasData = data.some(d => d.newLeads > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Evolución Temporal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay datos suficientes para mostrar la evolución temporal
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data with formatted dates - safe parsing
  const chartData = data.map(d => {
    try {
      if (!d.date) return { ...d, displayDate: '—', fullDate: '—' };
      const parsed = parseISO(d.date);
      if (isNaN(parsed.getTime())) return { ...d, displayDate: d.date, fullDate: d.date };
      return {
        ...d,
        displayDate: format(parsed, 'dd MMM', { locale: es }),
        fullDate: format(parsed, 'dd MMMM yyyy', { locale: es }),
      };
    } catch {
      return { ...d, displayDate: d.date || '—', fullDate: d.date || '—' };
    }
  });

  // Calculate totals for the period
  const totals = data.reduce((acc, d) => ({
    newLeads: acc.newLeads + d.newLeads,
    qualifiedLeads: acc.qualifiedLeads + d.qualifiedLeads,
    meetingLeads: acc.meetingLeads + d.meetingLeads,
    wonLeads: acc.wonLeads + d.wonLeads,
  }), { newLeads: 0, qualifiedLeads: 0, meetingLeads: 0, wonLeads: 0 });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0]?.payload;
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium mb-2">{item?.fullDate || label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{formatNumber(entry.value)}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Evolución Temporal
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          Últimos 30 días
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{formatNumber(totals.newLeads)}</p>
            <p className="text-xs text-blue-600/70">Nuevos leads</p>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">{formatNumber(totals.qualifiedLeads)}</p>
            <p className="text-xs text-emerald-600/70">Cualificados</p>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <p className="text-2xl font-bold text-indigo-600">{formatNumber(totals.meetingLeads)}</p>
            <p className="text-xs text-indigo-600/70">Reuniones</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{formatNumber(totals.wonLeads)}</p>
            <p className="text-xs text-green-600/70">Ganados</p>
          </div>
        </div>

        {/* Area Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="newLeads"
                name="Nuevos"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="qualifiedLeads"
                name="Cualificados"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Trend indicator */}
        <div className="text-xs text-muted-foreground flex items-center gap-2 pt-2 border-t">
          <span>💡</span>
          <span>
            Promedio diario: {formatNumber(Math.round(totals.newLeads / 30))} leads nuevos
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
