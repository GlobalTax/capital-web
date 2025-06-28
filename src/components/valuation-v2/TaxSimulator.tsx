
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calculator, AlertTriangle, Info } from 'lucide-react';
import { TaxSimulatorData, TaxCalculationResult } from '@/types/valuationV2';
import { calculateSpanishTaxImpact } from '@/utils/taxCalculationV2';

interface TaxSimulatorProps {
  companyValuation: number;
  companyName: string;
}

const TaxSimulator: React.FC<TaxSimulatorProps> = ({ companyValuation, companyName }) => {
  const [simulatorData, setSimulatorData] = useState<TaxSimulatorData>({
    taxpayerType: 'individual',
    acquisitionValue: 0,
    yearsHeld: 1,
    salePercentage: 100,
    reinvestmentPlan: false,
    reinvestmentAmount: 0,
    reinvestmentQualifies: false
  });

  const [result, setResult] = useState<TaxCalculationResult | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleCalculate = () => {
    const taxResult = calculateSpanishTaxImpact(simulatorData, companyValuation);
    setResult(taxResult);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!showForm) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Simulador de Impacto Fiscal
          </CardTitle>
          <CardDescription>
            Calcula el impacto fiscal estimado de la venta de {companyName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowForm(true)} className="w-full">
            Iniciar Simulación Fiscal
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Simulador de Impacto Fiscal</CardTitle>
        <CardDescription>
          Introduce los datos para calcular el impacto fiscal estimado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="taxpayerType">Tipo de contribuyente</Label>
            <Select
              value={simulatorData.taxpayerType}
              onValueChange={(value: 'individual' | 'company') => 
                setSimulatorData(prev => ({ ...prev, taxpayerType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Persona Física</SelectItem>
                <SelectItem value="company">Sociedad</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="salePercentage">Porcentaje a vender (%)</Label>
            <Input
              id="salePercentage"
              type="number"
              min="1"
              max="100"
              value={simulatorData.salePercentage}
              onChange={(e) => setSimulatorData(prev => ({ 
                ...prev, 
                salePercentage: Number(e.target.value) 
              }))}
            />
          </div>

          <div>
            <Label htmlFor="acquisitionValue">Valor de adquisición (€)</Label>
            <Input
              id="acquisitionValue"
              type="number"
              min="0"
              value={simulatorData.acquisitionValue}
              onChange={(e) => setSimulatorData(prev => ({ 
                ...prev, 
                acquisitionValue: Number(e.target.value) 
              }))}
            />
          </div>

          <div>
            <Label htmlFor="yearsHeld">Años de tenencia</Label>
            <Input
              id="yearsHeld"
              type="number"
              min="0"
              value={simulatorData.yearsHeld}
              onChange={(e) => setSimulatorData(prev => ({ 
                ...prev, 
                yearsHeld: Number(e.target.value) 
              }))}
            />
          </div>

          {simulatorData.taxpayerType === 'company' && (
            <div>
              <Label htmlFor="currentTaxBase">Base imponible anual actual (€)</Label>
              <Input
                id="currentTaxBase"
                type="number"
                min="0"
                value={simulatorData.currentTaxBase || ''}
                onChange={(e) => setSimulatorData(prev => ({ 
                  ...prev, 
                  currentTaxBase: Number(e.target.value) 
                }))}
              />
            </div>
          )}
        </div>

        {simulatorData.taxpayerType === 'company' && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold">Reinversión (Art. 42 LIS)</h4>
            <div className="flex items-center space-x-2">
              <Switch
                checked={simulatorData.reinvestmentPlan}
                onCheckedChange={(checked) => setSimulatorData(prev => ({ 
                  ...prev, 
                  reinvestmentPlan: checked 
                }))}
              />
              <Label>¿Planea reinvertir las ganancias?</Label>
            </div>

            {simulatorData.reinvestmentPlan && (
              <>
                <div>
                  <Label htmlFor="reinvestmentAmount">Importe a reinvertir (€)</Label>
                  <Input
                    id="reinvestmentAmount"
                    type="number"
                    min="0"
                    value={simulatorData.reinvestmentAmount}
                    onChange={(e) => setSimulatorData(prev => ({ 
                      ...prev, 
                      reinvestmentAmount: Number(e.target.value) 
                    }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={simulatorData.reinvestmentQualifies}
                    onCheckedChange={(checked) => setSimulatorData(prev => ({ 
                      ...prev, 
                      reinvestmentQualifies: checked 
                    }))}
                  />
                  <Label>La reinversión cumple requisitos del Art. 42 LIS</Label>
                </div>
              </>
            )}
          </div>
        )}

        <Button onClick={handleCalculate} className="w-full">
          Calcular Impacto Fiscal
        </Button>

        {result && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Resultado de la Simulación</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Precio de Venta</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(result.salePrice)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Impuestos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(result.totalTax)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tipo efectivo: {(result.effectiveTaxRate * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Neto Disponible</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(result.netAfterTax)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Desglose del Cálculo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Precio de venta:</span>
                  <span>{formatCurrency(result.salePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor de adquisición:</span>
                  <span>-{formatCurrency(result.acquisitionValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gastos deducibles:</span>
                  <span>-{formatCurrency(result.deductibleExpenses)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Ganancia patrimonial:</span>
                    <span>{formatCurrency(result.capitalGain)}</span>
                  </div>
                </div>
                
                {result.taxBreakdown.map((breakdown, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{breakdown.description}:</span>
                    <span>{formatCurrency(breakdown.amount)} × {breakdown.rate}%</span>
                  </div>
                ))}
                
                {result.reinvestmentBenefit > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Exención reinversión:</span>
                    <span>-{formatCurrency(result.reinvestmentBenefit)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <h4 className="font-semibold mb-1">Aviso Legal</h4>
              <p>
                Esta simulación es orientativa y se basa en normativa fiscal general. 
                Los cálculos reales pueden variar según circunstancias específicas, 
                deducciones adicionales o cambios normativos. Consulte con un asesor 
                fiscal profesional para un análisis preciso.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxSimulator;
