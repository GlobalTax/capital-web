// ============= METRICS KPI SUMMARY =============
// Resumen de KPIs principales de leads

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, Trophy, XCircle, TrendingUp, Activity } from 'lucide-react';

interface MetricsKPISummaryProps {
  totals: {
    totalLeads: number;
    activeLeads: number;
    wonLeads: number;
    lostLeads: number;
  };
  isLoading?: boolean;
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('es-ES').format(value);
};

const formatPercent = (value: number, total: number) => {
  if (total === 0) return '0%';
  return new Intl.NumberFormat('es-ES', { 
    minimumFractionDigits: 1, 
    maximumFractionDigits: 1 
  }).format((value / total) * 100) + '%';
};

export const MetricsKPISummary: React.FC<MetricsKPISummaryProps> = ({
  totals,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const conversionRate = totals.totalLeads > 0 
    ? ((totals.wonLeads / totals.totalLeads) * 100).toFixed(1) 
    : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Leads */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Leads</span>
          </div>
          <p className="text-3xl font-bold text-blue-700">{formatNumber(totals.totalLeads)}</p>
          <p className="text-xs text-blue-600/70 mt-1">En el sistema</p>
        </CardContent>
      </Card>

      {/* Active Leads */}
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Activos</span>
          </div>
          <p className="text-3xl font-bold text-amber-700">{formatNumber(totals.activeLeads)}</p>
          <p className="text-xs text-amber-600/70 mt-1">
            {formatPercent(totals.activeLeads, totals.totalLeads)} del total
          </p>
        </CardContent>
      </Card>

      {/* Won Leads */}
      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <Trophy className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Ganados</span>
          </div>
          <p className="text-3xl font-bold text-emerald-700">{formatNumber(totals.wonLeads)}</p>
          <p className="text-xs text-emerald-600/70 mt-1">
            {conversionRate}% conversión
          </p>
        </CardContent>
      </Card>

      {/* Lost Leads */}
      <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <XCircle className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Perdidos</span>
          </div>
          <p className="text-3xl font-bold text-red-700">{formatNumber(totals.lostLeads)}</p>
          <p className="text-xs text-red-600/70 mt-1">
            {formatPercent(totals.lostLeads, totals.totalLeads)} del total
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
