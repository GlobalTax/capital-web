import React from 'react';
import { TaxCalculationResult } from '@/utils/taxCalculation';
import { TaxFormData } from '@/hooks/useTaxCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, TrendingUp, Percent, Euro, PiggyBank, Calculator, Phone } from 'lucide-react';

interface TaxCalculatorResultsProps {
  result: TaxCalculationResult;
  formData: TaxFormData;
  onBack: () => void;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const TaxCalculatorResults: React.FC<TaxCalculatorResultsProps> = ({
  result,
  formData,
  onBack,
}) => {
  const totalBenefits = result.abatementBenefit + result.reinvestmentBenefit + result.vitaliciaBenefit;
  const hasBenefits = totalBenefits > 0;

  return (
    <div className="space-y-6">
      {/* Botón volver */}
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Modificar datos
      </Button>

      {/* Resumen Principal */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-muted-foreground">Resumen Fiscal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Precio de Venta</p>
              <p className="text-xl font-semibold">{formatCurrency(result.salePrice)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor de Adquisición</p>
              <p className="text-xl font-semibold">{formatCurrency(result.acquisitionValue)}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium">Ganancia Patrimonial</span>
            </div>
            <span className="text-xl font-bold text-primary">{formatCurrency(result.capitalGain)}</span>
          </div>

          {result.deductibleExpenses > 0 && (
            <p className="text-sm text-muted-foreground">
              Gastos deducibles estimados: {formatCurrency(result.deductibleExpenses)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Beneficios Aplicados */}
      {hasBenefits && (
        <Card className="border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-green-700 dark:text-green-400">
              <PiggyBank className="h-5 w-5" />
              Beneficios Fiscales Aplicados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.abatementBenefit > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Coeficientes de abatimiento (pre-1995)</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  -{formatCurrency(result.abatementBenefit)}
                </span>
              </div>
            )}
            {result.reinvestmentBenefit > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Exención por reinversión</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  -{formatCurrency(result.reinvestmentBenefit)}
                </span>
              </div>
            )}
            {result.vitaliciaBenefit > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Exención renta vitalicia (+65)</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  -{formatCurrency(result.vitaliciaBenefit)}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-center font-medium">
              <span>Ganancia tributable</span>
              <span>{formatCurrency(result.taxableGain)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Desglose de Impuestos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5 text-primary" />
            Desglose de Impuestos
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({formData.taxpayerType === 'individual' ? 'IRPF 2025' : 'Impuesto de Sociedades'})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {result.taxBreakdown.map((bracket, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium">{bracket.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(bracket.amount)} × {bracket.rate}%
                  </p>
                </div>
                <span className="font-medium">
                  {formatCurrency(bracket.amount * (bracket.rate / 100))}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resultado Final */}
      <Card className="border-2 border-primary">
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium">Impuesto Total</span>
            <span className="font-bold text-destructive">{formatCurrency(result.totalTax)}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tipo Efectivo</span>
            </div>
            <span className="font-medium">{formatPercent(result.effectiveTaxRate)}</span>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Euro className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">Neto Después de Impuestos</span>
            </div>
            <span className="text-2xl font-bold text-primary">{formatCurrency(result.netAfterTax)}</span>
          </div>
        </CardContent>
      </Card>

      {/* CTA Asesoramiento */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6 text-center space-y-4">
          <h3 className="font-semibold text-lg">¿Quieres optimizar tu fiscalidad?</h3>
          <p className="text-sm text-muted-foreground">
            Nuestros asesores pueden ayudarte a encontrar la mejor estrategia fiscal para tu situación.
          </p>
          <Button asChild className="gap-2">
            <a href="https://capittal.es/contacto" target="_blank" rel="noopener noreferrer">
              <Phone className="h-4 w-4" />
              Hablar con un asesor
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center px-4">
        Los cálculos mostrados son orientativos y se basan en la normativa fiscal española vigente (2025).
        Esta herramienta no sustituye el asesoramiento fiscal profesional.
      </p>
    </div>
  );
};
