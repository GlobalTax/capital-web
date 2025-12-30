// =============================================
// PASO 4: Múltiplos y Valoración
// =============================================

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ProfessionalValuationData, ValuationCalculationResult } from '@/types/professionalValuation';
import { formatCurrencyEUR, formatNumber } from '@/utils/professionalValuationCalculation';
import { BarChart3, TrendingUp, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiplesStepProps {
  data: ProfessionalValuationData;
  calculatedValues: ValuationCalculationResult | null;
  updateField: <K extends keyof ProfessionalValuationData>(
    field: K,
    value: ProfessionalValuationData[K]
  ) => void;
}

// Exportar función de validación para uso externo
export function isMultipleOutOfRange(
  multipleUsed: number,
  multipleLow: number,
  multipleHigh: number
): boolean {
  return multipleUsed < multipleLow || multipleUsed > multipleHigh;
}

export function isMultipleJustificationValid(justification: string | undefined): boolean {
  return (justification?.trim().length || 0) >= 20;
}

export function MultiplesStep({ data, calculatedValues, updateField }: MultiplesStepProps) {
  // Fallback cuando no hay valores calculados - permitir entrada manual
  if (!calculatedValues) {
    const manualMultiple = data.ebitdaMultipleUsed || 6;
    
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-amber-800 font-medium">
                  Introduce un EBITDA positivo en el paso anterior para calcular la valoración automáticamente.
                </p>
                <p className="text-amber-700 text-sm">
                  Mientras tanto, puedes establecer un múltiplo EBITDA manualmente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Múltiplo EBITDA (manual)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="manualMultiple">Múltiplo EBITDA</Label>
              <Input
                id="manualMultiple"
                type="number"
                value={manualMultiple}
                onChange={(e) => updateField('ebitdaMultipleUsed', parseFloat(e.target.value) || 6)}
                step={0.1}
                min={1}
                max={20}
                className="w-24"
              />
              <span className="text-muted-foreground">x EBITDA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              El múltiplo típico en España oscila entre 4x y 8x dependiendo del sector y tamaño de la empresa.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { normalizedEbitda, multipleLow, multipleHigh, valuationLow, valuationHigh } = calculatedValues;
  const multipleUsed = data.ebitdaMultipleUsed || (multipleLow + multipleHigh) / 2;
  const valuationCentral = normalizedEbitda * multipleUsed;

  // Detectar si el múltiplo está fuera del rango
  const isOutOfRange = isMultipleOutOfRange(multipleUsed, multipleLow, multipleHigh);
  const deviationPercentage = isOutOfRange 
    ? multipleUsed < multipleLow 
      ? ((multipleLow - multipleUsed) / multipleLow * 100).toFixed(0)
      : ((multipleUsed - multipleHigh) / multipleHigh * 100).toFixed(0)
    : 0;

  // Verificar justificación
  const hasJustification = isMultipleJustificationValid(data.multipleJustification);

  // Calcular posición del slider (0-100) - clamp para valores fuera de rango
  const clampedMultiple = Math.max(multipleLow, Math.min(multipleHigh, multipleUsed));
  const sliderValue = ((clampedMultiple - multipleLow) / (multipleHigh - multipleLow)) * 100;

  const handleSliderChange = (value: number[]) => {
    const newMultiple = multipleLow + (value[0] / 100) * (multipleHigh - multipleLow);
    updateField('ebitdaMultipleUsed', Math.round(newMultiple * 10) / 10);
  };

  return (
    <div className="space-y-6">
      {/* Resumen EBITDA */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">EBITDA Normalizado</p>
              <p className="text-3xl font-bold text-primary">{formatCurrencyEUR(normalizedEbitda)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Sector</p>
              <p className="font-medium">{data.sector}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advertencia: Múltiplo fuera de rango */}
      {isOutOfRange && (
        <Card className="border-amber-400 bg-amber-50 animate-in fade-in">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-amber-800 font-medium">
                  Múltiplo fuera del rango del sector ({formatNumber(multipleLow, 1)}x - {formatNumber(multipleHigh, 1)}x)
                </p>
                <p className="text-amber-700 text-sm">
                  El múltiplo seleccionado ({formatNumber(multipleUsed, 1)}x) está un {deviationPercentage}% 
                  {multipleUsed < multipleLow ? ' por debajo' : ' por encima'} del rango típico.
                  <strong> Es obligatorio justificar esta desviación.</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rango de múltiplos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Múltiplos EBITDA del sector
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visualización del rango */}
          <div className="relative pt-8 pb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Conservador</span>
              <span>Mercado</span>
              <span>Optimista</span>
            </div>
            
            <div className="h-3 bg-gradient-to-r from-amber-200 via-green-200 to-blue-200 rounded-full relative">
              {/* Marcadores */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-amber-500 rounded-full"
                style={{ left: '0%' }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-green-500 rounded-full"
                style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full"
                style={{ left: '100%', transform: 'translate(-100%, -50%)' }}
              />
            </div>
            
            <div className="flex justify-between text-lg font-bold mt-2">
              <span className="text-amber-600">{formatNumber(multipleLow, 1)}x</span>
              <span className="text-green-600">{formatNumber((multipleLow + multipleHigh) / 2, 1)}x</span>
              <span className="text-blue-600">{formatNumber(multipleHigh, 1)}x</span>
            </div>
          </div>

          {/* Selector de múltiplo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Múltiplo seleccionado</Label>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-2xl font-bold",
                  isOutOfRange ? "text-amber-600" : "text-primary"
                )}>
                  {formatNumber(multipleUsed, 1)}x
                </span>
                {isOutOfRange && (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </div>
            </div>
            
            <Slider
              value={[sliderValue]}
              onValueChange={handleSliderChange}
              max={100}
              step={1}
              className="w-full"
            />

            <div className="flex gap-2">
              <Input
                type="number"
                value={multipleUsed}
                onChange={(e) => updateField('ebitdaMultipleUsed', parseFloat(e.target.value) || multipleLow)}
                step={0.1}
                min={1}
                max={20}
                className={cn("w-24", isOutOfRange && "border-amber-500 focus:border-amber-600")}
              />
              <span className="text-muted-foreground self-center">x EBITDA</span>
            </div>
          </div>

          {/* Justificación */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="multipleJustification">
                Justificación del múltiplo
                {isOutOfRange && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              {isOutOfRange && !hasJustification && (
                <span className="text-xs text-red-500">(Obligatorio - mínimo 20 caracteres)</span>
              )}
            </div>
            <Textarea
              id="multipleJustification"
              value={data.multipleJustification || ''}
              onChange={(e) => updateField('multipleJustification', e.target.value)}
              placeholder={isOutOfRange 
                ? "OBLIGATORIO: Explica por qué el múltiplo está fuera del rango del sector..."
                : "Opcional: Explica por qué has elegido este múltiplo (posición competitiva, crecimiento, dependencia del propietario...)"
              }
              rows={isOutOfRange ? 4 : 3}
              className={cn(
                isOutOfRange && !hasJustification && "border-red-300 focus:border-red-500"
              )}
            />
            {isOutOfRange && (
              <p className={cn(
                "text-xs",
                hasJustification ? "text-green-600" : "text-muted-foreground"
              )}>
                Caracteres: {data.multipleJustification?.length || 0}/20 mínimo
                {hasJustification && " ✓"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultado de valoración */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Resultado de la Valoración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Valoración Baja</p>
              <p className="text-xl font-bold text-amber-700">
                {formatCurrencyEUR(valuationLow)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(multipleLow, 1)}x EBITDA
              </p>
            </div>

            <div className={cn(
              "text-center p-4 rounded-lg border-2",
              isOutOfRange 
                ? "bg-amber-50 border-amber-400" 
                : "bg-primary/10 border-primary"
            )}>
              <p className="text-sm text-muted-foreground mb-1">Valoración Central</p>
              <p className={cn(
                "text-3xl font-bold",
                isOutOfRange ? "text-amber-700" : "text-primary"
              )}>
                {formatCurrencyEUR(valuationCentral)}
              </p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                {formatNumber(multipleUsed, 1)}x EBITDA
                {isOutOfRange && <AlertTriangle className="w-3 h-3 text-amber-500" />}
              </p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Valoración Alta</p>
              <p className="text-xl font-bold text-blue-700">
                {formatCurrencyEUR(valuationHigh)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(multipleHigh, 1)}x EBITDA
              </p>
            </div>
          </div>

          {/* Rango formateado */}
          <div className="mt-6 p-4 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Rango de valoración estimado</p>
            <p className="text-2xl font-bold">
              {formatCurrencyEUR(valuationLow)} - {formatCurrencyEUR(valuationHigh)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Nota informativa */}
      <div className="flex gap-2 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Los múltiplos están basados en transacciones comparables del sector en España.
          La valoración final dependerá de factores específicos de la empresa.
        </p>
      </div>
    </div>
  );
}
