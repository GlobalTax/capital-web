import React from 'react';
import { useValuationCalculatorV4 } from '@/hooks/useValuationCalculatorV4';
import { CompanyDataV4 } from '@/types/valuationV4';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuickScenariosGrid from '@/components/valuation-v4/QuickScenariosGrid';
import QuickControlsPanel from '@/components/valuation-v4/QuickControlsPanel';
import DistributionChart from '@/components/valuation-v4/DistributionChart';
import { Building2, Zap, Download, Share2, RotateCcw } from 'lucide-react';

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
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Simulador de Valoración
            </h1>
          </div>
          <h2 className="text-xl text-muted-foreground">
            {companyData.companyName}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Cálculos en tiempo real • Versión Standalone
          </p>
        </div>

        {/* Información de la empresa compacta */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Resumen Ejecutivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Sector</div>
                <div className="font-semibold">{companyData.industry}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Facturación</div>
                <div className="font-semibold">{formatCurrency(companyData.revenue)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">EBITDA</div>
                <div className="font-semibold">{formatCurrency(companyData.ebitda)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Valoración Base</div>
                <div className="font-semibold text-primary">{formatCurrency(companyData.baseValuation)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escenarios Grid */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Escenarios de Venta</h3>
          <QuickScenariosGrid 
            scenarios={scenarioResults}
            bestScenarioId={bestScenario.id}
          />
        </div>

        {/* Controles y Gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
          
          <DistributionChart data={distributionData} />
        </div>

        {/* Resultado destacado y acciones */}
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  Mejor Resultado: {bestScenario.name}
                </h3>
                <p className="text-muted-foreground mb-2">
                  Con un retorno neto de <span className="font-bold text-foreground">
                    {formatCurrency(bestScenario.netReturn)}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  ROI: {bestScenario.roi.toFixed(1)}% • Impuestos: {formatCurrency(bestScenario.totalTax)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Contacto: {companyData.contactName} • {companyData.email}
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button onClick={handleExportResults} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar Resultados
                </Button>
                <Button onClick={handleShareResults} variant="outline" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Compartir Resultados
                </Button>
                <Button onClick={onReset} variant="outline" className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Nueva Valoración
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              * Esta herramienta proporciona estimaciones orientativas. Los resultados reales pueden variar según 
              múltiples factores del mercado y regulaciones fiscales vigentes. Se recomienda consultar con 
              profesionales especializados para decisiones de inversión.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StandaloneCalculator;