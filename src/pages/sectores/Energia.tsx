
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';
import SectorHero from '@/components/SectorHero';
import SectorThreePanels from '@/components/sector/SectorThreePanels';

const Energia = () => {
  const panels = [
    {
      type: 'image' as const,
      title: 'Expertos en Energía',
      content: 'Equipo especializado que incluye ingenieros energéticos y especialistas en regulación con experiencia en transición energética.',
    },
    {
      type: 'dashboard' as const,
      title: 'Análisis Energético',
      content: 'Evaluación técnica de proyectos renovables, análisis de contratos PPA y valoración de tecnologías emergentes.',
    },
    {
      type: 'testimonial' as const,
      title: 'Liderazgo Reconocido',
      content: 'Capittal nos asesoró en la venta de nuestro portfolio de 200MW por €380M. Su expertise en energías renovables fue fundamental para el éxito.',
      author: 'Elena Vásquez',
      role: 'CEO, Renovables Iberia',
      buttonText: 'Ver Casos Energéticos',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main role="main">
        <SectorHero
          sector="Energía y Renovables"
          title="Impulsando la transición energética"
          description="Especialistas en M&A para el sector energético y renovables con profundo conocimiento técnico y regulatorio de la transición energética."
          primaryButtonText="Explorar Oportunidades Energéticas"
          secondaryButtonText="Ver Casos Energéticos"
        />

        <SectorThreePanels panels={panels} />
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

export default Energia;
