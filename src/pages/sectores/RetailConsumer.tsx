
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import SectorStats from '@/components/sector/SectorStats';
import SectorServices from '@/components/sector/SectorServices';
import SectorExpertise from '@/components/sector/SectorExpertise';
import SectorCaseStudy from '@/components/sector/SectorCaseStudy';
import SectorCTA from '@/components/sector/SectorCTA';
import { Store, ShoppingBag, Truck, Users } from 'lucide-react';

const RetailConsumer = () => {
  const stats = [
    { number: "40+", label: "Transacciones Retail" },
    { number: "€1.6B", label: "Valor Transaccional" },
    { number: "22", label: "Países Europeos" },
    { number: "88%", label: "Integración Exitosa" }
  ];

  const services = [
    {
      icon: Store,
      title: "M&A Retail",
      description: "Asesoramiento en fusiones y adquisiciones para cadenas retail, franquicias y comercio especializado."
    },
    {
      icon: ShoppingBag,
      title: "E-commerce M&A",
      description: "Especialización en plataformas de comercio electrónico, marketplaces y retail digital."
    },
    {
      icon: Truck,
      title: "Supply Chain",
      description: "Análisis de cadenas de suministro, logística y optimización de operaciones retail."
    },
    {
      icon: Users,
      title: "Consumer Brands",
      description: "Valoración de marcas de consumo, análisis de market share y posicionamiento competitivo."
    }
  ];

  const expertiseAreas = [
    "Retail Tradicional y Moderno",
    "E-commerce y Marketplaces",
    "Moda y Lifestyle",
    "Alimentación y Bebidas",
    "Electrodomésticos y Electrónica",
    "Franquicias y Licencias"
  ];

  const caseStudyMetrics = [
    { value: "€250M", label: "Valor de Transacción" },
    { value: "120", label: "Tiendas Integradas" },
    { value: "85%", label: "Digitalización Lograda" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <SectorHero
        sector="Retail & Consumer"
        title="Retail & Consumer"
        description="Especialistas en transacciones para empresas de retail, bienes de consumo y marcas con experiencia en transformación digital y omnicanalidad. Comprendemos las dinámicas del consumo moderno."
        primaryButtonText="Explorar Retail M&A"
        secondaryButtonText="Ver Casos Retail"
      />

      <SectorStats stats={stats} />

      <SectorServices
        title="Servicios Especializados"
        subtitle="Servicios adaptados al ecosistema retail y consumer en constante evolución"
        services={services}
      />

      <SectorExpertise
        title="Expertise en Retail & Consumer"
        description="Comprendemos las dinámicas del consumo, la transformación digital del retail, y los desafíos de la omnicanalidad. Nuestro equipo tiene experiencia directa en operaciones retail y marcas de consumo."
        expertiseAreas={expertiseAreas}
        achievementTitle="Líderes en Retail M&A"
        achievementDescription="Reconocidos como 'Best Retail M&A Advisor' por Retail Week y premiados por nuestro trabajo en transformación digital retail."
        achievementDetails="Hemos asesorado la integración exitosa de más de 40 transacciones retail, incluyendo procesos de digitalización post-fusión."
      />

      <SectorCaseStudy
        title="Caso de Éxito Destacado"
        description="Asesoramos la adquisición de una cadena de moda española con 120 tiendas por un grupo retail europeo por €250M, incluyendo plan de digitalización integral."
        metrics={caseStudyMetrics}
        buttonText="Ver Casos Retail"
      />

      <SectorCTA
        title="¿Tiene una empresa retail o consumer?"
        description="Nuestros especialistas están preparados para analizar su negocio y maximizar el valor en su proceso de M&A."
        primaryButtonText="Consulta Retail Gratuita"
        secondaryButtonText="Descargar Retail Report"
      />

      <Footer />
    </div>
  );
};

export default RetailConsumer;
