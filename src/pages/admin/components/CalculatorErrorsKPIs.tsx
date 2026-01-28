// ============= CALCULATOR ERRORS KPIs =============
// Component showing key metrics for calculator errors

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, Calculator, Wifi, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalculatorErrorStats } from '@/features/valuation/hooks/useCalculatorErrors';

interface CalculatorErrorsKPIsProps {
  stats: CalculatorErrorStats;
  isLoading: boolean;
}

export const CalculatorErrorsKPIs = ({ stats, isLoading }: CalculatorErrorsKPIsProps) => {
  const kpis = [
    {
      title: 'Total Errores',
      value: stats.total,
      icon: Bug,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Errores Cálculo',
      value: stats.byType.calculation,
      icon: Calculator,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Errores Red',
      value: stats.byType.network,
      icon: Wifi,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Último Error',
      value: stats.lastError
        ? formatDistanceToNow(new Date(stats.lastError), { addSuffix: true, locale: es })
        : 'N/A',
      icon: Clock,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      isText: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpi.isText ? 'text-sm' : ''}`}>
              {kpi.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
