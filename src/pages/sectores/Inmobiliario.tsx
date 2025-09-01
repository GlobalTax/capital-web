
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import SectorThreePanels from '@/components/sector/SectorThreePanels';

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
