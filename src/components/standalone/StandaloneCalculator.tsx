import React from 'react';
import { useValuationCalculatorV4 } from '@/hooks/useValuationCalculatorV4';
import { CompanyDataV4 } from '@/types/valuationV4';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import QuickScenariosGrid from '@/components/valuation-v4/QuickScenariosGrid';
import QuickControlsPanel from '@/components/valuation-v4/QuickControlsPanel';
import DistributionChart from '@/components/valuation-v4/DistributionChart';
import { Building2, Zap, Download, Share2, RotateCcw, TrendingUp, Calculator } from 'lucide-react';

interface StandaloneCalculatorProps {
  companyData: CompanyDataV4;
  onReset: () => void;
}

const StandaloneCalculator = ({ companyData, onReset }: StandaloneCalculatorProps) => {
  const {
    scenarioResults,
    bestScenario,
    distributionData,
    acquisitionValue,
    customMultiplier,
    taxData,
    updateAcquisitionValue,
    updateCustomMultiplier,
    updateTaxpayerType,
    updateSalePercentage,
    toggleReinvestment,
    toggleVitalicia
  } = useValuationCalculatorV4(companyData);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  const handleExportResults = () => {
    const results = {
      empresa: companyData.companyName,
      contacto: companyData.contactName,
      fecha: new Date().toLocaleDateString('es-ES'),
      escenarios: scenarioResults.map(s => ({
        nombre: s.name,
        valoracion: s.valuation,
        impuestos: s.totalTax,
        retorno_neto: s.netReturn,
        roi: s.roi,
        tasa_impositiva: s.effectiveTaxRate
      })),
      mejor_escenario: {
        nombre: bestScenario.name,
        valoracion: bestScenario.valuation,
        retorno_neto: bestScenario.netReturn,
        roi: bestScenario.roi
      },
      parametros_fiscales: {
        tipo_contribuyente: taxData.taxpayerType,
        porcentaje_venta: taxData.salePercentage,
        plan_reinversion: taxData.reinvestmentPlan,
        plan_vitalicia: taxData.vitaliciaPlan
      }
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
    
📊 Mejor escenario: ${bestScenario.name}
💰 Retorno neto: ${formatCurrency(bestScenario.netReturn)}
📈 ROI: ${bestScenario.roi.toFixed(1)}%
🏛️ Impuestos: ${formatCurrency(bestScenario.totalTax)}

Calculado con la herramienta de valoración standalone.`;

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header con gradiente y animación */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Calculator className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Simulador de Valoración
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <h2 className="text-2xl font-semibold text-primary">
              {companyData.companyName}
            </h2>
            <Badge variant="success" className="animate-pulse">
              <TrendingUp className="h-3 w-3 mr-1" />
              Activo
            </Badge>
          </div>
          <p className="text-muted-foreground font-medium">
            Cálculos en tiempo real • Versión Standalone • Resultados profesionales
          </p>
        </div>

        {/* Información de la empresa con diseño mejorado */}
        <Card className="mb-6 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in">
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
                <div className="font-bold text-lg text-success group-hover:scale-105 transition-transform">
                  {formatCurrency(companyData.revenue)}
                </div>
              </div>
              <div className="group cursor-default">
                <div className="text-muted-foreground text-sm font-medium mb-1">EBITDA</div>
                <div className="font-bold text-lg text-warning group-hover:scale-105 transition-transform">
                  {formatCurrency(companyData.ebitda)}
                </div>
              </div>
              <div className="group cursor-default">
                <div className="text-muted-foreground text-sm font-medium mb-1">Valoración Base</div>
                <div className="font-bold text-xl text-primary group-hover:scale-105 transition-transform">
                  {formatCurrency(companyData.baseValuation)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escenarios Grid con animación */}
        <div className="mb-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Escenarios de Venta
            </h3>
            <Badge variant="secondary" className="px-3 py-1">
              {scenarioResults.length} opciones
            </Badge>
          </div>
          <div className="animate-fade-in">
            <QuickScenariosGrid 
              scenarios={scenarioResults}
              bestScenarioId={bestScenario.id}
            />
          </div>
        </div>

        {/* Controles y Gráfico con efectos visuales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="animate-slide-in">
            <QuickControlsPanel
              acquisitionValue={acquisitionValue}
              onAcquisitionValueChange={updateAcquisitionValue}
              customMultiplier={customMultiplier}
              onCustomMultiplierChange={updateCustomMultiplier}
              taxpayerType={taxData.taxpayerType}
              onTaxpayerTypeChange={updateTaxpayerType}
              salePercentage={taxData.salePercentage}
              onSalePercentageChange={updateSalePercentage}
              reinvestmentPlan={taxData.reinvestmentPlan}
              onReinvestmentToggle={toggleReinvestment}
              vitaliciaPlan={taxData.vitaliciaPlan}
              onVitaliciaToggle={toggleVitalicia}
              maxValuation={companyData.baseValuation * 2}
            />
          </div>
          
          <div className="animate-scale-in">
            <DistributionChart data={distributionData} />
          </div>
        </div>

        {/* Resultado destacado con diseño premium */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-success/5 shadow-xl hover:shadow-2xl transition-all duration-500 animate-bounce-gentle">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-primary text-primary-foreground">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                    Mejor Resultado: {bestScenario.name}
                  </h3>
                  <Badge variant="success" className="animate-pulse">
                    Óptimo
                  </Badge>
                </div>
                
                <div className="space-y-3 mb-6">
                  <p className="text-lg text-muted-foreground">
                    Retorno neto de{" "}
                    <span className="font-bold text-2xl text-success hover:scale-105 transition-transform inline-block">
                      {formatCurrency(bestScenario.netReturn)}
                    </span>
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                    <div>
                      <span className="text-sm text-muted-foreground">ROI</span>
                      <p className="font-bold text-lg text-primary">{bestScenario.roi.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Impuestos</span>
                      <p className="font-bold text-lg text-warning">{formatCurrency(bestScenario.totalTax)}</p>
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
                  className="flex items-center gap-2 hover:bg-success hover:text-success-foreground transition-all duration-300 hover:scale-105"
                >
                  <Share2 className="h-4 w-4" />
                  Compartir Resultados
                </Button>
                <Button 
                  onClick={onReset} 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-warning hover:text-warning-foreground transition-all duration-300 hover:scale-105"
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
              <div className="p-1 rounded-full bg-warning/20 mt-1">
                <div className="w-2 h-2 rounded-full bg-warning"></div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-2">
                  Importante: Limitaciones y Consideraciones
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Esta herramienta proporciona <strong>estimaciones orientativas</strong> basadas en múltiplos 
                  de mercado y parámetros fiscales generales. Los resultados reales pueden variar significativamente 
                  según factores específicos del mercado, condiciones económicas, regulaciones fiscales vigentes 
                  y características particulares de cada transacción. Se recomienda encarecidamente consultar con 
                  profesionales especializados en valoración de empresas y asesoría fiscal antes de tomar 
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

export default StandaloneCalculator;