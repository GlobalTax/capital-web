import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import SectorThreePanels from '@/components/sector/SectorThreePanels';

const Industrial = () => {
  const panels = [
    {
      type: 'image' as const,
      title: 'Expertise Industrial',
      content: 'Equipo especializado con experiencia en manufactura, logística y valoración de activos físicos complejos.',
    },
    {
      type: 'dashboard' as const,
      title: 'Análisis Técnico',
      content: 'Evaluación detallada de eficiencia operativa, cadenas de suministro y análisis de activos industriales.',
    },
    {
      type: 'testimonial' as const,
      title: 'Resultados Comprobados',
      content: 'La valoración de Capittal nos ayudó a identificar oportunidades de mejora que aumentaron significativamente el valor de nuestra planta.',
      author: 'Carlos Mendoza',
      role: 'CEO, Industrias Mediterráneo',
      buttonText: 'Ver Casos Industriales',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <SectorHero
        sector="Industrial"
        title="Potenciando la industria"
        description="Especialistas en valoración de empresas industriales con expertise en activos físicos, eficiencia operativa y cadenas de valor."
        primaryButtonText="Valoración Industrial"
        secondaryButtonText="Casos Industriales"
      />
      
      <SectorThreePanels panels={panels} />
      
      <Footer />
    </div>
  );
};

export default Industrial;