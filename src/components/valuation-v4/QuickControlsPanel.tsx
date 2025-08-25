import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sliders, Calculator } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/format';

interface QuickControlsPanelProps {
  acquisitionValue: number;
  onAcquisitionValueChange: (value: number) => void;
  customMultiplier: number;
  onCustomMultiplierChange: (value: number) => void;
  taxpayerType: 'individual' | 'company';
  onTaxpayerTypeChange: (type: 'individual' | 'company') => void;
  salePercentage: number;
  onSalePercentageChange: (percentage: number) => void;
  reinvestmentPlan: boolean;
  onReinvestmentToggle: (enabled: boolean) => void;
  vitaliciaPlan: boolean;
  onVitaliciaToggle: (enabled: boolean) => void;
  maxValuation: number;
}

const QuickControlsPanel = ({
  acquisitionValue,
  onAcquisitionValueChange,
  customMultiplier,
  onCustomMultiplierChange,
  taxpayerType,
  onTaxpayerTypeChange,
  salePercentage,
  onSalePercentageChange,
  reinvestmentPlan,
  onReinvestmentToggle,
  vitaliciaPlan,
  onVitaliciaToggle,
  maxValuation
}: QuickControlsPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sliders className="h-5 w-5" />
          Controles Rápidos
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Valor de Adquisición */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Valor de Adquisición: {formatCurrency(acquisitionValue)}</Label>
            <span className="text-xs text-muted-foreground">Precio original de compra</span>
          </div>
          <Slider
            value={[acquisitionValue]}
            onValueChange={(value) => onAcquisitionValueChange(value[0])}
            max={maxValuation}
            step={10000}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">
            Este valor se usará para calcular la ganancia patrimonial
          </div>
        </div>

        {/* Multiplier Personalizado */}
        <div className="space-y-3">
          <Label>Multiplier Personalizado: {customMultiplier.toFixed(2)}x</Label>
          <Slider
            value={[customMultiplier]}
            onValueChange={(value) => onCustomMultiplierChange(value[0])}
            min={0.5}
            max={2.0}
            step={0.05}
            className="w-full"
          />
        </div>

        {/* Porcentaje de Venta */}
        <div className="space-y-3">
          <Label>Porcentaje a Vender: {salePercentage}%</Label>
          <Slider
            value={[salePercentage]}
            onValueChange={(value) => onSalePercentageChange(value[0])}
            min={1}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Tipo de Contribuyente */}
        <div className="space-y-2">
          <Label>Tipo de Contribuyente</Label>
          <Select value={taxpayerType} onValueChange={onTaxpayerTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Persona Física (IRPF)</SelectItem>
              <SelectItem value="company">Sociedad (IS)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Opciones de Optimización */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span className="font-medium">Optimización Fiscal</span>
          </div>

          {taxpayerType === 'company' && (
            <div className="flex items-center justify-between">
              <Label htmlFor="reinvestment">Plan de Reinversión</Label>
              <Switch
                id="reinvestment"
                checked={reinvestmentPlan}
                onCheckedChange={onReinvestmentToggle}
              />
            </div>
          )}

          {taxpayerType === 'individual' && (
            <div className="flex items-center justify-between">
              <Label htmlFor="vitalicia">Renta Vitalicia</Label>
              <Switch
                id="vitalicia"
                checked={vitaliciaPlan}
                onCheckedChange={onVitaliciaToggle}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickControlsPanel;