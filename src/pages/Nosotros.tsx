import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';
import About from '@/components/About';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const Nosotros = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Helmet>
        <title>Nosotros | Capittal</title>
        <meta name="description" content="Conoce a Capittal: equipo, valores y metodología en M&A y valoración de empresas." />
        <link rel="canonical" href={canonical} />
      </Helmet>
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