
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import SectorStats from '@/components/sector/SectorStats';
import SectorServices from '@/components/sector/SectorServices';
import SectorExpertise from '@/components/sector/SectorExpertise';
import SectorCaseStudy from '@/components/sector/SectorCaseStudy';
import SectorCTA from '@/components/sector/SectorCTA';
import { Factory, Cog, TrendingUp, Users } from 'lucide-react';

const Industrial = () => {
  const stats = [
    { number: "50+", label: "Transacciones Industriales" },
    { number: "€2.5B", label: "Valor Transaccional" },
    { number: "15", label: "Países de Operación" },
    { number: "95%", label: "Éxito en Cierres" }
  ];

  const services = [
    {
      icon: Factory,
      title: "M&A Industrial",
      description: "Asesoramiento en fusiones y adquisiciones para empresas manufactureras, químicas y de ingeniería."
    },
    {
      icon: Cog,
      title: "Valoración de Activos",
      description: "Evaluación especializada de maquinaria, plantas industriales y activos técnicos complejos."
    },
    {
      icon: TrendingUp,
      title: "Optimización Operativa",
      description: "Análisis de eficiencia y oportunidades de mejora en procesos industriales."
    },
    {
      icon: Users,
      title: "Due Diligence Técnica",
      description: "Revisión exhaustiva de procesos, tecnología y capacidades operativas."
    }
  ];

  const expertiseAreas = [
    "Industria Química y Petroquímica",
    "Manufactura y Automoción",
    "Ingeniería y Construcción",
    "Energía y Utilities",
    "Minería y Materiales",
    "Equipamiento Industrial"
  ];

  const caseStudyMetrics = [
    { value: "€450M", label: "Valor de Transacción" },
    { value: "6 meses", label: "Tiempo de Ejecución" },
    { value: "12", label: "Plantas Evaluadas" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <SectorHero
        sector="Industrial"
        title="Sector Industrial"
        description="Especialistas en M&A para empresas industriales, manufactureras y de ingeniería con experiencia probada en transacciones complejas. Comprendemos las dinámicas operativas del sector."
        primaryButtonText="Analizar Oportunidad"
        secondaryButtonText="Ver Casos Industriales"
      />

      <SectorStats stats={stats} />

      <SectorServices
        title="Servicios Especializados"
        subtitle="Ofrecemos servicios adaptados a las particularidades del sector industrial"
        services={services}
      />

      <SectorExpertise
        title="Nuestra Experiencia Industrial"
        description="Comprendemos las complejidades operativas, regulatorias y técnicas del sector industrial. Nuestro equipo combina experiencia financiera con conocimiento sectorial profundo."
        expertiseAreas={expertiseAreas}
        achievementTitle="Reconocimiento Sectorial"
        achievementDescription="Premiados como 'Mejor Asesor M&A Industrial' por tres años consecutivos por la Asociación Europea de Investment Banking."
        achievementDetails="Nuestro expertise en due diligence técnica y valoración de activos industriales es reconocido a nivel internacional."
      />

      <SectorCaseStudy
        title="Caso de Éxito Reciente"
        description="Asesoramos la adquisición de una empresa química europea por un grupo industrial asiático por €450M, incluyendo due diligence técnica completa y estructuración financiera optimizada."
        metrics={caseStudyMetrics}
        buttonText="Ver Casos Completos"
      />

      <SectorCTA
        title="¿Tiene un proyecto industrial?"
        description="Nuestros especialistas están listos para analizar su oportunidad y proporcionar el asesoramiento que necesita."
        primaryButtonText="Consulta Gratuita"
        secondaryButtonText="Descargar Sector Report"
      />

      <Footer />
    </div>
  );
};

export default Industrial;
