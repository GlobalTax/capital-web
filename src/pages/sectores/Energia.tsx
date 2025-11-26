
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';
import SectorHero from '@/components/SectorHero';
import SectorThreePanels from '@/components/sector/SectorThreePanels';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';
import { useHreflang } from '@/hooks/useHreflang';

const Energia = () => {
  useHreflang();
  const panels = [
    {
      type: 'image' as const,
      title: 'Expertos en Energía',
      content: 'Equipo especializado que incluye ingenieros energéticos y especialistas en regulación con experiencia en transición energética.',
    },
    {
      type: 'dashboard' as const,
      title: 'Análisis Energético',
      content: 'Valoración técnica de proyectos renovables, análisis de contratos PPA y valoración de tecnologías emergentes.',
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
      <SEOHead 
        title="Valoración de Empresas de Energía y Renovables | Capittal"
        description="Expertos en M&A y valoración de empresas del sector energético: renovables, utilities, oil & gas. Análisis técnico especializado en transición energética en España."
        canonical="https://capittal.es/sectores/energia"
        keywords="valoración empresas energía, M&A renovables, valoración utilities, transición energética"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas de Energía",
            "Servicios especializados de M&A y valoración para empresas del sector energético y renovables",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Energía y Renovables",
            "Especialización en M&A y valoración de empresas energéticas",
            "https://capittal.es/sectores/energia"
          )
        ]}
      />
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
