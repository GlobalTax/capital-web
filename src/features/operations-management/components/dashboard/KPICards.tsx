import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Clock, Target, Briefcase, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/format';
import type { OperationsKPIs } from '../../types/operations';

interface KPICardsProps {
  kpis: OperationsKPIs;
}

type TrendType = 'up' | 'down' | 'neutral';

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  const kpiData: Array<{
    title: string;
    value: string;
    icon: React.ElementType;
    trend: TrendType;
    subtitle: string;
    color: string;
  }> = [
    {
      title: 'Operaciones Totales',
      value: kpis.totalOperations.toString(),
      icon: Briefcase,
      trend: (kpis.monthlyGrowth > 0 ? 'up' : kpis.monthlyGrowth < 0 ? 'down' : 'neutral') as TrendType,
      subtitle: `${kpis.monthlyGrowth > 0 ? '+' : ''}${kpis.monthlyGrowth.toFixed(1)}% vs mes anterior`,
      color: 'text-blue-600'
    },
    {
      title: 'Valor Total',
      value: formatCurrency(kpis.totalValue, 'EUR'),
      icon: DollarSign,
      trend: 'neutral' as TrendType,
      subtitle: `Promedio: ${formatCurrency(kpis.averageValue, 'EUR')}`,
      color: 'text-green-600'
    },
    {
      title: 'Pipeline Activo',
      value: formatCurrency(kpis.pipelineValue, 'EUR'),
      icon: Target,
      trend: 'neutral' as TrendType,
      subtitle: 'Operaciones en curso',
      color: 'text-purple-600'
    },
    {
      title: 'Tiempo Medio de Cierre',
      value: `${Math.round(kpis.averageTimeToClose)} días`,
      icon: Clock,
      trend: (kpis.averageTimeToClose < 60 ? 'up' : 'neutral') as TrendType,
      subtitle: 'Desde creación a cierre',
      color: 'text-orange-600'
    },
    {
      title: 'Tasa de Conversión',
      value: `${kpis.conversionRate.toFixed(1)}%`,
      icon: ArrowUpRight,
      trend: (kpis.conversionRate > 30 ? 'up' : 'neutral') as TrendType,
      subtitle: 'Propuestas → Cerradas',
      color: 'text-teal-600'
    }
  ];

  const getTrendIcon = (trend: TrendType) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: TrendType) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {kpiData.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <Icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{kpi.value}</div>
                {getTrendIcon(kpi.trend)}
              </div>
              <p className={`text-xs mt-1 ${getTrendColor(kpi.trend)}`}>
                {kpi.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
