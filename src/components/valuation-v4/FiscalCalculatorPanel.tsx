import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Calculator, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/shared/utils/format';
import { Badge } from '@/components/ui/badge';

interface FiscalCalculatorPanelProps {
  saleValue: number;
  acquisitionValue: number;
  onSaleValueChange: (value: number) => void;
  onAcquisitionValueChange: (value: number) => void;
  taxpayerType: 'individual' | 'company';
}

const FiscalCalculatorPanel = ({
  saleValue,
  acquisitionValue,
  onSaleValueChange,
  onAcquisitionValueChange,
  taxpayerType
}: FiscalCalculatorPanelProps) => {
  // Calculate capital gain/loss
  const capitalGain = saleValue - acquisitionValue;
  const isGain = capitalGain > 0;
  
  // Estimate tax rate based on taxpayer type
  const estimatedTaxRate = taxpayerType === 'individual' ? 0.23 : 0.25; // 23% IRPF or 25% IS
  const estimatedTax = isGain ? capitalGain * estimatedTaxRate : 0;
  const netResult = saleValue - acquisitionValue - estimatedTax;

  const handleSaleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onSaleValueChange(value);
  };

  const handleAcquisitionValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onAcquisitionValueChange(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculadora Fiscal Mejorada
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Calcula el impacto fiscal con valores de compra y venta separados
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Input Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="acquisitionValue">Valor de Adquisición (€)</Label>
            <Input
              id="acquisitionValue"
              type="number"
              value={acquisitionValue || ''}
              onChange={handleAcquisitionValueChange}
              placeholder="0"
              min="0"
              step="1000"
            />
            <p className="text-xs text-muted-foreground">
              Precio original de compra de la participación
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="saleValue">Valor de Venta (€)</Label>
            <Input
              id="saleValue"
              type="number"
              value={saleValue || ''}
              onChange={handleSaleValueChange}
              placeholder="0"
              min="0"
              step="1000"
            />
            <p className="text-xs text-muted-foreground">
              Precio de venta estimado o real
            </p>
          </div>
        </div>

        <Separator />

        {/* Calculation Results */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Info className="h-4 w-4" />
            Resultados del Cálculo
          </h4>
          
          {/* Capital Gain/Loss */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Ganancia/Pérdida Patrimonial:</span>
              <div className="flex items-center gap-2">
                {isGain ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`font-bold ${isGain ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(capitalGain)}
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Fórmula: {formatCurrency(saleValue)} - {formatCurrency(acquisitionValue)} = {formatCurrency(capitalGain)}
            </div>
          </div>

          {/* Tax Calculation - Only if there's a gain */}
          {isGain && capitalGain > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo Impositivo Estimado</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {taxpayerType === 'individual' ? 'IRPF' : 'Impuesto de Sociedades'}
                    </Badge>
                    <span className="font-semibold">
                      {formatPercentage(estimatedTaxRate * 100)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {taxpayerType === 'individual' 
                      ? 'Tipo medio estimado para IRPF (19%-26%)'
                      : 'Tipo general del Impuesto de Sociedades'
                    }
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Impuestos Estimados</Label>
                  <div className="text-lg font-bold text-red-600">
                    {formatCurrency(estimatedTax)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(capitalGain)} × {formatPercentage(estimatedTaxRate * 100)}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-blue-900">Resultado Neto Estimado:</span>
                  <span className="text-xl font-bold text-blue-900">
                    {formatCurrency(netResult)}
                  </span>
                </div>
                <div className="text-sm text-blue-700">
                  Ganancia tras impuestos: {formatCurrency(saleValue)} - {formatCurrency(acquisitionValue)} - {formatCurrency(estimatedTax)}
                </div>
              </div>
            </>
          )}

          {/* Loss scenario */}
          {!isGain && capitalGain < 0 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="font-semibold text-red-900">Pérdida Patrimonial</span>
              </div>
              <p className="text-sm text-red-700">
                Esta pérdida puede ser compensable con otras ganancias patrimoniales, 
                sujeto a la normativa fiscal vigente.
              </p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Aviso:</strong> Este cálculo es orientativo. Los impuestos reales pueden variar 
            según el régimen fiscal, deducciones aplicables, exenciones (ETVE, participation exemption), 
            y otras circunstancias particulares. Consulte con un asesor fiscal para un cálculo preciso.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FiscalCalculatorPanel;