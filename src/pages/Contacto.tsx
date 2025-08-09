import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';
import Contact from '@/components/Contact';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const Contacto = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Helmet>
        <title>Contacto | Capittal</title>
        <meta name="description" content="Contacta con Capittal para asesoría en M&A y valoración de empresas." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <main role="main">
        <div className="pt-16">
          <Contact />
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

export default Contacto;