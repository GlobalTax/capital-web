import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import SectorThreePanels from '@/components/sector/SectorThreePanels';

const Healthcare = () => {
  const panels = [
    {
      type: 'image' as const,
      title: 'Nuestro Equipo',
      content: 'Especialistas con más de 15 años de experiencia en valoraciones del sector salud y farmacéutico.',
    },
    {
      type: 'dashboard' as const,
      title: 'Análisis Avanzado',
      content: 'Herramientas propietarias para análisis de métricas específicas del sector healthcare y evaluación de riesgos regulatorios.',
    },
    {
      type: 'testimonial' as const,
      title: 'Casos de Éxito',
      content: 'Trabajar con Capittal nos permitió maximizar el valor de nuestra clínica en la venta. Su conocimiento del sector sanitario fue clave.',
      author: 'Dr. Miguel Rodríguez',
      role: 'Director Médico, Clínica San Rafael',
      buttonText: 'Ver Más Casos',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <SectorHero
        sector="Healthcare"
        title="Transformando el sector salud"
        description="Especialistas en valoración de empresas sanitarias y farmacéuticas con profundo conocimiento regulatorio y sectorial."
        primaryButtonText="Consulta Especializada"
        secondaryButtonText="Ver Casos"
      />
      
      <SectorThreePanels panels={panels} />
      
      <Footer />
    </div>
  );
};

export default Healthcare;