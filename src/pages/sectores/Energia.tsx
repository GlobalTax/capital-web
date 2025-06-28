
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import SectorStats from '@/components/sector/SectorStats';
import SectorServices from '@/components/sector/SectorServices';
import SectorExpertise from '@/components/sector/SectorExpertise';
import SectorCaseStudy from '@/components/sector/SectorCaseStudy';
import SectorCTA from '@/components/sector/SectorCTA';
import { Sun, Zap, Battery, Wind } from 'lucide-react';

const Energia = () => {
  const stats = [
    { number: "25+", label: "Proyectos Energéticos" },
    { number: "€1.4B", label: "Valor en Renovables" },
    { number: "850MW", label: "Capacidad Instalada" },
    { number: "90%", label: "Éxito Regulatorio" }
  ];

  const services = [
    {
      icon: Sun,
      title: "Energías Renovables",
      description: "M&A especializado en parques solares, eólicos y proyectos de energía renovable a gran escala."
    },
    {
      icon: Zap,
      title: "Infraestructura Energética",
      description: "Transacciones en redes de distribución, transmisión y infraestructura energética crítica."
    },
    {
      icon: Battery,
      title: "Almacenamiento y Smart Grid",
      description: "Valoración de tecnologías de almacenamiento, redes inteligentes y soluciones innovadoras."
    },
    {
      icon: Wind,
      title: "Utilities y Servicios",
      description: "Due diligence en empresas de servicios públicos, utilities y comercializadoras energéticas."
    }
  ];

  const expertiseAreas = [
    "Energía Solar y Fotovoltaica",
    "Energía Eólica Onshore/Offshore",
    "Biomasa y Biogás",
    "Infraestructura de Distribución",
    "Smart Grids y Storage",
    "Utilities y Comercializadoras"
  ];

  const caseStudyMetrics = [
    { value: "€380M", label: "Valor de Transacción" },
    { value: "200MW", label: "Capacidad Total" },
    { value: "20 años", label: "Contratos PPA" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <SectorHero
        sector="Energía y Renovables"
        title="Energía y Renovables"
        description="Especialistas en M&A para el sector energético y renovables con profundo conocimiento técnico y regulatorio de la transición energética. Navegamos la complejidad de los mercados energéticos."
        primaryButtonText="Explorar Oportunidades Energéticas"
        secondaryButtonText="Ver Casos Energéticos"
      />

      <SectorStats stats={stats} />

      <SectorServices
        title="Servicios Especializados"
        subtitle="Servicios adaptados a la complejidad técnica y regulatoria del sector energético"
        services={services}
      />

      <SectorExpertise
        title="Expertise en Energía"
        description="Comprendemos las complejidades técnicas, los marcos regulatorios, y las dinámicas de financiación del sector energético. Nuestro equipo incluye ingenieros energéticos y especialistas en regulación."
        expertiseAreas={expertiseAreas}
        achievementTitle="Líderes en Energía"
        achievementDescription="Reconocidos como 'Energy M&A Advisor of the Year' por Energy Finance Magazine por nuestro trabajo en transición energética."
        achievementDetails="Hemos participado en más de €1.4B en transacciones de energías renovables, representando más de 850MW de capacidad instalada."
      />

      <SectorCaseStudy
        title="Caso de Éxito Destacado"
        description="Asesoramos la venta de un portfolio de parques solares españoles de 200MW a un fondo de infraestructura europeo por €380M, incluyendo PPA a 20 años."
        metrics={caseStudyMetrics}
        buttonText="Ver Casos Energéticos"
      />

      <SectorCTA
        title="¿Tiene un proyecto energético?"
        description="Nuestros especialistas en energía están preparados para analizar su proyecto y maximizar su valor en el mercado."
        primaryButtonText="Consulta Energética"
        secondaryButtonText="Descargar Energy Report"
      />

      <Footer />
    </div>
  );
};

export default Energia;
