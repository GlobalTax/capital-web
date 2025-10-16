import React, { useEffect, useState } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import Step4Results from '@/components/valuation/Step4Results';
import { I18nProvider, useI18n } from '@/shared/i18n/I18nProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const LandingCalculatorMetaThanksInner = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);

  // Recuperar datos de sessionStorage
  useEffect(() => {
    const storedResult = sessionStorage.getItem('valuationResult');
    const storedCompanyData = sessionStorage.getItem('valuationCompanyData');

    if (storedResult && storedCompanyData) {
      try {
        setResult(JSON.parse(storedResult));
        setCompanyData(JSON.parse(storedCompanyData));
        
        // Disparar evento de conversión para Meta Pixel
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'Lead', {
            content_name: 'Valoración Completada',
            value: JSON.parse(storedResult).finalValuation,
            currency: 'EUR'
          });
          console.log('🎯 Meta Pixel: Lead event triggered');
        }
      } catch (error) {
        console.error('Error parsing sessionStorage data:', error);
        navigate('/lp/calculadora-meta'); // Redirigir si hay error
      }
    } else {
      // Si no hay datos, redirigir a la calculadora
      navigate('/lp/calculadora-meta');
    }
  }, [navigate]);

  // SEO para página de gracias
  useEffect(() => {
    document.title = '¡Valoración Completada! | Capittal';
    
    const canonicalUrl = 'https://capittal.es/lp/calculadora-meta/gracias';
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Meta robots - NOINDEX para evitar indexar página de gracias
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex, nofollow');
  }, []);

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

        {/* Call to action adicional */}
        <div className="mt-8 bg-slate-900 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">
            ¿Quieres una valoración profesional completa?
          </h2>
          <p className="text-slate-200 mb-6">
            Nuestro equipo de expertos puede realizar un análisis exhaustivo de tu empresa con valoración profesional en 48 horas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.open('https://calendly.com/capittal/30min', '_blank')}
              size="lg"
              className="bg-white text-slate-900 hover:bg-gray-100"
            >
              Reservar llamada gratuita
            </Button>
            <Button
              onClick={() => window.location.href = 'https://capittal.es/contacto'}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-slate-800"
            >
              Más información
            </Button>
          </div>
        </div>
      </div>
    </UnifiedLayout>
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
