import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ProfessionalValuationData, ValuationCalculationResult } from '@/types/professionalValuation';
import { formatCurrencyEUR, formatNumber } from '@/utils/professionalValuationCalculation';
import { Save, FileText, Zap } from 'lucide-react';

interface QuickEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ProfessionalValuationData;
  calculatedValues: ValuationCalculationResult | null;
  updateField: <K extends keyof ProfessionalValuationData>(field: K, value: ProfessionalValuationData[K]) => void;
  onSave: (isDraft: boolean) => Promise<void>;
  onGeneratePdf?: () => Promise<void>;
  isSaving: boolean;
  isGenerating: boolean;
}

export function QuickEditSheet({
  open,
  onOpenChange,
  data,
  calculatedValues,
  updateField,
  onSave,
  onGeneratePdf,
  isSaving,
  isGenerating,
}: QuickEditSheetProps) {
  if (!calculatedValues) return null;

  const { normalizedEbitda, multipleLow, multipleHigh } = calculatedValues;
  const effectiveLow = data.ebitdaMultipleLow ?? multipleLow;
  const effectiveHigh = data.ebitdaMultipleHigh ?? multipleHigh;
  const multipleUsed = data.ebitdaMultipleUsed || (effectiveLow + effectiveHigh) / 2;

  const valuationCentral = normalizedEbitda * multipleUsed;
  const valuationLow = normalizedEbitda * effectiveLow;
  const valuationHigh = normalizedEbitda * effectiveHigh;

  const clampedMultiple = Math.max(effectiveLow, Math.min(effectiveHigh, multipleUsed));
  const sliderValue = effectiveHigh !== effectiveLow 
    ? ((clampedMultiple - effectiveLow) / (effectiveHigh - effectiveLow)) * 100
    : 50;

  const handleSliderChange = (value: number[]) => {
    const newMultiple = effectiveLow + (value[0] / 100) * (effectiveHigh - effectiveLow);
    updateField('ebitdaMultipleUsed', Math.round(newMultiple * 10) / 10);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Edición rápida
          </SheetTitle>
          <SheetDescription>Ajusta la valoración sin navegar por los pasos</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* EBITDA normalizado - read only */}
          <div className="p-4 bg-primary/5 rounded-lg">
            <p className="text-sm text-muted-foreground">EBITDA Normalizado</p>
            <p className="text-2xl font-bold text-primary">{formatCurrencyEUR(normalizedEbitda)}</p>
          </div>

          {/* Slider múltiplo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Múltiplo EBITDA</Label>
              <span className="text-xl font-bold text-primary">{formatNumber(multipleUsed, 1)}x</span>
            </div>
            <Slider
              value={[sliderValue]}
              onValueChange={handleSliderChange}
              max={100}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatNumber(effectiveLow, 1)}x</span>
              <span>{formatNumber(effectiveHigh, 1)}x</span>
            </div>
            <Input
              type="number"
              value={multipleUsed}
              onChange={(e) => updateField('ebitdaMultipleUsed', parseFloat(e.target.value) || effectiveLow)}
              step={0.1}
              min={1}
              max={20}
              className="w-24"
            />
          </div>

          {/* Resultado */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-muted-foreground">Baja</p>
              <p className="text-sm font-bold text-amber-700">{formatCurrencyEUR(valuationLow)}</p>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg border-2 border-primary">
              <p className="text-xs text-muted-foreground">Central</p>
              <p className="text-lg font-bold text-primary">{formatCurrencyEUR(valuationCentral)}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-muted-foreground">Alta</p>
              <p className="text-sm font-bold text-blue-700">{formatCurrencyEUR(valuationHigh)}</p>
            </div>
          </div>

          {/* Fortalezas */}
          <div className="space-y-2">
            <Label>Fortalezas</Label>
            <Textarea
              value={data.strengths || ''}
              onChange={(e) => updateField('strengths', e.target.value)}
              rows={4}
            />
          </div>

          {/* Debilidades */}
          <div className="space-y-2">
            <Label>Debilidades / Riesgos</Label>
            <Textarea
              value={data.weaknesses || ''}
              onChange={(e) => updateField('weaknesses', e.target.value)}
              rows={4}
            />
          </div>

          {/* Botones */}
          <div className="flex flex-col gap-2 pt-4 border-t">
            <Button onClick={() => onSave(true)} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
            {onGeneratePdf && (
              <Button variant="secondary" onClick={onGeneratePdf} disabled={isGenerating}>
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generando...' : 'Generar PDF'}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}