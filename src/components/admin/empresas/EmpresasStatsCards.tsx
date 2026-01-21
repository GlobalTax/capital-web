// ============= EMPRESAS STATS CARDS =============
// KPI cards compactos para la vista de empresas

import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Star, Target, Euro, TrendingUp } from 'lucide-react';
import { formatCompactCurrency } from '@/shared/utils/format';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  className?: string;
  iconClassName?: string;
}

const StatsCard = memo(({ title, value, icon, subtitle, className, iconClassName }: StatsCardProps) => (
  <Card className={cn("shadow-sm hover:shadow-md transition-shadow", className)}>
    <CardContent className="pt-3 pb-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{title}</p>
          <p className="text-xl font-semibold mt-0.5 truncate">{value}</p>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        <div className={cn("p-2 rounded-lg flex-shrink-0", iconClassName)}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
));

StatsCard.displayName = 'StatsCard';

interface EmpresasStatsCardsProps {
  totalFavorites: number;
  totalEmpresas: number;
  totalTargets: number;
  totalFacturacion: number;
  avgEbitda: number;
  empresasWithEbitda?: number;
}

export const EmpresasStatsCards: React.FC<EmpresasStatsCardsProps> = memo(({
  totalFavorites,
  totalEmpresas,
  totalTargets,
  totalFacturacion,
  avgEbitda,
  empresasWithEbitda = 0,
}) => {
  const targetPercentage = totalEmpresas > 0 
    ? ((totalTargets / totalEmpresas) * 100).toFixed(1) 
    : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <StatsCard
        title="Favoritos"
        value={totalFavorites}
        icon={<Star className="h-4 w-4 text-yellow-600" />}
        iconClassName="bg-yellow-50"
        subtitle="Empresas marcadas"
      />
      <StatsCard
        title="Total Empresas"
        value={totalEmpresas}
        icon={<Building2 className="h-4 w-4 text-slate-600" />}
        iconClassName="bg-slate-100"
        subtitle="En base de datos"
      />
      <StatsCard
        title="Targets"
        value={totalTargets}
        icon={<Target className="h-4 w-4 text-green-600" />}
        iconClassName="bg-green-50"
        subtitle={`${targetPercentage}% del total`}
      />
      <StatsCard
        title="Facturación Total"
        value={totalFacturacion > 0 ? formatCompactCurrency(totalFacturacion) : '-'}
        icon={<Euro className="h-4 w-4 text-blue-600" />}
        iconClassName="bg-blue-50"
        subtitle="Suma acumulada"
      />
      <StatsCard
        title="EBITDA Medio"
        value={avgEbitda > 0 ? formatCompactCurrency(avgEbitda) : '-'}
        icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
        iconClassName="bg-emerald-50"
        subtitle={empresasWithEbitda > 0 ? `De ${empresasWithEbitda} empresas` : 'Sin datos'}
      />
    </div>
  );
});

EmpresasStatsCards.displayName = 'EmpresasStatsCards';

export default EmpresasStatsCards;
