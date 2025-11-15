import React, { useEffect, useState } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import Step4Results from '@/components/valuation/Step4Results';
import { I18nProvider, useI18n } from '@/shared/i18n/I18nProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { SEOHead } from '@/components/seo';

const LandingCalculatorMetaThanksInner = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);

  // Recuperar datos de sessionStorage y enviar tracking unificado
  useEffect(() => {
    const storedResult = sessionStorage.getItem('valuationResult');
    const storedCompanyData = sessionStorage.getItem('valuationCompanyData');

    if (storedResult && storedCompanyData) {
      try {
        const parsedResult = JSON.parse(storedResult);
        const parsedCompanyData = JSON.parse(storedCompanyData);
        setResult(parsedResult);
        setCompanyData(parsedCompanyData);
        
        // Tracking unificado via EventSynchronizer (Facebook Pixel + GA4)
        (async () => {
          try {
            const { getEventSynchronizer } = await import('@/utils/analytics/EventSynchronizer');
            const eventSync = getEventSynchronizer();
            
            await eventSync.syncEvent('LEAD_THANK_YOU_PAGE', {
              content_name: 'Valoración Completada - Thank You Page',
              value: parsedResult.finalValuation,
              currency: 'EUR',
              industry: parsedCompanyData.industry || 'General'
            });
            
            console.log('✅ EventSynchronizer: LEAD_THANK_YOU_PAGE event sent');
          } catch (error) {
            console.error('⚠️ Error sending tracking event:', error);
          }
        })();
      } catch (error) {
        console.error('Error parsing sessionStorage data:', error);
        navigate('/lp/calculadora-meta'); // Redirigir si hay error
      }
    } else {
      // Si no hay datos, redirigir a la calculadora
      navigate('/lp/calculadora-meta');
    }
  }, [navigate]);


  const handleNewCalculation = () => {
    // Limpiar sessionStorage
    sessionStorage.removeItem('valuationResult');
    sessionStorage.removeItem('valuationCompanyData');
    navigate('/lp/calculadora-meta');
  };

  if (!result || !companyData) {
    return (
      <UnifiedLayout variant="landing">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando resultados...</p>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <>
      <SEOHead 
        title="¡Valoración Completada! | Capittal"
        description="Gracias por completar la valoración de tu empresa con Capittal. Revisa tus resultados."
        canonical="https://capittal.es/lp/calculadora-meta/gracias"
        noindex={true}
      />
      <UnifiedLayout variant="landing">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Mensaje de agradecimiento */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Gracias, {companyData.contactName}!
          </h1>
          <p className="text-lg text-gray-700 mb-4">
            Tu valoración está lista. A continuación encontrarás el análisis detallado de <strong>{companyData.companyName}</strong>.
          </p>
          <p className="text-sm text-gray-600">
            📧 También hemos enviado una copia a <strong>{companyData.email}</strong>
          </p>
        </div>

        {/* Botón volver arriba */}
        <div className="mb-6">
          <Button
            onClick={() => navigate('/lp/calculadora-meta')}
            variant="ghost"
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la calculadora
          </Button>
        </div>

        {/* Resultados de la valoración */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Step4Results
            result={result}
            companyData={companyData}
            isCalculating={false}
            resetCalculator={handleNewCalculation}
          />
        </div>

      </div>
      </UnifiedLayout>
    </>
  );
};

const LandingCalculatorMetaThanks = () => {
  return (
    <I18nProvider>
      <LandingCalculatorMetaThanksInner />
    </I18nProvider>
  );
};

export default LandingCalculatorMetaThanks;
