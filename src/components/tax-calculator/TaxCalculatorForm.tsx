import React from 'react';
import { TaxFormData } from '@/hooks/useTaxCalculator';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Building2, User, Info, Euro, Calendar, Percent } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TaxCalculatorFormProps {
  formData: TaxFormData;
  updateField: <K extends keyof TaxFormData>(field: K, value: TaxFormData[K]) => void;
  onCalculate: () => void;
  isFormValid: boolean;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
};

const InfoTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-muted-foreground cursor-help ml-1" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const TaxCalculatorForm: React.FC<TaxCalculatorFormProps> = ({
  formData,
  updateField,
  onCalculate,
  isFormValid,
}) => {
  return (
    <div className="space-y-6">
      {/* Datos de la Operación */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5 text-primary" />
            Datos de la Operación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Precio de Venta */}
          <div className="space-y-2">
            <Label htmlFor="salePrice" className="flex items-center">
              <Euro className="h-4 w-4 mr-2 text-muted-foreground" />
              Precio de Venta Estimado
              <InfoTooltip content="Valor total por el que esperas vender tu empresa o participaciones." />
            </Label>
            <CurrencyInput
              id="salePrice"
              placeholder="2.000.000"
              value={formData.salePrice}
              onChange={(value) => updateField('salePrice', value)}
              className="text-lg font-medium"
            />
          </div>

          {/* Tipo de Contribuyente */}
          <div className="space-y-3">
            <Label className="flex items-center">
              Tipo de Contribuyente
              <InfoTooltip content="Las personas físicas tributan por IRPF y las sociedades por Impuesto de Sociedades. Los tipos y beneficios fiscales varían." />
            </Label>
            <RadioGroup
              value={formData.taxpayerType}
              onValueChange={(value) => updateField('taxpayerType', value as 'individual' | 'company')}
              className="grid grid-cols-2 gap-3"
            >
              <Label
                htmlFor="individual"
                className={`flex items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.taxpayerType === 'individual'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="individual" id="individual" className="sr-only" />
                <User className="h-5 w-5" />
                <span className="font-medium">Persona Física</span>
              </Label>
              <Label
                htmlFor="company"
                className={`flex items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.taxpayerType === 'company'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="company" id="company" className="sr-only" />
                <Building2 className="h-5 w-5" />
                <span className="font-medium">Sociedad</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Valor de Adquisición */}
          <div className="space-y-2">
            <Label htmlFor="acquisitionValue" className="flex items-center">
              <Euro className="h-4 w-4 mr-2 text-muted-foreground" />
              Valor de Adquisición
              <InfoTooltip content="Precio original al que adquiriste las participaciones o empresa. Se usará para calcular la ganancia patrimonial." />
            </Label>
            <CurrencyInput
              id="acquisitionValue"
              placeholder="500.000"
              value={formData.acquisitionValue}
              onChange={(value) => updateField('acquisitionValue', value)}
            />
          </div>

          {/* Fecha de Adquisición */}
          <div className="space-y-2">
            <Label htmlFor="acquisitionDate" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              Fecha de Adquisición
              <InfoTooltip content="Si adquiriste antes del 31/12/1994, podrías beneficiarte de coeficientes de abatimiento que reducen la ganancia tributable." />
            </Label>
            <Input
              id="acquisitionDate"
              type="date"
              value={formData.acquisitionDate}
              onChange={(e) => updateField('acquisitionDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Porcentaje a Vender */}
          <div className="space-y-3">
            <Label className="flex items-center">
              <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
              Porcentaje a Vender: {formData.salePercentage}%
              <InfoTooltip content="Indica qué porcentaje de tu participación vas a vender. Puedes simular ventas parciales." />
            </Label>
            <Slider
              value={[formData.salePercentage]}
              onValueChange={([value]) => updateField('salePercentage', value)}
              min={1}
              max={100}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Base Imponible (solo sociedades) */}
          {formData.taxpayerType === 'company' && (
            <div className="space-y-2">
              <Label htmlFor="currentTaxBase" className="flex items-center">
                <Euro className="h-4 w-4 mr-2 text-muted-foreground" />
                Base Imponible Actual (anual)
                <InfoTooltip content="Si tu base imponible es inferior a 1M€, puedes beneficiarte del tipo reducido para PYMEs (15% primeros 300K€)." />
              </Label>
              <CurrencyInput
                id="currentTaxBase"
                placeholder="800.000"
                value={formData.currentTaxBase}
                onChange={(value) => updateField('currentTaxBase', value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Beneficios Fiscales */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Percent className="h-5 w-5 text-primary" />
            Beneficios Fiscales Aplicables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {formData.taxpayerType === 'individual' ? (
            /* Renta Vitalicia - Solo personas físicas */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="vitaliciaPlan" className="flex items-center cursor-pointer">
                  Renta Vitalicia (+65 años)
                  <InfoTooltip content="Mayores de 65 años pueden destinar la ganancia a una renta vitalicia y quedar exentos del IRPF sobre esa parte (máximo 240.000€)." />
                </Label>
                <Switch
                  id="vitaliciaPlan"
                  checked={formData.vitaliciaPlan}
                  onCheckedChange={(checked) => updateField('vitaliciaPlan', checked)}
                />
              </div>
              {formData.vitaliciaPlan && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                  <Label htmlFor="vitaliciaAmount">Cantidad destinada a renta vitalicia</Label>
                  <CurrencyInput
                    id="vitaliciaAmount"
                    placeholder="240.000"
                    value={formData.vitaliciaAmount}
                    onChange={(value) => updateField('vitaliciaAmount', value)}
                  />
                  <p className="text-xs text-muted-foreground">Máximo exento: 240.000 €</p>
                </div>
              )}
            </div>
          ) : (
            /* Reinversión - Solo sociedades */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="reinvestmentPlan" className="flex items-center cursor-pointer">
                  Exención por Reinversión
                  <InfoTooltip content="Si reinviertes la ganancia en otra empresa o activos cualificados en un plazo de 3 años, puedes diferir o reducir la tributación." />
                </Label>
                <Switch
                  id="reinvestmentPlan"
                  checked={formData.reinvestmentPlan}
                  onCheckedChange={(checked) => updateField('reinvestmentPlan', checked)}
                />
              </div>
              {formData.reinvestmentPlan && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                  <Label htmlFor="reinvestmentAmount">Cantidad a reinvertir</Label>
                  <CurrencyInput
                    id="reinvestmentAmount"
                    placeholder="1.000.000"
                    value={formData.reinvestmentAmount}
                    onChange={(value) => updateField('reinvestmentAmount', value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Info sobre abatimiento */}
          {formData.taxpayerType === 'individual' && formData.acquisitionDate && new Date(formData.acquisitionDate).getFullYear() < 1995 && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-primary font-medium">
                ✓ Se aplicarán coeficientes de abatimiento por adquisición anterior a 1995
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botón Calcular */}
      <Button
        onClick={onCalculate}
        disabled={!isFormValid}
        className="w-full py-6 text-lg font-semibold"
        size="lg"
      >
        <Calculator className="h-5 w-5 mr-2" />
        Calcular Impacto Fiscal
      </Button>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center px-4">
        Esta calculadora proporciona una estimación orientativa. Los resultados no constituyen asesoramiento fiscal.
        Consulta con un profesional para tu caso específico.
      </p>
    </div>
  );
};
