import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';
import DeLooperACapittalContent from '@/components/DeLooperACapittalContent';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo';

const DeLooperACapittal = () => {
  const location = useLocation();
  return (
    <>
      <SEOHead 
        title="De Looper a Capittal: Nuestra Evolución | Capittal"
        description="Descubre por qué evolucionamos de Looper a Capittal. Conoce nuestra historia, los beneficios del cambio y cómo seguimos mejorando nuestros servicios de valoración empresarial."
        canonical={`https://capittal.es${location.pathname}`}
        keywords="evolución Capittal, historia empresa, Looper a Capittal, transformación empresarial"
        structuredData={getWebPageSchema(
          "De Looper a Capittal: Nuestra Evolución",
          "Descubre por qué evolucionamos de Looper a Capittal y cómo seguimos mejorando nuestros servicios.",
          "https://capittal.es/de-looper-a-capittal"
        )}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main role="main">
          <div className="pt-16">
            <DeLooperACapittalContent />
          </div>
        </main>
        <Footer />
        
        {/* Herramientas de accesibilidad flotantes */}
        <AccessibilityTools />
        <NotificationCenter className="mr-16" />
        
        {/* Live region para anuncios de accesibilidad */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
          id="accessibility-announcements"
        />
      </div>
    </>
  );
};

export default DeLooperACapittal;