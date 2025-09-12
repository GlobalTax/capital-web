import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, DollarSign } from 'lucide-react';

const ROICalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    numPymes: 100,
    facturasMes: 500,
    euroPorHora: 50,
    horasActuales: 80
  });

  const results = useMemo(() => {
    const { numPymes, facturasMes, euroPorHora, horasActuales } = inputs;
    
    // Cálculos basados en los KPIs de SuiteLoop
    const ahorroHoras = Math.round(horasActuales * 0.35); // 35% ahorro
    const ahorroMensual = ahorroHoras * euroPorHora;
    const ahorroAnual = ahorroMensual * 12;
    const costoSuiteLoop = 299; // €/mes suite completa
    const roiAnual = ((ahorroAnual - (costoSuiteLoop * 12)) / (costoSuiteLoop * 12)) * 100;

    return {
      ahorroHoras,
      ahorroMensual,
      ahorroAnual,
      roiAnual: Math.round(roiAnual),
      payback: Math.ceil((costoSuiteLoop * 12) / ahorroAnual * 12) // meses
    };
  }, [inputs]);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Calculator className="w-4 h-4 mr-2" />
              ROI Calculator
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              Calcula tu ROI con SuiteLoop
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Datos de tu despacho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nº clientes PYMEs</Label>
                  <Input 
                    type="number" 
                    value={inputs.numPymes}
                    onChange={(e) => setInputs(prev => ({ ...prev, numPymes: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Facturas/mes promedio</Label>
                  <Input 
                    type="number" 
                    value={inputs.facturasMes}
                    onChange={(e) => setInputs(prev => ({ ...prev, facturasMes: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>€/hora facturación</Label>
                  <Input 
                    type="number" 
                    value={inputs.euroPorHora}
                    onChange={(e) => setInputs(prev => ({ ...prev, euroPorHora: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Horas/mes tareas administrativas</Label>
                  <Input 
                    type="number" 
                    value={inputs.horasActuales}
                    onChange={(e) => setInputs(prev => ({ ...prev, horasActuales: Number(e.target.value) }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Resultados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">{results.ahorroHoras}h</div>
                    <div className="text-sm text-muted-foreground">Ahorro mensual</div>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-green-600">€{results.ahorroMensual.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Valor mensual</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>ROI anual:</span>
                    <Badge variant="secondary">{results.roiAnual}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Payback:</span>
                    <Badge>{results.payback} meses</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Ahorro año 1:</span>
                    <Badge className="bg-green-100 text-green-700">€{results.ahorroAnual.toLocaleString()}</Badge>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Solicitar análisis detallado
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;