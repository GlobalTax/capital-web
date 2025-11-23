import React from 'react';
import { KPICard } from '@/features/dashboard/components/KPICard';
import { Users, TrendingUp, RefreshCw, Clock } from 'lucide-react';

interface ValuationKPICardsProps {
  kpis: {
    totalSessions: number;
    conversionRate: number;
    recoveredSessions: number;
    avgTimePerSession: number;
  };
}

export const ValuationKPICards: React.FC<ValuationKPICardsProps> = ({ kpis }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Sesiones"
        value={kpis.totalSessions}
        icon={Users}
        trend="neutral"
        subtitle="Últimos 7 días"
      />
      <KPICard
        title="Tasa de Conversión"
        value={`${kpis.conversionRate}%`}
        icon={TrendingUp}
        trend={kpis.conversionRate > 20 ? 'up' : kpis.conversionRate < 10 ? 'down' : 'neutral'}
        subtitle={kpis.conversionRate > 20 ? '+5% vs anterior' : 'Por debajo del objetivo'}
      />
      <KPICard
        title="Sesiones Recuperadas"
        value={kpis.recoveredSessions}
        icon={RefreshCw}
        trend={kpis.recoveredSessions > 0 ? 'up' : 'neutral'}
        subtitle={`Recovery rate activo`}
      />
      <KPICard
        title="Tiempo Promedio"
        value={`${kpis.avgTimePerSession.toFixed(1)}m`}
        icon={Clock}
        trend="neutral"
        subtitle="Por sesión"
      />
    </div>
  );
};
