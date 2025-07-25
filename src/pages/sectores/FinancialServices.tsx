import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import SectorThreePanels from '@/components/sector/SectorThreePanels';

const FinancialServices = () => {
  const panels = [
    {
      type: 'image' as const,
      title: 'Especialistas Financieros',
      content: 'Equipo con profunda experiencia en banca, seguros, fintech y gestión de activos con conocimiento regulatorio especializado.',
    },
    {
      type: 'dashboard' as const,
      title: 'Metodologías Específicas',
      content: 'Aplicamos métodos de valoración únicos del sector financiero: P/B, DDM, análisis de márgenes y evaluación de carteras.',
    },
    {
      type: 'testimonial' as const,
      title: 'Confianza del Sector',
      content: 'La valoración de Capittal fue clave para nuestro proceso de fusión. Su conocimiento del sector bancario nos dio la confianza necesaria.',
      author: 'Isabel García',
      role: 'CFO, Banco Regional',
      buttonText: 'Ver Casos Financieros',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <SectorHero
        sector="Servicios Financieros"
        title="Liderando en finanzas"
        description="Especialistas en valoración de entidades financieras con metodologías específicas y profundo conocimiento regulatorio del sector."
        primaryButtonText="Valoración Financiera"
        secondaryButtonText="Casos Financieros"
      />
      
      <SectorThreePanels panels={panels} />
      
      <Footer />
    </div>
  );
};

export default FinancialServices;