import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import LegalSectorContent from '@/components/sector/LegalSectorContent';
import LegalExpertiseGrid from '@/components/sector/LegalExpertiseGrid';
import LegalTestimonials from '@/components/sector/LegalTestimonials';
import { Scale, TrendingUp, Shield, Users } from 'lucide-react';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';

const FinancialServices = () => {
  const contentSections = [
    {
      title: 'Experiencia Especializada en Servicios Financieros',
      content: 'Nuestro equipo cuenta con profunda experiencia en el sector financiero, incluyendo especialistas con trayectoria en banca de inversión, seguros, fintech y gestión de activos. Comprendemos las complejidades regulatorias y las particularidades de valoración que caracterizan a las entidades financieras.',
      subsections: [
        {
          title: 'Conocimiento Regulatorio',
          content: 'Experiencia en marcos regulatorios específicos del sector financiero, incluyendo Basilea III, Solvencia II y normativas fintech.'
        },
        {
          title: 'Métricas Especializadas',
          content: 'Aplicación de metodologías específicas como Price-to-Book, Dividend Discount Model y análisis de márgenes de intermediación.'
        }
      ]
    },
    {
      title: 'Metodologías de Valoración Específicas',
      content: 'Las entidades financieras requieren enfoques de valoración únicos que consideren sus modelos de negocio específicos, perfiles de riesgo y marcos regulatorios. Aplicamos metodologías probadas adaptadas a cada subsector financiero.',
      subsections: [
        {
          title: 'Banca Comercial',
          content: 'Valoración basada en múltiplos P/B, análisis de ROE y valoración de carteras crediticias.'
        },
        {
          title: 'Seguros y Reaseguros',
          content: 'Análisis actuarial, valoración de reservas técnicas y valoración embedded value.'
        },
        {
          title: 'Fintech y Servicios Digitales',
          content: 'Valoración de activos digitales, análisis de escalabilidad y métricas de adopción tecnológica.'
        }
      ]
    }
  ];

  const expertiseItems = [
    {
      icon: Scale,
      title: 'Banca de Inversión',
      description: 'Experiencia en valoración de bancos de inversión, incluyendo análisis de flujos de comisiones y modelos de negocio.',
      features: ['Análisis de trading revenues', 'Valoración de carteras de inversión', 'Due diligence regulatorio']
    },
    {
      icon: TrendingUp,
      title: 'Asset Management',
      description: 'Especialización en gestoras de fondos, incluyendo valoración de AUM y análisis de fee structures.',
      features: ['Valoración de AUM', 'Análisis de performance fees', 'Valoración de capacidades de distribución']
    },
    {
      icon: Shield,
      title: 'Seguros',
      description: 'Conocimiento especializado en compañías de seguros de vida, no vida y reaseguros.',
      features: ['Análisis actuarial', 'Valoración de reservas', 'Valoración embedded value']
    },
    {
      icon: Users,
      title: 'Fintech',
      description: 'Experiencia en startups financieras y empresas de tecnología financiera emergentes.',
      features: ['Valoración de plataformas digitales', 'Análisis de escalabilidad', 'Due diligence tecnológico']
    }
  ];

  const testimonials = [
    {
      content: 'La valoración de Capittal fue fundamental para nuestro proceso de fusión. Su profundo conocimiento del sector bancario y su enfoque metodológico nos proporcionaron la confianza necesaria para proceder con la operación.',
      author: 'Isabel García',
      role: 'CFO',
      company: 'Banco Regional'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Empresas de Servicios Financieros | Capittal"
        description="Expertos en M&A y valoración de empresas del sector financiero: banca, seguros, asset management, FinTech. Análisis especializado de instituciones financieras en España."
        canonical="https://capittal.es/sectores/servicios-financieros"
        keywords="valoración empresas financieras, M&A banca, valoración seguros, valoración FinTech"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas de Servicios Financieros",
            "Servicios especializados de M&A y valoración para empresas del sector financiero",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Servicios Financieros",
            "Especialización en M&A y valoración de empresas financieras",
            "https://capittal.es/sectores/servicios-financieros"
          )
        ]}
      />
      <Header />
      
      <SectorHero
        sector="Servicios Financieros"
        title="Experiencia especializada en servicios financieros"
        description="Asesoramiento en M&A para entidades financieras con profundo conocimiento regulatorio y metodologías específicas del sector."
        primaryButtonText="Consultar Proyecto"
        secondaryButtonText="Ver Experiencia"
      />
      
      <LegalSectorContent sections={contentSections} />
      
      <LegalExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia sectorial específica en todos los subsectores financieros"
        items={expertiseItems}
      />
      
      <LegalTestimonials 
        testimonials={testimonials}
        ctaText="Ver Casos de Servicios Financieros"
      />
      
      <Footer />
    </div>
  );
};

export default FinancialServices;