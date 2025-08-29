import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TaxScenarioData } from '@/types/valuationV3';
import { Calculator, Settings } from 'lucide-react';

interface TaxConfigPanelProps {
  taxData: TaxScenarioData;
  onTaxDataChange: (field: keyof TaxScenarioData, value: any) => void;
}

const TaxConfigPanel = ({ taxData, onTaxDataChange }: TaxConfigPanelProps) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-ES', { minimumFractionDigits: 0 }).format(amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Configuración Fiscal
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Datos básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="acquisitionValue">Valor de Adquisición (€)</Label>
            <Input
              id="acquisitionValue"
              type="number"
              value={taxData.acquisitionValue}
              onChange={(e) => onTaxDataChange('acquisitionValue', Number(e.target.value))}
              placeholder="0"
              className="text-right"
            />
            <p className="text-xs text-muted-foreground">
              Si no tienes valor de adquisición, déjalo en 0
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="acquisitionDate">Fecha de Adquisición</Label>
            <Input
              id="acquisitionDate"
              type="date"
              value={taxData.acquisitionDate}
              onChange={(e) => onTaxDataChange('acquisitionDate', e.target.value)}
            />
          </div>
        </div>

        {/* Tipo de contribuyente */}
        <div className="space-y-2">
          <Label htmlFor="taxpayerType">Tipo de Contribuyente</Label>
          <Select 
            value={taxData.taxpayerType} 
            onValueChange={(value) => onTaxDataChange('taxpayerType', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Persona Física (IRPF)</SelectItem>
              <SelectItem value="company">Sociedad (IS)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Porcentaje de venta */}
        <div className="space-y-2">
          <Label htmlFor="salePercentage">Porcentaje a Vender (%)</Label>
          <Input
            id="salePercentage"
            type="number"
            min="1"
            max="100"
            value={taxData.salePercentage}
            onChange={(e) => onTaxDataChange('salePercentage', Number(e.target.value))}
            className="text-right"
          />
          <p className="text-xs text-muted-foreground">
            {taxData.salePercentage}% de la empresa
          </p>
        </div>

        {/* Base imponible para sociedades */}
        {taxData.taxpayerType === 'company' && (
          <div className="space-y-2">
            <Label htmlFor="currentTaxBase">Base Imponible Actual (€)</Label>
            <Input
              id="currentTaxBase"
              type="number"
              value={taxData.currentTaxBase || ''}
              onChange={(e) => onTaxDataChange('currentTaxBase', Number(e.target.value))}
              placeholder="Para determinar si aplicar tipo PYME"
              className="text-right"
            />
            <p className="text-xs text-muted-foreground">
              Si es ≤ 1M€, aplicará tipo reducido PYME
            </p>
          </div>
        )}

        {/* Opciones de optimización */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="font-medium">Opciones de Optimización</span>
          </div>

          {/* Reinversión (solo sociedades) */}
          {taxData.taxpayerType === 'company' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="reinvestmentPlan">Plan de Reinversión (Art. 42 LIS)</Label>
                <Switch
                  id="reinvestmentPlan"
                  checked={taxData.reinvestmentPlan}
                  onCheckedChange={(checked) => onTaxDataChange('reinvestmentPlan', checked)}
                />
              </div>
              
              {taxData.reinvestmentPlan && (
                <div className="space-y-2 ml-4">
                  <Label htmlFor="reinvestmentAmount">Importe a Reinvertir (€)</Label>
                  <Input
                    id="reinvestmentAmount"
                    type="number"
                    value={taxData.reinvestmentAmount}
                    onChange={(e) => onTaxDataChange('reinvestmentAmount', Number(e.target.value))}
                    placeholder="Mínimo 70% de la ganancia"
                    className="text-right"
                  />
                </div>
              )}
            </div>
          )}

          {/* Renta vitalicia (solo personas físicas) */}
          {taxData.taxpayerType === 'individual' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="vitaliciaPlan">Renta Vitalicia</Label>
                <Switch
                  id="vitaliciaPlan"
                  checked={taxData.vitaliciaPlan}
                  onCheckedChange={(checked) => onTaxDataChange('vitaliciaPlan', checked)}
                />
              </div>
              
              {taxData.vitaliciaPlan && (
                <div className="space-y-2 ml-4">
                  <Label htmlFor="vitaliciaAmount">Importe Renta Vitalicia (€)</Label>
                  <Input
                    id="vitaliciaAmount"
                    type="number"
                    value={taxData.vitaliciaAmount}
                    onChange={(e) => onTaxDataChange('vitaliciaAmount', Number(e.target.value))}
                    className="text-right"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxConfigPanel;