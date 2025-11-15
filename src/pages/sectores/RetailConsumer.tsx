import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import SectorThreePanels from '@/components/sector/SectorThreePanels';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';

const RetailConsumer = () => {
  const panels = [
    {
      type: 'image' as const,
      title: 'Expertos en Retail',
      content: 'Especialistas que comprenden las dinámicas del retail moderno, desde e-commerce hasta experiencias omnicanal.',
    },
    {
      type: 'dashboard' as const,
      title: 'Métricas Avanzadas',
      content: 'Análisis especializado en KPIs retail: LTV, CAC, same-store sales y optimización de customer journey.',
    },
    {
      type: 'testimonial' as const,
      title: 'Éxito Demostrado',
      content: 'Capittal nos ayudó a valorar correctamente nuestra marca antes de la expansión internacional. Su expertise en retail fue fundamental.',
      author: 'Ana Martínez',
      role: 'Fundadora, Moda Sostenible SA',
      buttonText: 'Ver Casos Retail',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Valoración de Empresas Retail y Consumer - M&A Retail | Capittal"
        description="Expertos en M&A y valoración de empresas retail: e-commerce, retail físico, marcas de consumo. Análisis especializado en tendencias digitales y comportamiento del consumidor en España."
        canonical="https://capittal.es/sectores/retail-consumer"
        keywords="valoración empresas retail, M&A e-commerce, valoración marcas consumo, valoración retail"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas Retail y Consumer",
            "Servicios especializados de M&A y valoración para empresas del sector retail y consumo",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Retail & Consumer",
            "Especialización en M&A y valoración de empresas de retail",
            "https://capittal.es/sectores/retail-consumer"
          )
        ]}
      />
      <Header />
      
      <SectorHero
        sector="Retail & Consumer"
        title="Revolucionando el retail"
        description="Especialistas en valoración de empresas retail y consumer con profundo conocimiento de tendencias digitales y comportamiento del consumidor."
        primaryButtonText="Valoración Retail"
        secondaryButtonText="Casos Retail"
      />
      
      <SectorThreePanels panels={panels} />
      
      <Footer />
    </div>
  );
};

export default RetailConsumer;