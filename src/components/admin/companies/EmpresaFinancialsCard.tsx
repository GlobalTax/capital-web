import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Euro, TrendingUp, Users, BarChart3, FileText, Calendar } from 'lucide-react';
import { Empresa } from '@/hooks/useEmpresas';
import { formatCompactCurrency } from '@/shared/utils/format';

interface EmpresaFinancialsCardProps {
  empresa: Empresa;
}

export const EmpresaFinancialsCard: React.FC<EmpresaFinancialsCardProps> = ({ empresa }) => {
  const margin = empresa.ebitda && empresa.facturacion 
    ? ((empresa.ebitda / empresa.facturacion) * 100).toFixed(1) 
    : empresa.ebitda_margin 
      ? empresa.ebitda_margin.toFixed(1)
      : empresa.margen_ebitda
        ? empresa.margen_ebitda.toFixed(1)
        : null;

  const financialMetrics = [
    {
      label: 'Facturación',
      value: empresa.facturacion ? formatCompactCurrency(empresa.facturacion) : empresa.revenue ? formatCompactCurrency(empresa.revenue) : null,
      icon: Euro,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'EBITDA',
      value: empresa.ebitda ? formatCompactCurrency(empresa.ebitda) : null,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Margen EBITDA',
      value: margin ? `${margin}%` : null,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Empleados',
      value: empresa.empleados?.toString() || null,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const hasAnyFinancial = financialMetrics.some(m => m.value !== null);
  const hasExtraInfo = empresa.cnae_descripcion || empresa.cnae_codigo || empresa.deuda != null || empresa.capital_circulante != null || empresa.año_datos_financieros;

  if (!hasAnyFinancial && !hasExtraInfo) {
    return (
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Euro className="h-4 w-4" />
            Datos Financieros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sin datos financieros disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Euro className="h-4 w-4" />
          Datos Financieros
          {empresa.año_datos_financieros && (
            <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {empresa.año_datos_financieros}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasAnyFinancial && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {financialMetrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${metric.bgColor} mb-2`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <p className="text-lg font-bold">{metric.value || '-'}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Extra financial details */}
        {hasExtraInfo && (
          <div className="border-t pt-3 space-y-2">
            {(empresa.cnae_codigo || empresa.cnae_descripcion) && (
              <div className="flex items-start gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-muted-foreground">CNAE: </span>
                  <span>
                    {empresa.cnae_codigo && <span className="font-mono text-xs">{empresa.cnae_codigo} </span>}
                    {empresa.cnae_descripcion}
                  </span>
                </div>
              </div>
            )}
            {empresa.deuda != null && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-muted-foreground">Deuda:</span>
                <span>{formatCompactCurrency(empresa.deuda)}</span>
              </div>
            )}
            {empresa.capital_circulante != null && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-muted-foreground">Capital circulante:</span>
                <span>{formatCompactCurrency(empresa.capital_circulante)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
