import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScenarioResult } from '@/types/valuationV3';
import { TrendingUp, TrendingDown, Minus, Calculator } from 'lucide-react';

interface ScenarioCardProps {
  result: ScenarioResult;
  isCustom?: boolean;
  customValue?: number;
  onCustomValueChange?: (value: number) => void;
  className?: string;
}

const ScenarioCard = ({ 
  result, 
  isCustom = false, 
  customValue, 
  onCustomValueChange,
  className = '' 
}: ScenarioCardProps) => {
  const { scenario, valuation, taxCalculation, roi, netReturn } = result;
  
  const getTrendIcon = () => {
    if (scenario.type === 'optimistic') return <TrendingUp className="h-4 w-4" />;
    if (scenario.type === 'conservative') return <TrendingDown className="h-4 w-4" />;
    if (scenario.type === 'custom') return <Calculator className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  const formatPercentage = (value: number) => 
    `${value.toFixed(1)}%`;

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getTrendIcon()}
            {scenario.name}
          </CardTitle>
          <Badge 
            variant="secondary"
            style={{ backgroundColor: scenario.color + '20', color: scenario.color }}
          >
            {scenario.type === 'custom' ? 'Personalizado' : `${(scenario.multiplier * 100).toFixed(0)}%`}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{scenario.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Valor de venta */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Valor de Venta
          </label>
          {isCustom ? (
            <Input
              type="number"
              value={customValue || valuation}
              onChange={(e) => onCustomValueChange?.(Number(e.target.value))}
              className="text-lg font-semibold"
              placeholder="Introduce valor personalizado"
            />
          ) : (
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(valuation)}
            </div>
          )}
        </div>

        {/* Métricas fiscales */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Impuestos</div>
            <div className="text-lg font-semibold text-destructive">
              {formatCurrency(taxCalculation.totalTax)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatPercentage(taxCalculation.effectiveTaxRate * 100)}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-muted-foreground">Neto</div>
            <div className="text-lg font-semibold text-primary">
              {formatCurrency(netReturn)}
            </div>
            <div className="text-xs text-muted-foreground">
              ROI: {formatPercentage(roi)}
            </div>
          </div>
        </div>

        {/* Beneficios fiscales */}
        {(taxCalculation.reinvestmentBenefit > 0 || taxCalculation.vitaliciaBenefit > 0) && (
          <div className="pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground mb-1">Beneficios Fiscales</div>
            {taxCalculation.reinvestmentBenefit > 0 && (
              <div className="text-sm text-accent">
                Reinversión: {formatCurrency(taxCalculation.reinvestmentBenefit)}
              </div>
            )}
            {taxCalculation.vitaliciaBenefit > 0 && (
              <div className="text-sm text-accent">
                Renta Vitalicia: {formatCurrency(taxCalculation.vitaliciaBenefit)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScenarioCard;