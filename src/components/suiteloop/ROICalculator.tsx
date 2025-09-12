import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, Clock, Euro } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const ROICalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    clientes: 150,
    horasAdmin: 25,
  });

  const calculations = useMemo(() => {
    const suiteloopCosto = 299;
    const ahorroPercentage = 0.35;
    const tarifaHora = 45;
    
    const costoHorasAdmin = inputs.horasAdmin * tarifaHora * 4.33;
    const ahorroMensual = costoHorasAdmin * ahorroPercentage;
    const ahorroAnual = ahorroMensual * 12;
    const costoAnualSuiteLoop = suiteloopCosto * 12;
    const roi = ((ahorroAnual - costoAnualSuiteLoop) / costoAnualSuiteLoop) * 100;

    return {
      ahorroMensual: Math.round(ahorroMensual),
      ahorroAnual: Math.round(ahorroAnual),
      roi: Math.round(roi),
    };
  }, [inputs]);

  const handleInputChange = (field: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Calcula tu ahorro
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Datos básicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clientes">Número de clientes</Label>
                  <Input
                    id="clientes"
                    type="number"
                    value={inputs.clientes}
                    onChange={(e) => handleInputChange('clientes', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="horas">Horas administrativas/semana</Label>
                  <Input
                    id="horas"
                    type="number"
                    value={inputs.horasAdmin}
                    onChange={(e) => handleInputChange('horasAdmin', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tu ahorro estimado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      €{calculations.ahorroMensual.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Ahorro mensual</div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {calculations.roi}%
                    </div>
                    <div className="text-sm text-muted-foreground">ROI anual</div>
                  </div>
                </div>

                <InteractiveHoverButton
                  text="Solicitar análisis detallado"
                  className="w-full"
                  size="lg"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;