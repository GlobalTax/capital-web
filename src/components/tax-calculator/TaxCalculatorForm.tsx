import React from 'react';
import { TaxFormData } from '@/hooks/useTaxCalculator';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, User, Info, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TaxCalculatorFormProps {
  formData: TaxFormData;
  updateField: <K extends keyof TaxFormData>(field: K, value: TaxFormData[K]) => void;
  onCalculate: () => void;
  isFormValid: boolean;
  article21Eligibility?: { eligible: boolean; reason: string };
}

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

const SectionBadge = ({ number }: { number: string }) => (
  <span className="inline-flex items-center justify-center w-7 h-7 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
    {number}
  </span>
);

export const TaxCalculatorForm: React.FC<TaxCalculatorFormProps> = ({
  formData,
  updateField,
  onCalculate,
  isFormValid,
  article21Eligibility,
}) => {
  return (
    <div className="space-y-6">
      {/* Datos de la Operación */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
        <CardContent className="pt-6 space-y-5">
          {/* Header de sección */}
          <div className="flex items-center gap-3 pb-2">
            <SectionBadge number="1" />
            <h3 className="text-lg font-semibold text-foreground">Datos de la Operación</h3>
          </div>

          {/* Precio de Venta */}
          <div className="space-y-2">
            <Label htmlFor="salePrice" className="flex items-center text-sm font-medium">
              Precio de Venta Estimado
              <InfoTooltip content="Valor total por el que esperas vender tu empresa o participaciones." />
            </Label>
            <div className="relative">
              <CurrencyInput
                id="salePrice"
                placeholder="2.000.000"
                value={formData.salePrice}
                onChange={(value) => updateField('salePrice', value)}
                className="text-lg font-medium pl-4 pr-10 h-12 bg-background"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">€</span>
            </div>
          </div>

          {/* Tipo de Contribuyente */}
          <div className="space-y-3">
            <Label className="flex items-center text-sm font-medium">
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
                className={`flex items-center justify-center gap-2.5 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  formData.taxpayerType === 'individual'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/60 bg-background hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                <RadioGroupItem value="individual" id="individual" className="sr-only" />
                <User className={`h-5 w-5 ${formData.taxpayerType === 'individual' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`font-medium ${formData.taxpayerType === 'individual' ? 'text-primary' : 'text-foreground'}`}>
                  Persona Física
                </span>
              </Label>
              <Label
                htmlFor="company"
                className={`flex items-center justify-center gap-2.5 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  formData.taxpayerType === 'company'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/60 bg-background hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                <RadioGroupItem value="company" id="company" className="sr-only" />
                <Building2 className={`h-5 w-5 ${formData.taxpayerType === 'company' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`font-medium ${formData.taxpayerType === 'company' ? 'text-primary' : 'text-foreground'}`}>
                  Sociedad
                </span>
              </Label>
            </RadioGroup>
          </div>

          {/* Valor de Adquisición */}
          <div className="space-y-2">
            <Label htmlFor="acquisitionValue" className="flex items-center text-sm font-medium">
              Valor de Adquisición
              <InfoTooltip content="Precio original al que adquiriste las participaciones o empresa. Se usará para calcular la ganancia patrimonial." />
            </Label>
            <div className="relative">
              <CurrencyInput
                id="acquisitionValue"
                placeholder="500.000"
                value={formData.acquisitionValue}
                onChange={(value) => updateField('acquisitionValue', value)}
                className="pl-4 pr-10 h-12 bg-background"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">€</span>
            </div>
          </div>

          {/* Fecha de Adquisición */}
          <div className="space-y-2">
            <Label htmlFor="acquisitionDate" className="flex items-center text-sm font-medium">
              Fecha de Adquisición
              <InfoTooltip content="Si adquiriste antes del 31/12/1994, podrías beneficiarte de coeficientes de abatimiento que reducen la ganancia tributable." />
            </Label>
            <Input
              id="acquisitionDate"
              type="date"
              value={formData.acquisitionDate}
              onChange={(e) => updateField('acquisitionDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="h-12 bg-background"
            />
          </div>

          {/* Porcentaje a Vender */}
          <div className="space-y-3">
            <Label className="flex items-center text-sm font-medium">
              Porcentaje a Vender
              <InfoTooltip content="Indica qué porcentaje de tu participación vas a vender. Puedes simular ventas parciales." />
            </Label>
            <div className="pt-2 pb-1">
              <Slider
                value={[formData.salePercentage]}
                onValueChange={([value]) => updateField('salePercentage', value)}
                min={1}
                max={100}
                step={1}
                className="py-2"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">1%</span>
              <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {formData.salePercentage}%
              </span>
              <span className="text-xs text-muted-foreground">100%</span>
            </div>
          </div>

          {/* Base Imponible (solo sociedades) */}
          {formData.taxpayerType === 'company' && (
            <div className="space-y-2">
              <Label htmlFor="currentTaxBase" className="flex items-center text-sm font-medium">
                Base Imponible Actual (anual)
                <InfoTooltip content="Si tu base imponible es inferior a 1M€, puedes beneficiarte del tipo reducido para PYMEs (15% primeros 300K€)." />
              </Label>
              <div className="relative">
                <CurrencyInput
                  id="currentTaxBase"
                  placeholder="800.000"
                  value={formData.currentTaxBase}
                  onChange={(value) => updateField('currentTaxBase', value)}
                  className="pl-4 pr-10 h-12 bg-background"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">€</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Beneficios Fiscales */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
        <CardContent className="pt-6 space-y-5">
          {/* Header de sección */}
          <div className="flex items-center gap-3 pb-2">
            <SectionBadge number="2" />
            <h3 className="text-lg font-semibold text-foreground">Beneficios Fiscales</h3>
          </div>

          {formData.taxpayerType === 'individual' ? (
            /* Renta Vitalicia - Solo personas físicas */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                <Label htmlFor="vitaliciaPlan" className="flex items-center cursor-pointer">
                  <span className="font-medium">Renta Vitalicia (+65 años)</span>
                  <InfoTooltip content="Mayores de 65 años pueden destinar la ganancia a una renta vitalicia y quedar exentos del IRPF sobre esa parte (máximo 240.000€)." />
                </Label>
                <Switch
                  id="vitaliciaPlan"
                  checked={formData.vitaliciaPlan}
                  onCheckedChange={(checked) => updateField('vitaliciaPlan', checked)}
                />
              </div>
              {formData.vitaliciaPlan && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/30 ml-2">
                  <Label htmlFor="vitaliciaAmount" className="text-sm font-medium">
                    Cantidad destinada a renta vitalicia
                  </Label>
                  <div className="relative">
                    <CurrencyInput
                      id="vitaliciaAmount"
                      placeholder="240.000"
                      value={formData.vitaliciaAmount}
                      onChange={(value) => updateField('vitaliciaAmount', value)}
                      className="pl-4 pr-10 h-12 bg-background"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">€</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Máximo exento: 240.000 €</p>
                </div>
              )}
            </div>
          ) : (
            /* Beneficios Sociedades */
            <div className="space-y-4">
              {/* Art. 21 LIS - Exención participaciones significativas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                  <Label htmlFor="applyArticle21" className="flex items-center cursor-pointer">
                    <span className="font-medium">Exención Art. 21 LIS (99%)</span>
                    <InfoTooltip content="Si la sociedad vende participaciones en otra sociedad y cumple los requisitos del Art. 21 LIS, el 99% de la plusvalía está exenta." />
                  </Label>
                  <Switch
                    id="applyArticle21"
                    checked={formData.applyArticle21}
                    onCheckedChange={(checked) => {
                      updateField('applyArticle21', checked);
                      // Desactivar reinversión si se activa Art. 21
                      if (checked) updateField('reinvestmentPlan', false);
                    }}
                  />
                </div>
                
                {formData.applyArticle21 && (
                  <div className="space-y-4 pl-4 border-l-2 border-primary/30 ml-2">
                    {/* Porcentaje de participación */}
                    <div className="space-y-2">
                      <Label htmlFor="participationPercentage" className="text-sm font-medium flex items-center">
                        Porcentaje de participación en la filial
                        <InfoTooltip content="Debe ser ≥ 5% del capital social O el valor de adquisición debe superar 20M€." />
                      </Label>
                      <div className="relative">
                        <Input
                          id="participationPercentage"
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={formData.participationPercentage}
                          onChange={(e) => updateField('participationPercentage', parseFloat(e.target.value) || 0)}
                          className="pr-10 h-12 bg-background"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
                      </div>
                    </div>
                    
                    {/* Requisitos */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">Requisitos (marcar si se cumplen):</p>
                      
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="meetsSubjectToTax"
                          checked={formData.meetsSubjectToTaxRequirement}
                          onCheckedChange={(checked) => updateField('meetsSubjectToTaxRequirement', !!checked)}
                        />
                        <Label htmlFor="meetsSubjectToTax" className="text-sm leading-relaxed cursor-pointer">
                          La filial tributa a un tipo ≥ 10%
                          <span className="block text-xs text-muted-foreground">Sujeta a impuesto similar al IS español</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="meetsEconomicActivity"
                          checked={formData.meetsEconomicActivityRequirement}
                          onCheckedChange={(checked) => updateField('meetsEconomicActivityRequirement', !!checked)}
                        />
                        <Label htmlFor="meetsEconomicActivity" className="text-sm leading-relaxed cursor-pointer">
                          La filial tiene actividad económica
                          <span className="block text-xs text-muted-foreground">No es una sociedad patrimonial/holding</span>
                        </Label>
                      </div>
                    </div>
                    
                    {/* Indicador de elegibilidad */}
                    {article21Eligibility && (
                      <div className={`p-3 rounded-lg flex items-center gap-2 ${
                        article21Eligibility.eligible 
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50' 
                          : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50'
                      }`}>
                        {article21Eligibility.eligible ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                              Cumple requisitos → Exención del 99% de la plusvalía
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                              No cumple: {article21Eligibility.reason}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Reinversión - Solo si no aplica Art. 21 */}
              {!formData.applyArticle21 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                    <Label htmlFor="reinvestmentPlan" className="flex items-center cursor-pointer">
                      <span className="font-medium">Exención por Reinversión</span>
                      <InfoTooltip content="Si reinviertes la ganancia en otra empresa o activos cualificados en un plazo de 3 años, puedes diferir o reducir la tributación." />
                    </Label>
                    <Switch
                      id="reinvestmentPlan"
                      checked={formData.reinvestmentPlan}
                      onCheckedChange={(checked) => updateField('reinvestmentPlan', checked)}
                    />
                  </div>
                  {formData.reinvestmentPlan && (
                    <div className="space-y-2 pl-4 border-l-2 border-primary/30 ml-2">
                      <Label htmlFor="reinvestmentAmount" className="text-sm font-medium">
                        Cantidad a reinvertir
                      </Label>
                      <div className="relative">
                        <CurrencyInput
                          id="reinvestmentAmount"
                          placeholder="1.000.000"
                          value={formData.reinvestmentAmount}
                          onChange={(value) => updateField('reinvestmentAmount', value)}
                          className="pl-4 pr-10 h-12 bg-background"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">€</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Info sobre abatimiento */}
          {formData.taxpayerType === 'individual' && formData.acquisitionDate && new Date(formData.acquisitionDate).getFullYear() < 1995 && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-sm text-primary font-medium flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs">✓</span>
                Se aplicarán coeficientes de abatimiento por adquisición anterior a 1995
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botón Calcular */}
      <Button
        onClick={onCalculate}
        disabled={!isFormValid}
        className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl group"
        size="lg"
      >
        Calcular Impacto Fiscal
        <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
      </Button>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center px-4 leading-relaxed">
        Esta calculadora proporciona una estimación orientativa. Los resultados no constituyen asesoramiento fiscal.
        Consulta con un profesional para tu caso específico.
      </p>
    </div>
  );
};
