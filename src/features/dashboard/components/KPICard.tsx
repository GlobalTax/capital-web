// ============= KPI CARD COMPONENT =============
// Componente reutilizable para mostrar KPIs

import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  className?: string;
}

const KPICard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  trend = 'neutral',
  subtitle,
  className
}: KPICardProps) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {getTrendIcon()}
        </div>
        {subtitle && (
          <p className={cn("text-xs mt-1", getTrendColor())}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

KPICard.displayName = 'KPICard';

export { KPICard };