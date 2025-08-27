import React, { useState, useEffect } from 'react';
import { useValuationCalculatorV4 } from '@/hooks/useValuationCalculatorV4';
import { useV4Tracking } from '@/hooks/useV4Tracking';
import { CompanyDataV4 } from '@/types/valuationV4';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuickScenariosGrid from '@/components/valuation-v4/QuickScenariosGrid';
import QuickControlsPanel from '@/components/valuation-v4/QuickControlsPanel';
import DistributionChart from '@/components/valuation-v4/DistributionChart';
import FiscalCalculatorPanel from '@/components/valuation-v4/FiscalCalculatorPanel';
import CalendarBooking from '@/components/calendar/CalendarBooking';
import { Building2, Zap, MessageCircle, Calendar } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/shared/utils/format';
interface ValuationCalculatorV4Props {
  companyData: CompanyDataV4;
  fiscalMode?: boolean; // Nueva prop para modo fiscal
}

const ValuationCalculatorV4 = ({ companyData, fiscalMode = false }: ValuationCalculatorV4Props) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [saleValue, setSaleValue] = useState(companyData.baseValuation);
  
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

  const { 
    trackScenarioChange, 
    trackControlChange, 
    trackContactClick, 
    trackTimeSpent 
  } = useV4Tracking(companyData.id);

  // Tracking de tiempo
  useEffect(() => {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      trackTimeSpent(timeSpent);
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      trackTimeSpent(totalTime);
    };
  }, [trackTimeSpent]);

  const handleWhatsAppContact = () => {
    trackContactClick('whatsapp');
    const message = `Hola, he analizado los escenarios de venta para ${companyData.companyName}. El mejor escenario genera ${formatCurrency(bestScenario.netReturn)} netos. ¿Podemos agendar una consulta?`;
    const whatsappUrl = `https://wa.me/34${companyData.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              {fiscalMode ? '💰 Calculadora Fiscal' : '⚡ Simulador Ultra-Rápido'}
            </h1>
          </div>
          <h2 className="text-xl text-muted-foreground">
            {companyData.companyName}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {fiscalMode 
              ? 'Análisis fiscal detallado • Impacto tributario en España'
              : 'Cálculos en tiempo real • Todos los escenarios visibles'
            }
          </p>
          <div className="mt-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
            📍 Estás en: {fiscalMode ? '/lp/calculadora-fiscal (Modo Fiscal)' : '/lp/calculadora (Versión V4 Rápida)'}
          </div>
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

        {/* Fiscal Calculator Panel */}
        <div className="mb-6">
          <FiscalCalculatorPanel
            saleValue={saleValue}
            acquisitionValue={acquisitionValue}
            onSaleValueChange={setSaleValue}
            onAcquisitionValueChange={updateAcquisitionValue}
            taxpayerType={taxData.taxpayerType}
          />
        </div>

        {/* Resultado destacado y CTA */}
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  Mejor Resultado: {bestScenario.name}
                </h3>
                <p className="text-muted-foreground mb-2">
                  Con un retorno neto de <span className="font-bold text-foreground">
                    {formatCurrency(bestScenario.netReturn)}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  ROI: {formatPercentage(bestScenario.roi)} • Impuestos: {formatCurrency(bestScenario.totalTax)}
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button onClick={() => setShowCalendar(true)} className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Reservar Cita
                </Button>
                <Button onClick={handleWhatsAppContact} variant="outline" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Contactar por WhatsApp
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {companyData.contactName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Booking Modal */}
        {showCalendar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">Reservar Cita de Consulta</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowCalendar(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="p-4">
                <CalendarBooking
                  contactName={companyData.contactName}
                  contactEmail={companyData.email}
                  contactPhone={companyData.phone}
                  companyName={companyData.companyName}
                  onSuccess={() => setShowCalendar(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValuationCalculatorV4;