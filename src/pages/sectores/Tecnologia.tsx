
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import SectorStats from '@/components/sector/SectorStats';
import SectorServices from '@/components/sector/SectorServices';
import SectorExpertise from '@/components/sector/SectorExpertise';
import SectorCaseStudy from '@/components/sector/SectorCaseStudy';
import SectorCTA from '@/components/sector/SectorCTA';
import { Laptop, Code, Smartphone, Database } from 'lucide-react';

const Tecnologia = () => {
  const stats = [
    { number: "60+", label: "Transacciones Tech" },
    { number: "€2.1B", label: "Valor Transaccional" },
    { number: "18", label: "Países de Operación" },
    { number: "92%", label: "Éxito en Startups" }
  ];

  const services = [
    {
      icon: Laptop,
      title: "M&A Tech Empresarial",
      description: "Asesoramiento en fusiones y adquisiciones para empresas de software, SaaS y servicios tecnológicos."
    },
    {
      icon: Code,
      title: "Valoración de Startups",
      description: "Evaluación especializada de activos digitales, propiedad intelectual y modelos de negocio escalables."
    },
    {
      icon: Smartphone,
      title: "Mobile & Apps",
      description: "Análisis de aplicaciones móviles, plataformas digitales y ecosistemas de desarrollo tecnológico."
    },
    {
      icon: Database,
      title: "Due Diligence Técnica",
      description: "Revisión exhaustiva de arquitectura, seguridad, escalabilidad y stack tecnológico."
    }
  ];

  const expertiseAreas = [
    "Software y SaaS",
    "Fintech y Medtech",
    "E-commerce y Marketplaces",
    "Inteligencia Artificial",
    "Ciberseguridad",
    "Cloud Computing"
  ];

  const caseStudyMetrics = [
    { value: "€180M", label: "Valor de Transacción" },
    { value: "8x ARR", label: "Múltiplo Alcanzado" },
    { value: "50K+", label: "Usuarios Activos" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <SectorHero
        sector="Tecnología"
        title="Sector Tecnología"
        description="Especialistas en M&A para empresas tecnológicas, desde startups innovadoras hasta corporaciones tech establecidas. Entendemos los modelos de negocio tecnológicos y las métricas SaaS."
        primaryButtonText="Explorar Oportunidades Tech"
        secondaryButtonText="Ver Casos Tech"
      />

      <SectorStats stats={stats} />

      <SectorServices
        title="Servicios Especializados"
        subtitle="Servicios adaptados al ecosistema tecnológico y sus particularidades"
        services={services}
      />

      <SectorExpertise
        title="Experiencia en Tecnología"
        description="Entendemos los modelos de negocio tecnológicos, métricas SaaS, escalabilidad y los desafíos únicos del sector tech. Nuestro equipo combina experiencia financiera con conocimiento técnico profundo."
        expertiseAreas={expertiseAreas}
        achievementTitle="Líderes en Tech M&A"
        achievementDescription="Reconocidos como 'Top Tech M&A Advisor' por TechCrunch y Forbes por nuestro trabajo con unicornios europeos."
        achievementDetails="Hemos asesorado más de 60 transacciones tech, incluyendo 12 exits superiores a €100M en los últimos 3 años."
      />

      <SectorCaseStudy
        title="Caso de Éxito Reciente"
        description="Asesoramos la venta de una plataforma SaaS española de gestión empresarial a un grupo tecnológico europeo por €180M, logrando un múltiplo de 8x ARR."
        metrics={caseStudyMetrics}
        buttonText="Ver Más Casos Tech"
      />

      <SectorCTA
        title="¿Tiene una empresa tecnológica?"
        description="Nuestros expertos en tech están listos para analizar su empresa y maximizar su valoración en el mercado."
        primaryButtonText="Valoración Tech Gratuita"
        secondaryButtonText="Descargar Tech Report"
      />

      <Footer />
    </div>
  );
};

export default Tecnologia;
