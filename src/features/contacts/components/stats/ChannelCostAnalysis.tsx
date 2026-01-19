// ============= CHANNEL COST ANALYSIS =============
// Análisis de leads y costes por canal con gráficos y tabla

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChannelMetrics } from '../../types/stats';
import { cn } from '@/lib/utils';

interface ChannelCostAnalysisProps {
  channelMetrics: ChannelMetrics[];
  showCosts: boolean;
  isLoading?: boolean;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K€`;
  return `${value.toFixed(0)}€`;
};

const formatCompact = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
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
            {entry.name.includes('Coste') || entry.name.includes('CPL') || entry.name.includes('EBITDA')
              ? formatCurrency(entry.value)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const ChannelCostAnalysis: React.FC<ChannelCostAnalysisProps> = ({
  channelMetrics,
  showCosts,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');

  if (isLoading) {
    return (
      <div className="bg-[hsl(var(--linear-bg-elevated))] border border-[hsl(var(--linear-border))] rounded-lg p-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const chartData = channelMetrics.map(m => ({
    name: m.channelLabel,
    leads: m.leads,
    coste: m.cost,
    cpl: m.cpl,
    calificados: m.qualifiedLeads,
    cplCalificado: m.cplQualified,
    ebitdaMedio: m.avgEbitda,
  }));

  return (
    <div className="bg-[hsl(var(--linear-bg-elevated))] border border-[hsl(var(--linear-border))] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Análisis por Canal</h3>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chart' | 'table')}>
          <TabsList className="h-7">
            <TabsTrigger value="chart" className="text-xs px-2 h-5">Gráfico</TabsTrigger>
            <TabsTrigger value="table" className="text-xs px-2 h-5">Tabla</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === 'chart' && (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={formatCompact}
              />
              {showCosts && (
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(v) => formatCurrency(v)}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: 11 }}
                iconSize={8}
              />
              <Bar 
                yAxisId="left"
                dataKey="leads" 
                name="Leads" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="left"
                dataKey="calificados" 
                name="Calificados" 
                fill="hsl(142, 76%, 36%)" 
                radius={[4, 4, 0, 0]}
              />
              {showCosts && (
                <>
                  <Bar 
                    yAxisId="right"
                    dataKey="coste" 
                    name="Coste" 
                    fill="hsl(45, 93%, 47%)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="cpl" 
                    name="CPL" 
                    stroke="hsl(0, 84%, 60%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(0, 84%, 60%)', r: 4 }}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'table' && (
        <div className="border border-[hsl(var(--linear-border))] rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-medium">Canal</TableHead>
                <TableHead className="text-xs font-medium text-right">Leads</TableHead>
                {showCosts && (
                  <>
                    <TableHead className="text-xs font-medium text-right">Coste</TableHead>
                    <TableHead className="text-xs font-medium text-right">CPL</TableHead>
                  </>
                )}
                <TableHead className="text-xs font-medium text-right">Calificados</TableHead>
                {showCosts && (
                  <TableHead className="text-xs font-medium text-right">CPL Calif.</TableHead>
                )}
                <TableHead className="text-xs font-medium text-right">EBITDA Medio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channelMetrics.map((channel) => (
                <TableRow key={channel.channel} className="hover:bg-muted/30">
                  <TableCell className="text-sm font-medium">{channel.channelLabel}</TableCell>
                  <TableCell className="text-sm text-right">{channel.leads}</TableCell>
                  {showCosts && (
                    <>
                      <TableCell className="text-sm text-right">{formatCurrency(channel.cost)}</TableCell>
                      <TableCell className={cn(
                        "text-sm text-right font-medium",
                        channel.cpl > 100 ? "text-red-600" : channel.cpl > 50 ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {formatCurrency(channel.cpl)}
                      </TableCell>
                    </>
                  )}
                  <TableCell className="text-sm text-right text-emerald-600">{channel.qualifiedLeads}</TableCell>
                  {showCosts && (
                    <TableCell className={cn(
                      "text-sm text-right font-medium",
                      channel.cplQualified > 500 ? "text-red-600" : channel.cplQualified > 200 ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {formatCurrency(channel.cplQualified)}
                    </TableCell>
                  )}
                  <TableCell className="text-sm text-right">
                    {channel.avgEbitda > 0 ? formatCurrency(channel.avgEbitda) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ChannelCostAnalysis;
