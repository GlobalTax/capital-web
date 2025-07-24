// ============= MARKETING OVERVIEW COMPONENT =============
// Componente principal de vista general de marketing

import React, { memo, useMemo } from 'react';
import { Users, TrendingUp, Activity, Eye } from 'lucide-react';
import { KPICard } from './KPICard';
import { ConversionChart } from './ConversionChart';
import { LeadScoringCard } from './LeadScoringCard';
import type { MarketingMetrics } from '@/core/types';

interface MarketingOverviewProps {
  metrics: MarketingMetrics;
}

const MarketingOverview = memo(({ metrics }: MarketingOverviewProps) => {
  
  // Memoizar los KPIs
  const kpis = useMemo(() => {
    const conversionTrend: 'up' | 'down' | 'neutral' = metrics.leadConversionRate > 2 ? 'up' : 'neutral';
    const scoreTrend: 'up' | 'down' | 'neutral' = metrics.averageLeadScore > 60 ? 'up' : 'neutral';
    
    return [
      {
        title: 'Visitantes Totales',
        value: metrics.totalVisitors.toLocaleString(),
        icon: Users,
        trend: 'neutral' as const,
        subtitle: `${metrics.identifiedCompanies} empresas identificadas`
      },
      {
        title: 'Leads Generados',
        value: metrics.totalLeads.toLocaleString(),
        icon: TrendingUp,
        trend: 'up' as const,
        subtitle: `${metrics.qualifiedLeads} calificados`
      },
      {
        title: 'Vistas de Contenido',
        value: metrics.contentMetrics.totalViews.toLocaleString(),
        icon: Eye,
        trend: 'neutral' as const,
        subtitle: `${metrics.contentMetrics.totalPosts} posts publicados`
      },
      {
        title: 'Tasa de Conversión',
        value: `${metrics.leadConversionRate.toFixed(1)}%`,
        icon: Activity,
        trend: conversionTrend,
        subtitle: `Score promedio: ${metrics.averageLeadScore}`
      }
    ];
  }, [metrics]);

  // Memoizar datos del gráfico
  const chartData = useMemo(() => [
    { stage: 'Visitantes', count: metrics.totalVisitors },
    { stage: 'Leads', count: metrics.totalLeads },
    { stage: 'Calificados', count: metrics.qualifiedLeads },
    { stage: 'Calientes', count: metrics.leadScoring.hotLeads }
  ], [metrics]);

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trend={kpi.trend}
            subtitle={kpi.subtitle}
          />
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Conversión */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Embudo de Conversión</h3>
          <ConversionChart data={chartData} />
        </div>

        {/* Lead Scoring */}
        <LeadScoringCard metrics={metrics.leadScoring} />
      </div>
    </div>
  );
});

MarketingOverview.displayName = 'MarketingOverview';

export { MarketingOverview };