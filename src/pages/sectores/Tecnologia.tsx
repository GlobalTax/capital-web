
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PremiumSectorHero from '@/components/sector/PremiumSectorHero';
import PremiumSectorStats from '@/components/sector/PremiumSectorStats';
import PremiumSectorServices from '@/components/sector/PremiumSectorServices';
import SectorExpertise from '@/components/sector/SectorExpertise';
import PremiumSectorCaseStudy from '@/components/sector/PremiumSectorCaseStudy';
import PremiumSectorCTA from '@/components/sector/PremiumSectorCTA';
import { Laptop, Code, Smartphone, Database, TrendingUp, Users, Building, Zap } from 'lucide-react';

const Tecnologia = () => {
  const heroMetrics = [
    { value: "60+", label: "Transacciones Tech", icon: Building, change: "+12%" },
    { value: "€2.1B", label: "Valor Total", icon: TrendingUp, change: "+28%" },
    { value: "18", label: "Países", icon: Users },
    { value: "92%", label: "Éxito Startups", icon: Zap, change: "+5%" }
  ];

  const stats = [
    { 
      number: "60+", 
      label: "Transacciones Tech",
      description: "Fusiones y adquisiciones completadas",
      trend: "+25% vs año anterior"
    },
    { 
      number: "€2.1B", 
      label: "Valor Transaccional",
      description: "Volumen total gestionado",
      trend: "+40% crecimiento"
    },
    { 
      number: "18", 
      label: "Países de Operación",
      description: "Presencia internacional",
      trend: "Expansión continua"
    },
    { 
      number: "92%", 
      label: "Éxito en Startups",
      description: "Tasa de cierre exitoso",
      trend: "Liderando el mercado"
    }
  ];

  const services = [
    {
      icon: Laptop,
      title: "M&A Tech Empresarial",
      description: "Asesoramiento especializado en fusiones y adquisiciones para empresas de software, SaaS y servicios tecnológicos con enfoque en maximización de valor.",
      features: [
        "Valoración de activos digitales",
        "Due diligence técnica especializada",
        "Estructuración financiera optimizada"
      ]
    },
    {
      icon: Code,
      title: "Valoración de Startups",
      description: "Evaluación integral de startups tecnológicas, incluyendo análisis de modelos de negocio escalables, propiedad intelectual y potencial de crecimiento.",
      features: [
        "Análisis de métricas SaaS",
        "Valoración de IP y patentes",
        "Modelado financiero predictivo"
      ]
    },
    {
      icon: Smartphone,
      title: "Mobile & Apps",
      description: "Especialización en transacciones de aplicaciones móviles, plataformas digitales y ecosistemas de desarrollo tecnológico con enfoque en user engagement.",
      features: [
        "Análisis de user acquisition",
        "Monetización y retention",
        "Tecnología y arquitectura"
      ]
    },
    {
      icon: Database,
      title: "Due Diligence Técnica",
      description: "Revisión exhaustiva de arquitectura tecnológica, seguridad, escalabilidad y stack tecnológico para garantizar la viabilidad técnica de las transacciones.",
      features: [
        "Auditoría de código y arquitectura",
        "Análisis de seguridad y compliance",
        "Evaluación de escalabilidad"
      ]
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
    { value: "€180M", label: "Valor de Transacción", icon: TrendingUp },
    { value: "8x ARR", label: "Múltiplo Alcanzado", icon: Building },
    { value: "50K+", label: "Usuarios Activos", icon: Users }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <PremiumSectorHero
        sector="Tecnología"
        title="Sector Tecnología"
        description="Especialistas en M&A para empresas tecnológicas, desde startups innovadoras hasta corporaciones tech establecidas. Entendemos los modelos de negocio tecnológicos y las métricas SaaS que impulsan el valor."
        primaryButtonText="Explorar Oportunidades Tech"
        secondaryButtonText="Ver Casos Tech"
        metrics={heroMetrics}
      />

      <PremiumSectorStats stats={stats} />

      <PremiumSectorServices
        title="Servicios Especializados en Tech"
        subtitle="Ofrecemos servicios específicamente diseñados para el ecosistema tecnológico, combinando expertise financiero con conocimiento técnico profundo para maximizar el valor de cada transacción."
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

      <PremiumSectorCaseStudy
        title="Transformación Digital Exitosa"
        description="Asesoramos la venta de una plataforma SaaS española de gestión empresarial a un grupo tecnológico europeo, logrando un múltiplo excepcional y maximizando el valor para todos los stakeholders."
        metrics={caseStudyMetrics}
        buttonText="Ver Más Casos Tech"
        companyName="TechCorp España"
        sector="SaaS B2B"
        timeline="6 meses"
      />

      <PremiumSectorCTA
        title="¿Tiene una empresa tecnológica?"
        description="Nuestros expertos en tech están listos para analizar su empresa y maximizar su valoración en el mercado tecnológico actual. Comience con una consulta gratuita."
        primaryButtonText="Valoración Tech Gratuita"
        secondaryButtonText="Descargar Tech Report"
        contactInfo={{
          phone: "+34 91 123 45 67",
          email: "tech@capittal.com"
        }}
      />

      <Footer />
    </div>
  );
};

export default Tecnologia;
