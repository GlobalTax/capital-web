// ============= CONVERSION FUNNEL BLOCK =============
// Visualización del funnel de conversión por estados

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, TrendingDown, Filter } from 'lucide-react';
import { FunnelStage } from './types';
import { STATUS_COLOR_MAP } from '@/hooks/useContactStatuses';
import { cn } from '@/lib/utils';

interface ConversionFunnelBlockProps {
  data: FunnelStage[];
  isLoading?: boolean;
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('es-ES').format(value);
};

const formatPercent = (value: number) => {
  return new Intl.NumberFormat('es-ES', { 
    minimumFractionDigits: 1, 
    maximumFractionDigits: 1 
  }).format(value) + '%';
};

// Get chart color from status color name
const getChartColor = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    purple: '#a855f7',
    cyan: '#06b6d4',
    indigo: '#6366f1',
    orange: '#f97316',
    yellow: '#eab308',
    green: '#22c55e',
    red: '#ef4444',
    gray: '#6b7280',
    emerald: '#10b981',
    slate: '#64748b',
    amber: '#f59e0b',
    teal: '#14b8a6',
    pink: '#ec4899',
  };
  return colorMap[colorName] || '#6b7280';
};

export const ConversionFunnelBlock: React.FC<ConversionFunnelBlockProps> = ({
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
          <div className="h-96 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  // Filter to show main funnel stages (non-terminal or with significant counts)
  const funnelStages = data
    .filter(s => !s.isTerminal || s.count > 0)
    .slice(0, 10); // Limit to first 10 stages

  if (funnelStages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Funnel de Conversión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay datos suficientes para mostrar el funnel
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...funnelStages.map(s => s.count));
  const firstStageCount = funnelStages[0]?.count || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Funnel de Conversión
        </CardTitle>
        <CardDescription>
          Progresión de leads a través del proceso comercial
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {funnelStages.map((stage, index) => {
            const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            const colors = STATUS_COLOR_MAP[stage.color] || STATUS_COLOR_MAP.gray;
            const conversionFromFirst = (stage.count / firstStageCount) * 100;
            const prevStage = index > 0 ? funnelStages[index - 1] : null;
            const conversionFromPrev = prevStage && prevStage.count > 0 
              ? (stage.count / prevStage.count) * 100 
              : 100;

            return (
              <div key={stage.status_key} className="relative">
                {/* Conversion arrow from previous */}
                {index > 0 && (
                  <div className="flex items-center justify-center py-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ArrowDown className="h-3 w-3" />
                      <span className={cn(
                        conversionFromPrev < 30 ? 'text-red-500' :
                        conversionFromPrev < 50 ? 'text-amber-500' :
                        'text-emerald-500'
                      )}>
                        {formatPercent(conversionFromPrev)}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Funnel bar */}
                <div className="relative">
                  <div 
                    className={cn(
                      "h-12 rounded-lg flex items-center justify-between px-4 transition-all",
                      colors.bg,
                      stage.isTerminal && "opacity-80"
                    )}
                    style={{ 
                      width: `${Math.max(widthPercent, 20)}%`,
                      marginLeft: `${(100 - Math.max(widthPercent, 20)) / 2}%`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={cn("border-0", colors.bg, colors.text)}
                      >
                        {stage.label}
                      </Badge>
                      {stage.isTerminal && (
                        <span className="text-xs text-muted-foreground">(Final)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("font-bold text-lg", colors.text)}>
                        {formatNumber(stage.count)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatPercent(conversionFromFirst)} del total
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary stats */}
        <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{formatNumber(funnelStages[0]?.count || 0)}</p>
            <p className="text-xs text-muted-foreground">Entrada</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">
              {funnelStages.length > 3 ? formatNumber(funnelStages[Math.floor(funnelStages.length / 2)]?.count || 0) : '—'}
            </p>
            <p className="text-xs text-muted-foreground">Mitad</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">
              {formatNumber(funnelStages.filter(s => s.status_key === 'ganado').reduce((sum, s) => sum + s.count, 0))}
            </p>
            <p className="text-xs text-muted-foreground">Ganados</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
