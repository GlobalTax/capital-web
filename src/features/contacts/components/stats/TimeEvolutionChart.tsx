// ============= TIME EVOLUTION CHART =============
// Gráfico de evolución temporal de leads, costes y CPL

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart, Bar } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimeSeriesDataPoint, PeriodGranularity } from '../../types/stats';
import { cn } from '@/lib/utils';

interface TimeEvolutionChartProps {
  getTimeSeries: (granularity: PeriodGranularity) => TimeSeriesDataPoint[];
  showCosts: boolean;
  isLoading?: boolean;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K€`;
  return `${value.toFixed(0)}€`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">
            {entry.name.includes('Coste') || entry.name.includes('CPL')
              ? formatCurrency(entry.value)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const TimeEvolutionChart: React.FC<TimeEvolutionChartProps> = ({
  getTimeSeries,
  showCosts,
  isLoading
}) => {
  const [granularity, setGranularity] = useState<PeriodGranularity>('daily');
  const [metric, setMetric] = useState<'leads' | 'cost' | 'cpl'>('leads');

  if (isLoading) {
    return (
      <div className="bg-[hsl(var(--linear-bg-elevated))] border border-[hsl(var(--linear-border))] rounded-lg p-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const data = getTimeSeries(granularity);

  return (
    <div className="bg-[hsl(var(--linear-bg-elevated))] border border-[hsl(var(--linear-border))] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Evolución Temporal</h3>
        <div className="flex items-center gap-2">
          {showCosts && (
            <Tabs value={metric} onValueChange={(v) => setMetric(v as 'leads' | 'cost' | 'cpl')}>
              <TabsList className="h-7">
                <TabsTrigger value="leads" className="text-xs px-2 h-5">Leads</TabsTrigger>
                <TabsTrigger value="cost" className="text-xs px-2 h-5">Coste</TabsTrigger>
                <TabsTrigger value="cpl" className="text-xs px-2 h-5">CPL</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <Tabs value={granularity} onValueChange={(v) => setGranularity(v as PeriodGranularity)}>
            <TabsList className="h-7">
              <TabsTrigger value="daily" className="text-xs px-2 h-5">Día</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs px-2 h-5">Semana</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-2 h-5">Mes</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {showCosts && (metric === 'leads' || !showCosts) ? (
            <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="dateLabel" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              {showCosts && (
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={formatCurrency}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="leads"
                name="Leads"
                stroke="hsl(var(--primary))"
                fill="url(#leadsGradient)"
                strokeWidth={2}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="qualifiedLeads"
                name="Calificados"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              {showCosts && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cpl"
                  name="CPL"
                  stroke="hsl(0, 84%, 60%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                />
              )}
            </ComposedChart>
          ) : metric === 'cost' ? (
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="dateLabel" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cost"
                name="Coste"
                stroke="hsl(45, 93%, 47%)"
                fill="url(#costGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="dateLabel" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="cpl"
                name="CPL"
                stroke="hsl(0, 84%, 60%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(0, 84%, 60%)', r: 4 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[hsl(var(--linear-border))]">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Promedio diario</p>
          <p className="text-lg font-semibold">
            {data.length > 0 
              ? Math.round(data.reduce((a, b) => a + b.leads, 0) / data.length)
              : 0}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Máximo</p>
          <p className="text-lg font-semibold text-emerald-600">
            {data.length > 0 ? Math.max(...data.map(d => d.leads)) : 0}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total periodo</p>
          <p className="text-lg font-semibold">
            {data.reduce((a, b) => a + b.leads, 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimeEvolutionChart;
