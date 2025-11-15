
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import SectorThreePanels from '@/components/sector/SectorThreePanels';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';

const Inmobiliario = () => {
  const panels = [
    {
      type: 'image' as const,
      title: 'Especialistas Inmobiliarios',
      content: 'Equipo con más de 15 años de experiencia en M&A inmobiliario, incluyendo arquitectos, urbanistas y especialistas en derecho inmobiliario.',
    },
    {
      type: 'dashboard' as const,
      title: 'Análisis de Mercado',
      content: 'Valoración avanzada de portfolios inmobiliarios, análisis de ubicaciones y valoración de ciclos de mercado.',
    },
    {
      type: 'testimonial' as const,
      title: 'Éxito Comprobado',
      content: 'Capittal nos asesoró en la venta de nuestro portfolio de €650M. Su conocimiento del mercado inmobiliario español fue excepcional.',
      author: 'Roberto Silva',
      role: 'Director General, REIT Europeo',
      buttonText: 'Ver Casos Inmobiliarios',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Valoración de Empresas Inmobiliarias - M&A Real Estate | Capittal"
        description="Expertos en M&A inmobiliario y valoración de portfolios: PropTech, REIT, desarrollo inmobiliario. Análisis especializado del mercado real estate en España."
        canonical="https://capittal.es/sectores/inmobiliario"
        keywords="valoración empresas inmobiliarias, M&A real estate, valoración REIT, valoración PropTech"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas Inmobiliarias",
            "Servicios especializados de M&A y valoración para empresas del sector inmobiliario",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Inmobiliario",
            "Especialización en M&A y valoración de empresas inmobiliarias",
            "https://capittal.es/sectores/inmobiliario"
          )
        ]}
      />
      <Header />
      
      <SectorHero
        sector="Inmobiliario"
        title="Maximizando valor inmobiliario"
        description="Especialistas en M&A inmobiliario con experiencia en todos los segmentos, desde promoción residencial hasta activos comerciales e industriales."
        primaryButtonText="Explorar Real Estate M&A"
        secondaryButtonText="Ver Casos Inmobiliarios"
      />

      <SectorThreePanels panels={panels} />

      <Footer />
    </div>
  );
};

export default Inmobiliario;
