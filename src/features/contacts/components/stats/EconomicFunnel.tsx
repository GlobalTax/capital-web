// ============= ECONOMIC FUNNEL =============
// Visualización del funnel de leads con costes acumulados

import React from 'react';
import { FunnelStage } from '../../types/stats';
import { cn } from '@/lib/utils';
import { ArrowDown, TrendingDown } from 'lucide-react';

interface EconomicFunnelProps {
  stages: FunnelStage[];
  showCosts: boolean;
  isLoading?: boolean;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K€`;
  return `${value.toFixed(0)}€`;
};

export const EconomicFunnel: React.FC<EconomicFunnelProps> = ({
  stages,
  showCosts,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="bg-[hsl(var(--linear-bg-elevated))] border border-[hsl(var(--linear-border))] rounded-lg p-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const maxCount = stages.length > 0 ? stages[0].count : 1;

  return (
    <div className="bg-[hsl(var(--linear-bg-elevated))] border border-[hsl(var(--linear-border))] rounded-lg p-6">
      <h3 className="text-sm font-medium mb-6">Funnel Económico</h3>

      <div className="space-y-3">
        {stages.map((stage, index) => {
          const widthPercentage = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
          const isFirst = index === 0;
          const isLast = index === stages.length - 1;
          
          return (
            <div key={stage.stage} className="relative">
              {/* Stage bar */}
              <div 
                className={cn(
                  "relative rounded-lg p-4 transition-all",
                  "border border-transparent hover:border-[hsl(var(--linear-border-hover))]"
                )}
                style={{
                  width: `${Math.max(widthPercentage, 30)}%`,
                  marginLeft: `${(100 - Math.max(widthPercentage, 30)) / 2}%`,
                  background: `linear-gradient(135deg, ${stage.color}20 0%, ${stage.color}10 100%)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <div>
                      <p className="text-sm font-medium">{stage.stageLabel}</p>
                      <p className="text-2xl font-bold" style={{ color: stage.color }}>
                        {stage.count}
                      </p>
                    </div>
                  </div>
                  
                  {showCosts && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Coste acumulado</p>
                      <p className="text-lg font-semibold">{formatCurrency(stage.accumulatedCost)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(stage.costPerStage)}/lead
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Conversion arrow */}
              {!isLast && (
                <div className="flex items-center justify-center py-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ArrowDown className="h-3 w-3" />
                    <span className={cn(
                      "font-medium",
                      stage.conversionRate >= 50 ? "text-emerald-600" :
                      stage.conversionRate >= 25 ? "text-amber-600" : "text-red-600"
                    )}>
                      {stage.conversionRate.toFixed(1)}%
                    </span>
                    {stage.conversionRate < 25 && (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[hsl(var(--linear-border))]">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Conversión Total</p>
          <p className={cn(
            "text-xl font-bold",
            stages.length > 0 && stages[0].count > 0
              ? (stages[stages.length - 1].count / stages[0].count) * 100 >= 10
                ? "text-emerald-600"
                : (stages[stages.length - 1].count / stages[0].count) * 100 >= 5
                  ? "text-amber-600"
                  : "text-red-600"
              : "text-muted-foreground"
          )}>
            {stages.length > 0 && stages[0].count > 0
              ? ((stages[stages.length - 1].count / stages[0].count) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
        {showCosts && stages.length > 0 && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Coste por Válido</p>
            <p className="text-xl font-bold">
              {stages[stages.length - 1].count > 0
                ? formatCurrency(stages[0].accumulatedCost / stages[stages.length - 1].count)
                : '-'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EconomicFunnel;
