// ============= GOOGLE ADS KPI CARDS =============

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Euro, CalendarDays, MousePointerClick, Target, TrendingUp, BarChart3,
} from 'lucide-react';
import { GoogleAdsGlobalStats } from './types';

interface Props {
  stats: GoogleAdsGlobalStats;
}

const fmtCurrency = (v: number) => {
  if (v === 0) return '—';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
};
const fmtNumber = (v: number) => (v === 0 ? '—' : new Intl.NumberFormat('es-ES').format(Math.round(v)));
const fmtPercent = (v: number) => (v === 0 ? '—' : `${v.toFixed(2)}%`);

export const GoogleAdsKPIs: React.FC<Props> = ({ stats }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <BarChart3 className="h-4 w-4 text-primary" />
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resumen Global</h3>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-primary/70 mb-2">
            <Euro className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Gasto Total</span>
          </div>
          <p className="text-2xl font-bold text-primary">{fmtCurrency(stats.totalSpend)}</p>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <MousePointerClick className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Clics</span>
          </div>
          <p className="text-2xl font-bold">{fmtNumber(stats.totalClicks)}</p>
          <p className="text-xs text-muted-foreground mt-1">CPC: {fmtCurrency(stats.avgCpc)}</p>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Conversiones</span>
          </div>
          <p className="text-2xl font-bold">{fmtNumber(stats.totalConversions)}</p>
          <p className="text-xs text-muted-foreground mt-1">CPA: {fmtCurrency(stats.avgCpa)}</p>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider font-medium">CTR</span>
          </div>
          <p className="text-2xl font-bold">{fmtPercent(stats.avgCtr)}</p>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Euro className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider font-medium">CPM</span>
          </div>
          <p className="text-2xl font-bold">{fmtCurrency(stats.avgCpm)}</p>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CalendarDays className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Días Activos</span>
          </div>
          <p className="text-2xl font-bold">{stats.activeDays}</p>
          <p className="text-xs text-muted-foreground mt-1">{fmtCurrency(stats.avgSpendPerDay)}/día</p>
        </CardContent>
      </Card>
    </div>
  </div>
);
