
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import SectorStats from '@/components/sector/SectorStats';
import SectorServices from '@/components/sector/SectorServices';
import SectorExpertise from '@/components/sector/SectorExpertise';
import SectorCaseStudy from '@/components/sector/SectorCaseStudy';
import SectorCTA from '@/components/sector/SectorCTA';
import { Building, Home, MapPin, TrendingUp } from 'lucide-react';

const Inmobiliario = () => {
  const stats = [
    { number: "30+", label: "Transacciones Inmobiliarias" },
    { number: "€2.8B", label: "Valor de Activos" },
    { number: "15M m²", label: "Superficie Gestionada" },
    { number: "95%", label: "Due Diligence Exitosa" }
  ];

  const services = [
    {
      icon: Building,
      title: "Real Estate Comercial",
      description: "M&A en oficinas, centros comerciales, naves industriales y activos inmobiliarios comerciales."
    },
    {
      icon: Home,
      title: "Promoción Residencial",
      description: "Transacciones en promotoras, constructoras y desarrolladores de proyectos residenciales."
    },
    {
      icon: MapPin,
      title: "Gestión de Activos",
      description: "Valoración de portfolios inmobiliarios, SOCIMIs y fondos de inversión inmobiliaria."
    },
    {
      icon: TrendingUp,
      title: "PropTech M&A",
      description: "Due diligence en empresas de tecnología inmobiliaria, plataformas digitales y servicios."
    }
  ];

  const expertiseAreas = [
    "Promoción y Construcción",
    "Centros Comerciales y Retail",
    "Oficinas y Espacios Corporativos",
    "Logística e Industrial",
    "SOCIMIs y REITs",
    "PropTech y Servicios"
  ];

  const caseStudyMetrics = [
    { value: "€650M", label: "Valor de Portfolio" },
    { value: "12", label: "Centros Comerciales" },
    { value: "95%", label: "Ocupación Media" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <SectorHero
        sector="Inmobiliario"
        title="Sector Inmobiliario"
        description="Especialistas en M&A inmobiliario con experiencia en todos los segmentos, desde promoción residencial hasta activos comerciales e industriales. Comprendemos los ciclos inmobiliarios y la regulación urbanística."
        primaryButtonText="Explorar Real Estate M&A"
        secondaryButtonText="Ver Casos Inmobiliarios"
      />

      <SectorStats stats={stats} />

      <SectorServices
        title="Servicios Especializados"
        subtitle="Servicios adaptados a la complejidad del mercado inmobiliario español y europeo"
        services={services}
      />

      <SectorExpertise
        title="Expertise Inmobiliario"
        description="Comprendemos los ciclos inmobiliarios, la regulación urbanística, y las complejidades fiscales del sector. Nuestro equipo incluye arquitectos, urbanistas y especialistas en derecho inmobiliario."
        expertiseAreas={expertiseAreas}
        achievementTitle="Líderes en Real Estate"
        achievementDescription="Reconocidos como 'Real Estate M&A Advisor of the Year' por Real Estate Finance por nuestro trabajo en transacciones complejas."
        achievementDetails="Hemos gestionado más de €2.8B en transacciones inmobiliarias, incluyendo portfolios complejos y operaciones internacionales."
      />

      <SectorCaseStudy
        title="Caso de Éxito Destacado"
        description="Asesoramos la venta de un portfolio de centros comerciales españoles a un REIT europeo por €650M, incluyendo reestructuración de contratos de arrendamiento."
        metrics={caseStudyMetrics}
        buttonText="Ver Casos Inmobiliarios"
      />

      <SectorCTA
        title="¿Tiene un proyecto inmobiliario?"
        description="Nuestros especialistas inmobiliarios están preparados para analizar su portfolio y maximizar el valor de sus activos."
        primaryButtonText="Consulta Inmobiliaria"
        secondaryButtonText="Descargar Real Estate Report"
      />

      <Footer />
    </div>
  );
};

export default Inmobiliario;
