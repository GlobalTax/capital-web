// ============= QUALITY VS COST MATRIX =============
// Análisis cruzado de calidad de leads vs costes

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { QualityMetric, ChannelMetrics } from '../../types/stats';
import { cn } from '@/lib/utils';
import { Star, TrendingUp, AlertTriangle } from 'lucide-react';

interface QualityVsCostMatrixProps {
  qualityMetrics: QualityMetric[];
  channelMetrics: ChannelMetrics[];
  showCosts: boolean;
  isLoading?: boolean;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K€`;
  return `${value.toFixed(0)}€`;
};

const getQualityColor = (score: number): string => {
  if (score >= 70) return 'hsl(142, 76%, 36%)'; // green
  if (score >= 40) return 'hsl(45, 93%, 47%)';  // amber
  return 'hsl(0, 84%, 60%)';                     // red
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-2">{data.channelLabel}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">CPL:</span>
          <span className="font-medium">{formatCurrency(data.cpl)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">EBITDA Medio:</span>
          <span className="font-medium">{formatCurrency(data.avgEbitda)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Quality Score:</span>
          <span className="font-medium">{data.qualityScore.toFixed(0)}/100</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">% Alto Valor:</span>
          <span className="font-medium">{data.highValuePercentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export const QualityVsCostMatrix: React.FC<QualityVsCostMatrixProps> = ({
  qualityMetrics,
  channelMetrics,
  showCosts,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="bg-[hsl(var(--linear-bg-elevated))] border border-[hsl(var(--linear-border))] rounded-lg p-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  // Preparar datos para scatter plot: CPL vs EBITDA medio
  const scatterData = channelMetrics
    .filter(cm => cm.leads > 0)
    .map(cm => {
      const quality = qualityMetrics.find(q => q.channel === cm.channel);
      return {
        ...cm,
        qualityScore: quality?.qualityScore || 0,
        highValuePercentage: quality?.highValuePercentage || 0,
        z: cm.leads, // tamaño del punto
      };
    });

  // Identificar el mejor y peor canal
  const bestChannel = [...qualityMetrics].sort((a, b) => {
    // Balance entre calidad y coste
    const aScore = a.qualityScore - (a.costPerHighValueLead / 100);
    const bScore = b.qualityScore - (b.costPerHighValueLead / 100);
    return bScore - aScore;
  })[0];

  const worstEfficiency = channelMetrics.reduce((worst, current) => {
    if (current.leads === 0) return worst;
    const currentEfficiency = current.avgEbitda / (current.cpl || 1);
    const worstEfficiency = worst.avgEbitda / (worst.cpl || 1);
    return currentEfficiency < worstEfficiency ? current : worst;
  }, channelMetrics[0]);

  return (
    <div className="bg-[hsl(var(--linear-bg-elevated))] border border-[hsl(var(--linear-border))] rounded-lg p-6">
      <h3 className="text-sm font-medium mb-4">Calidad vs Coste</h3>

      {/* Scatter plot: CPL vs Quality Score */}
      {showCosts && scatterData.length > 1 && (
        <div className="h-56 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                type="number"
                dataKey="cpl" 
                name="CPL"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(v) => formatCurrency(v)}
                label={{ value: 'CPL', position: 'bottom', fontSize: 10 }}
              />
              <YAxis 
                type="number"
                dataKey="avgEbitda"
                name="EBITDA Medio"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(v) => formatCurrency(v)}
                label={{ value: 'EBITDA Medio', angle: -90, position: 'insideLeft', fontSize: 10 }}
              />
              <ZAxis type="number" dataKey="z" range={[50, 400]} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={scatterData} shape="circle">
                {scatterData.map((entry, index) => (
                  <Cell 
                    key={index} 
                    fill={getQualityColor(entry.qualityScore)}
                    fillOpacity={0.7}
                    stroke={getQualityColor(entry.qualityScore)}
                    strokeWidth={2}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Tamaño = volumen de leads • Color = quality score
          </p>
        </div>
      )}

      {/* Quality ranking table */}
      <div className="border border-[hsl(var(--linear-border))] rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-medium">Canal</TableHead>
              <TableHead className="text-xs font-medium text-right">Quality</TableHead>
              <TableHead className="text-xs font-medium text-right">% Alto Valor</TableHead>
              <TableHead className="text-xs font-medium text-right">EBITDA Medio</TableHead>
              {showCosts && (
                <TableHead className="text-xs font-medium text-right">Coste/Alto Valor</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {qualityMetrics.map((metric, index) => (
              <TableRow key={metric.channel} className="hover:bg-muted/30">
                <TableCell className="text-sm">
                  <div className="flex items-center gap-2">
                    {index === 0 && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                    <span className="font-medium">{metric.channelLabel}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      metric.qualityScore >= 70 ? "border-emerald-500 text-emerald-600" :
                      metric.qualityScore >= 40 ? "border-amber-500 text-amber-600" :
                      "border-red-500 text-red-600"
                    )}
                  >
                    {metric.qualityScore.toFixed(0)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-right">
                  {metric.highValuePercentage.toFixed(1)}%
                </TableCell>
                <TableCell className="text-sm text-right font-medium">
                  {metric.avgEbitda > 0 ? formatCurrency(metric.avgEbitda) : '-'}
                </TableCell>
                {showCosts && (
                  <TableCell className={cn(
                    "text-sm text-right font-medium",
                    metric.costPerHighValueLead > 500 ? "text-red-600" :
                    metric.costPerHighValueLead > 200 ? "text-amber-600" : "text-emerald-600"
                  )}>
                    {metric.costPerHighValueLead > 0 ? formatCurrency(metric.costPerHighValueLead) : '-'}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Insights */}
      {showCosts && bestChannel && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600 mt-0.5" />
            <div className="text-xs">
              <p className="font-medium text-emerald-600">Mejor relación calidad/coste</p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{bestChannel.channelLabel}</span>
                {' '}tiene un quality score de {bestChannel.qualityScore.toFixed(0)} 
                con un coste por lead alto valor de {formatCurrency(bestChannel.costPerHighValueLead)}
              </p>
            </div>
          </div>
          
          {worstEfficiency && worstEfficiency.channel !== bestChannel.channel && (
            <div className="flex items-start gap-2 mt-3 pt-3 border-t border-[hsl(var(--linear-border))]">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium text-amber-600">Oportunidad de optimización</p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">{worstEfficiency.channelLabel}</span>
                  {' '}tiene CPL de {formatCurrency(worstEfficiency.cpl)} pero EBITDA medio de solo {formatCurrency(worstEfficiency.avgEbitda)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QualityVsCostMatrix;
