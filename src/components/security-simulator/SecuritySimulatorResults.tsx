import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download, RotateCcw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import type { SecurityValuationResult } from '@/utils/securityValuation';

interface SecuritySimulatorResultsProps {
  result: SecurityValuationResult;
  companyName: string;
  subsectorLabel: string;
  onReset: () => void;
}

const CHART_COLORS = ['hsl(220, 14%, 10%)', 'hsl(220, 14%, 46%)', 'hsl(220, 14%, 70%)'];

const formatCurrency = (amount: number): string => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M€`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k€`;
  return `${amount.toLocaleString('es-ES')}€`;
};

const SecuritySimulatorResults: React.FC<SecuritySimulatorResultsProps> = ({
  result,
  companyName,
  subsectorLabel,
  onReset,
}) => {
  const { totalValuation, valuationRange, dealStructure, sectorComparables, breakdown } = result;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground mb-1">Simulación de operación · {subsectorLabel}</p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">{companyName}</h2>
      </div>

      {/* Valuation summary */}
      <Card className="p-6 md:p-8 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Conservador</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(valuationRange.min)}</p>
            <p className="text-xs text-muted-foreground">{result.multipleUsed.min}x múltiplo</p>
          </div>
          <div className="md:border-x border-border px-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Valoración estimada</p>
            <p className="text-4xl font-bold text-foreground">{formatCurrency(totalValuation)}</p>
            <p className="text-xs text-muted-foreground">{result.multipleUsed.base}x múltiplo</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Optimista</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(valuationRange.max)}</p>
            <p className="text-xs text-muted-foreground">{result.multipleUsed.max}x múltiplo</p>
          </div>
        </div>
      </Card>

      {/* Breakdown + Deal structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breakdown chart */}
        <Card className="p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Desglose de valoración</h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {breakdown.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 flex-1">
              {breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-foreground">{formatCurrency(item.value)}</span>
                    <span className="text-xs text-muted-foreground ml-2">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Deal structure */}
        <Card className="p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Estructura de operación sugerida</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">Precio fijo</p>
                <p className="text-xs text-muted-foreground">Cobro al cierre</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">{formatCurrency(dealStructure.fixedPrice)}</p>
                <p className="text-xs text-muted-foreground">{dealStructure.fixedPricePercentage}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">Earn-out</p>
                <p className="text-xs text-muted-foreground">Vinculado a retención</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">{formatCurrency(dealStructure.earnOut)}</p>
                <p className="text-xs text-muted-foreground">{dealStructure.earnOutPercentage}%</p>
              </div>
            </div>
            <div className="mt-3 p-3 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground">
                <strong>Condición earn-out:</strong> {dealStructure.earnOutCondition}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sector comparables */}
      <Card className="p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Comparativa del sector</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sectorComparables.map((comp, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm font-medium text-foreground">{comp.label}</p>
              <p className="text-lg font-bold text-foreground mt-1">{comp.multipleRange}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Deal medio: {comp.avgDealSize}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="p-4 rounded-lg border border-border bg-muted/20">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Nota:</strong> Esta simulación es orientativa y se basa en múltiplos de mercado observados en transacciones 
          comparables del sector seguridad en España y Europa. Los valores reales pueden variar significativamente en función 
          de factores específicos de cada empresa. Para una valoración profesional personalizada, contacta con nuestro equipo.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/contacto">
          <Button className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90">
            Solicitar valoración profesional
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Nueva simulación
        </Button>
      </div>
    </div>
  );
};

export default SecuritySimulatorResults;
