import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';
import About from '@/components/About';
import SEO from '@/components/SEO';

const Nosotros = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SEO
        title="Nosotros"
        description="Conoce a Capittal: equipo, valores y metodología en M&A y valoración de empresas."
      />
      <main role="main">
        <div className="pt-16">
          <About />
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
  );
};

export default Nosotros;