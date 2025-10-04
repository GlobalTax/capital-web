import React from 'react';
import { BasicCompanyData } from '@/types/basicCompany';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Download, Share2, RotateCcw, TrendingUp, Calculator } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/shared/utils/format';

interface BasicStandaloneCalculatorProps {
  companyData: BasicCompanyData;
  onReset: () => void;
}

const BasicStandaloneCalculator = ({ companyData, onReset }: BasicStandaloneCalculatorProps) => {
  // Simple calculation
  const ebitdaMultiple = 5.5;
  const revenueMultiple = 1.2;
  
  const ebitdaValuation = companyData.ebitda * ebitdaMultiple;
  const revenueValuation = companyData.revenue * revenueMultiple;
  
  const baseValuation = Math.max(ebitdaValuation, revenueValuation * 0.8);
  const minValuation = baseValuation * 0.8;
  const maxValuation = baseValuation * 1.2;
  
  const scenarios = [
    {
      id: 'conservative',
      name: 'Conservador',
      valuation: Math.round(minValuation),
      color: '#ef4444'
    },
    {
      id: 'base',
      name: 'Base',
      valuation: Math.round(baseValuation),
      color: '#3b82f6'
    },
    {
      id: 'optimistic',
      name: 'Optimista',
      valuation: Math.round(maxValuation),
      color: '#10b981'
    }
  ];

  const bestScenario = scenarios[2]; // Optimistic

  const handleExportResults = () => {
    const results = {
      empresa: companyData.companyName,
      contacto: companyData.contactName,
      fecha: new Date().toLocaleDateString('es-ES'),
      valoracion_base: baseValuation,
      valoracion_min: minValuation,
      valoracion_max: maxValuation,
      multiplo_ebitda: ebitdaMultiple,
      escenarios: scenarios
    };

    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `valoracion_${companyData.companyName}_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleShareResults = () => {
    const shareText = `Análisis de valoración para ${companyData.companyName}:
    
📊 Valoración estimada: ${formatCurrency(baseValuation)}
📈 Rango: ${formatCurrency(minValuation)} - ${formatCurrency(maxValuation)}
🏛️ Múltiplo EBITDA: ${ebitdaMultiple}x

Calculado con Capittal.`;

    if (navigator.share) {
      navigator.share({
        title: `Valoración de ${companyData.companyName}`,
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Resultados copiados al portapapeles');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header con gradiente y animación */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary shadow-lg">
              <Calculator className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Simulador de Valoración
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <h2 className="text-2xl font-semibold text-primary">
              {companyData.companyName}
            </h2>
            <Badge variant="default" className="animate-pulse">
              <TrendingUp className="h-3 w-3 mr-1" />
              Activo
            </Badge>
          </div>
          <p className="text-muted-foreground font-medium">
            Cálculos en tiempo real • Resultados profesionales
          </p>
        </div>

        {/* Información de la empresa con diseño mejorado */}
        <Card className="mb-6 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-muted/30 to-accent/30 border-b">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Resumen Ejecutivo
              </span>
              <Badge variant="outline" className="ml-auto">
                Profesional
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="group cursor-default">
                <div className="text-muted-foreground text-sm font-medium mb-1">Sector</div>
                <div className="font-bold text-lg group-hover:text-primary transition-colors">
                  {companyData.industry}
                </div>
              </div>
              <div className="group cursor-default">
                <div className="text-muted-foreground text-sm font-medium mb-1">Facturación</div>
                <div className="font-bold text-lg text-green-600 group-hover:scale-105 transition-transform">
                  {formatCurrency(companyData.revenue)}
                </div>
              </div>
              <div className="group cursor-default">
                <div className="text-muted-foreground text-sm font-medium mb-1">EBITDA</div>
                <div className="font-bold text-lg text-yellow-600 group-hover:scale-105 transition-transform">
                  {formatCurrency(companyData.ebitda)}
                </div>
              </div>
              <div className="group cursor-default">
                <div className="text-muted-foreground text-sm font-medium mb-1">Valoración Base</div>
                <div className="font-bold text-xl text-primary group-hover:scale-105 transition-transform">
                  {formatCurrency(baseValuation)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escenarios Grid */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Escenarios de Valoración
            </h3>
            <Badge variant="secondary" className="px-3 py-1">
              {scenarios.length} opciones
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((scenario) => (
              <Card 
                key={scenario.id} 
                className={`transition-all duration-300 hover:shadow-lg ${
                  scenario.id === bestScenario.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-medium text-sm">{scenario.name}</span>
                    {scenario.id === bestScenario.id && (
                      <Badge variant="secondary" className="text-xs ml-auto">
                        Mejor
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Valoración</div>
                      <div className="text-lg font-bold" style={{ color: scenario.color }}>
                        {formatCurrency(scenario.valuation)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Resultado destacado con diseño premium */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-green-500/5 shadow-xl hover:shadow-2xl transition-all duration-500">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-primary text-primary-foreground">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">
                    Mejor Resultado: {bestScenario.name}
                  </h3>
                  <Badge variant="default" className="animate-pulse">
                    Óptimo
                  </Badge>
                </div>
                
                <div className="space-y-3 mb-6">
                  <p className="text-lg text-muted-foreground">
                    Valoración estimada de{" "}
                    <span className="font-bold text-2xl text-green-600 hover:scale-105 transition-transform inline-block">
                      {formatCurrency(bestScenario.valuation)}
                    </span>
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                    <div>
                      <span className="text-sm text-muted-foreground">Múltiplo EBITDA</span>
                      <p className="font-bold text-lg text-primary">{ebitdaMultiple}x</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Rango</span>
                      <p className="font-bold text-sm text-muted-foreground">
                        {formatCurrency(minValuation)} - {formatCurrency(maxValuation)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border-l-4 border-primary">
                  <strong>Contacto:</strong> {companyData.contactName} • {companyData.email}
                </div>
              </div>
              
              <div className="flex flex-col gap-3 min-w-[200px]">
                <Button 
                  onClick={handleExportResults} 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
                >
                  <Download className="h-4 w-4" />
                  Exportar Resultados
                </Button>
                <Button 
                  onClick={handleShareResults} 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-green-500 hover:text-white transition-all duration-300 hover:scale-105"
                >
                  <Share2 className="h-4 w-4" />
                  Compartir Resultados
                </Button>
                <Button 
                  onClick={onReset} 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-yellow-500 hover:text-white transition-all duration-300 hover:scale-105"
                >
                  <RotateCcw className="h-4 w-4" />
                  Nueva Valoración
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer profesional */}
        <Card className="mt-8 bg-gradient-to-r from-muted/30 to-accent/30 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-full bg-yellow-500/20 mt-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-2">
                  Importante: Limitaciones y Consideraciones
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Esta herramienta proporciona <strong>estimaciones orientativas</strong> basadas en múltiplos 
                  de mercado generales. Los resultados reales pueden variar significativamente 
                  según factores específicos del mercado, condiciones económicas y características 
                  particulares de cada empresa. Se recomienda encarecidamente consultar con 
                  profesionales especializados en valoración de empresas antes de tomar 
                  decisiones de inversión o venta.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BasicStandaloneCalculator;