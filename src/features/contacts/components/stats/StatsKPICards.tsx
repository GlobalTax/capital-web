// ============= STATS KPI CARDS =============
// Cards superiores con métricas principales de leads y costes

import React from 'react';
import { TrendingUp, TrendingDown, Users, Euro, Target, UserCheck, Fingerprint, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContactStatsMetrics } from '../../types/stats';

interface StatsKPICardsProps {
  metrics: ContactStatsMetrics;
  showCosts: boolean;
  isLoading?: boolean;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M€`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K€`;
  }
  return `${value.toFixed(0)}€`;
};

const formatNumber = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  isLoading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendLabel,
  color = 'default',
  isLoading 
}) => {
  const colorClasses = {
    default: 'text-foreground',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
  };

  const bgClasses = {
    default: 'bg-muted/50',
    success: 'bg-emerald-500/10',
    warning: 'bg-amber-500/10',
    danger: 'bg-red-500/10',
    info: 'bg-blue-500/10',
  };

  return (
    <div className="bg-[hsl(var(--linear-bg-elevated))] border border-[hsl(var(--linear-border))] rounded-lg p-4 hover:border-[hsl(var(--linear-border-hover))] transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {title}
          </p>
          {isLoading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded mt-1" />
          ) : (
            <p className={cn("text-2xl font-semibold mt-1", colorClasses[color])}>
              {value}
            </p>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className={cn("p-2 rounded-lg", bgClasses[color])}>
          {icon}
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {trend >= 0 ? (
            <TrendingUp className="h-3 w-3 text-emerald-600" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-600" />
          )}
          <span className={cn(
            "text-xs font-medium",
            trend >= 0 ? "text-emerald-600" : "text-red-600"
          )}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
          {trendLabel && (
            <span className="text-xs text-muted-foreground">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

export const StatsKPICards: React.FC<StatsKPICardsProps> = ({ 
  metrics, 
  showCosts,
  isLoading 
}) => {
  const leadsVariation = metrics.previousPeriodLeads > 0 
    ? ((metrics.totalLeads - metrics.previousPeriodLeads) / metrics.previousPeriodLeads) * 100 
    : 0;

  return (
    <div className={cn(
      "grid gap-3",
      showCosts ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6" : "grid-cols-2 md:grid-cols-4"
    )}>
      {/* Total Leads */}
      <KPICard
        title="Total Leads"
        value={formatNumber(metrics.totalLeads)}
        subtitle={`vs ${metrics.previousPeriodLeads} anterior`}
        icon={<Users className="h-4 w-4 text-foreground" />}
        trend={leadsVariation}
        trendLabel="vs anterior"
        isLoading={isLoading}
      />
      
      {/* Leads Únicos */}
      <KPICard
        title="Únicos"
        value={formatNumber(metrics.uniqueLeads)}
        icon={<Fingerprint className="h-4 w-4 text-blue-600" />}
        color="info"
        isLoading={isLoading}
      />
      
      {/* Calificados */}
      <KPICard
        title="Calificados"
        value={formatNumber(metrics.qualifiedLeads)}
        subtitle={`${metrics.totalLeads > 0 ? ((metrics.qualifiedLeads / metrics.totalLeads) * 100).toFixed(1) : 0}% del total`}
        icon={<UserCheck className="h-4 w-4 text-emerald-600" />}
        color="success"
        isLoading={isLoading}
      />
      
      {showCosts && (
        <>
          {/* Coste Total */}
          <KPICard
            title="Coste Total"
            value={formatCurrency(metrics.totalCost)}
            subtitle={`Periodo anterior: ${formatCurrency(metrics.previousPeriodCost)}`}
            icon={<Euro className="h-4 w-4 text-amber-600" />}
            color="warning"
            isLoading={isLoading}
          />
          
          {/* CPL */}
          <KPICard
            title="CPL"
            value={formatCurrency(metrics.cpl)}
            icon={<Target className="h-4 w-4 text-foreground" />}
            trend={-metrics.cplVariation} // Invertido: menor CPL es mejor
            trendLabel="vs anterior"
            color={metrics.cplVariation > 10 ? 'danger' : metrics.cplVariation < -10 ? 'success' : 'default'}
            isLoading={isLoading}
          />
          
          {/* CAC Estimado */}
          <KPICard
            title="CAC Estimado"
            value={formatCurrency(metrics.cacEstimated)}
            subtitle="Por oportunidad válida"
            icon={<Calculator className="h-4 w-4 text-foreground" />}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};

export default StatsKPICards;
