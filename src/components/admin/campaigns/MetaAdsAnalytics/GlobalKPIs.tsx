// ============= GLOBAL KPI CARDS =============

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Euro, 
  CalendarDays, 
  Target, 
  Eye, 
  TrendingUp, 
  MousePointerClick,
  Zap,
  BarChart3
} from 'lucide-react';
import { GlobalStats } from './types';

interface GlobalKPIsProps {
  stats: GlobalStats;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value: number) => {
  if (value === 0) return '—';
  return new Intl.NumberFormat('es-ES').format(Math.round(value));
};

const formatDecimal = (value: number, decimals = 2) => {
  if (value === 0) return '—';
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const GlobalKPIs: React.FC<GlobalKPIsProps> = ({ stats }) => {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Resumen Global
        </h3>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary/70 mb-2">
              <Euro className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider font-medium">Gasto Total</span>
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalSpend)}</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider font-medium">Días Activos</span>
            </div>
            <p className="text-2xl font-bold">{stats.activeDays}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats.avgSpendPerDay)}/día
            </p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider font-medium">Resultados</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(stats.totalResults)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats.avgCostPerResult)}/resultado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Eye className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider font-medium">Impresiones</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(stats.totalImpressions)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              CPM: {formatCurrency(stats.avgCpm)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Zap className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider font-medium">Frecuencia</span>
            </div>
            <p className="text-2xl font-bold">{formatDecimal(stats.avgFrequency)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              media ponderada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      {stats.totalClicks > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-muted/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MousePointerClick className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wider">Clics Totales</span>
              </div>
              <p className="text-lg font-semibold">{formatNumber(stats.totalClicks)}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wider">CPC Medio</span>
              </div>
              <p className="text-lg font-semibold">{formatCurrency(stats.avgCpc)}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
