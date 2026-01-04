import React from 'react';
import { TaxCalculationResult } from '@/utils/taxCalculation';
import { TaxFormData } from '@/hooks/useTaxCalculator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, TrendingUp, Percent, Euro, PiggyBank, Phone, ArrowRight } from 'lucide-react';

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
  const totalBenefits = result.abatementBenefit + result.reinvestmentBenefit + result.vitaliciaBenefit + result.article21Benefit;
  const hasBenefits = totalBenefits > 0;
  const hasArticle21 = result.article21Benefit > 0;

  return (
    <div className="space-y-6">
      {/* Botón volver */}
      <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Modificar datos
      </Button>

      {/* Resumen Principal */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-center gap-3 pb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
              1
            </span>
            <h3 className="text-lg font-semibold text-foreground">Resumen de la Operación</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Precio de Venta</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(result.salePrice)}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Valor de Adquisición</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(result.acquisitionValue)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">Ganancia Patrimonial</span>
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
        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30 overflow-hidden">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3 pb-2">
              <span className="inline-flex items-center justify-center w-7 h-7 text-xs font-semibold bg-emerald-500 text-white rounded-full">
                <PiggyBank className="h-4 w-4" />
              </span>
              <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">Beneficios Fiscales</h3>
            </div>

            {/* Art. 21 LIS - Exención participaciones significativas */}
            {hasArticle21 && (
              <div className="p-4 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Exención Art. 21 LIS (99%)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    -{formatCurrency(result.article21Benefit)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span>Plusvalía exenta:</span>
                    <span className="ml-1 font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(result.article21Benefit)}
                    </span>
                  </div>
                  <div>
                    <span>Plusvalía tributable (1%):</span>
                    <span className="ml-1 font-medium text-foreground">
                      {formatCurrency(result.taxableGain)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {result.abatementBenefit > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-foreground">Coeficientes de abatimiento (pre-1995)</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  -{formatCurrency(result.abatementBenefit)}
                </span>
              </div>
            )}
            {result.reinvestmentBenefit > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-foreground">Exención por reinversión</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  -{formatCurrency(result.reinvestmentBenefit)}
                </span>
              </div>
            )}
            {result.vitaliciaBenefit > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-foreground">Exención renta vitalicia (+65)</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  -{formatCurrency(result.vitaliciaBenefit)}
                </span>
              </div>
            )}
            
            {!hasArticle21 && (
              <>
                <Separator className="bg-emerald-200/50 dark:bg-emerald-800/30" />
                <div className="flex justify-between items-center font-medium pt-1">
                  <span className="text-foreground">Ganancia tributable</span>
                  <span className="text-lg font-bold text-foreground">{formatCurrency(result.taxableGain)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Desglose de Impuestos */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3 pb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
              2
            </span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Desglose de Impuestos</h3>
              <p className="text-xs text-muted-foreground">
                {formData.taxpayerType === 'individual' ? 'IRPF 2025' : 'Impuesto de Sociedades'}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            {result.taxBreakdown.map((bracket, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b border-border/30 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{bracket.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(bracket.amount)} × {bracket.rate}%
                  </p>
                </div>
                <span className="font-semibold text-foreground">
                  {formatCurrency(bracket.amount * (bracket.rate / 100))}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resultado Final */}
      <Card className="border-2 border-primary bg-primary/5 overflow-hidden">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3 pb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
              3
            </span>
            <h3 className="text-lg font-semibold text-foreground">Resultado Final</h3>
          </div>

          <div className="flex justify-between items-center py-3 bg-destructive/5 px-4 rounded-xl">
            <span className="font-medium text-foreground">Impuesto Total</span>
            <span className="text-xl font-bold text-destructive">{formatCurrency(result.totalTax)}</span>
          </div>

          <div className="flex justify-between items-center py-2 px-1">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tipo Efectivo</span>
            </div>
            <span className="font-semibold text-foreground">{formatPercent(result.effectiveTaxRate)}</span>
          </div>

          <Separator />

          <div className="flex justify-between items-center py-3 px-4 bg-primary/10 rounded-xl">
            <div className="flex items-center gap-3">
              <Euro className="h-5 w-5 text-primary" />
              <span className="text-base font-semibold text-foreground">Neto Después de Impuestos</span>
            </div>
            <span className="text-2xl font-bold text-primary">{formatCurrency(result.netAfterTax)}</span>
          </div>
        </CardContent>
      </Card>

      {/* CTA Asesoramiento */}
      <Card className="bg-muted/30 border-border/50 overflow-hidden">
        <CardContent className="pt-6 text-center space-y-4">
          <h3 className="font-semibold text-lg text-foreground">¿Quieres optimizar tu fiscalidad?</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Nuestros asesores pueden ayudarte a encontrar la mejor estrategia fiscal para tu situación.
          </p>
          <Button asChild className="gap-2 h-12 px-6 rounded-xl group">
            <a href="https://capittal.es/contacto" target="_blank" rel="noopener noreferrer">
              <Phone className="h-4 w-4" />
              Hablar con un asesor
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center px-4 leading-relaxed">
        Los cálculos mostrados son orientativos y se basan en la normativa fiscal española vigente (2025).
        Esta herramienta no sustituye el asesoramiento fiscal profesional.
      </p>
    </div>
  );
};
