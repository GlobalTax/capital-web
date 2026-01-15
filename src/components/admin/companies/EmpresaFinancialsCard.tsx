import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Euro, TrendingUp, Users, Wallet, BarChart3 } from 'lucide-react';
import { Empresa } from '@/hooks/useEmpresas';
import { formatCompactCurrency } from '@/shared/utils/format';

interface EmpresaFinancialsCardProps {
  empresa: Empresa;
}

export const EmpresaFinancialsCard: React.FC<EmpresaFinancialsCardProps> = ({ empresa }) => {
  const margin = empresa.ebitda && empresa.facturacion 
    ? ((empresa.ebitda / empresa.facturacion) * 100).toFixed(1) 
    : null;

  const financialMetrics = [
    {
      label: 'Facturación',
      value: empresa.facturacion ? formatCompactCurrency(empresa.facturacion) : '-',
      icon: Euro,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'EBITDA',
      value: empresa.ebitda ? formatCompactCurrency(empresa.ebitda) : '-',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Margen',
      value: margin ? `${margin}%` : '-',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Empleados',
      value: empresa.empleados?.toString() || '-',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Deuda',
      value: empresa.deuda ? formatCompactCurrency(empresa.deuda) : '-',
      icon: Wallet,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Capital Circ.',
      value: empresa.capital_circulante ? formatCompactCurrency(empresa.capital_circulante) : '-',
      icon: Wallet,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Euro className="h-4 w-4" />
          Datos Financieros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {financialMetrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${metric.bgColor} mb-2`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <p className="text-lg font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
