import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, ArrowRight } from 'lucide-react';
import { getSectorMultiplesByEbitda } from '@/utils/ebitdaMatrix';
import { formatCurrency } from '@/utils/formatters';

const SECTORS = [
  'Tecnología y Software',
  'Sanidad y Farmacia',
  'Alimentación & Distribución',
  'Servicios Financieros',
  'Industrial y Manufactura',
  'Retail y E-commerce',
  'Educación',
  'Consultoría',
  'Inmobiliario',
  'Energía y Utilities'
];

const LandingCalculator = () => {
  const [sector, setSector] = useState('');
  const [ebitda, setEbitda] = useState('');
  const [result, setResult] = useState<any>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);

  const handleCalculate = () => {
    if (!sector || !ebitda) return;

    const ebitdaValue = parseFloat(ebitda);
    if (isNaN(ebitdaValue) || ebitdaValue <= 0) return;

    const multiples = getSectorMultiplesByEbitda(sector, ebitdaValue);
    
    if (multiples && multiples.metric === 'EV/EBITDA') {
      const lowValuation = ebitdaValue * multiples.low;
      const highValuation = ebitdaValue * multiples.high;
      const avgMultiple = (multiples.low + multiples.high) / 2;
      const avgValuation = ebitdaValue * avgMultiple;

      setResult({
        lowMultiple: multiples.low,
        highMultiple: multiples.high,
        avgMultiple,
        lowValuation,
        highValuation,
        avgValuation,
        sector,
        ebitda: ebitdaValue
      });
    }
  };

  const handleDetailedValuation = () => {
    setShowLeadForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Capittal</span>
          </div>
          <Badge variant="secondary">Calculadora Gratuita</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Calcula la Valoración de tu Empresa
            <span className="text-primary block">en 30 Segundos</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Obtén una estimación inmediata del valor de tu empresa basada en múltiplos de mercado actualizados
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Calculator Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Datos de tu Empresa
              </CardTitle>
              <CardDescription>
                Introduce el sector y EBITDA para obtener la valoración
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sector">Sector de Actividad</Label>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ebitda">EBITDA Anual (€)</Label>
                <Input
                  id="ebitda"
                  type="number"
                  placeholder="Ej: 500000"
                  value={ebitda}
                  onChange={(e) => setEbitda(e.target.value)}
                  min="0"
                  step="1000"
                />
                <p className="text-sm text-muted-foreground">
                  Beneficio antes de intereses, impuestos, depreciación y amortización
                </p>
              </div>

              <Button 
                onClick={handleCalculate}
                disabled={!sector || !ebitda}
                className="w-full"
                size="lg"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calcular Valoración
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Tu Valoración Estimada
                </CardTitle>
                <CardDescription>
                  Basada en múltiplos EV/EBITDA del sector {result.sector}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Range Display */}
                <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Rango de Valoración</div>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {formatCurrency(result.lowValuation)} - {formatCurrency(result.highValuation)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Múltiplo: {result.lowMultiple}x - {result.highMultiple}x
                  </div>
                </div>

                {/* Average Valuation */}
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Valoración Media</div>
                  <div className="text-xl font-semibold">
                    {formatCurrency(result.avgValuation)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Múltiplo: {result.avgMultiple.toFixed(1)}x
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
                  * Valoración estimada según estándares IFRS16. Los resultados son orientativos y pueden variar según factores específicos de la empresa.
                </div>

                {/* CTA Button */}
                <Button 
                  onClick={handleDetailedValuation}
                  className="w-full"
                  size="lg"
                  variant="default"
                >
                  Recibir Valoración Detallada
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Obtén un análisis completo con comparables, ajustes y escenarios
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-80 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Introduce tus datos</h3>
                <p className="text-muted-foreground">
                  Completa el formulario para ver la valoración de tu empresa
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lead Form Modal */}
        {showLeadForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Valoración Detallada</CardTitle>
                <CardDescription>
                  Recibe un análisis completo por email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre completo</Label>
                  <Input placeholder="Tu nombre" />
                </div>
                <div className="space-y-2">
                  <Label>Email empresarial</Label>
                  <Input type="email" placeholder="nombre@empresa.com" />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input type="tel" placeholder="+34 600 000 000" />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    Enviar Valoración
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowLeadForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandingCalculator;