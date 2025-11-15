import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import LegalSectorContent from '@/components/sector/LegalSectorContent';
import LegalExpertiseGrid from '@/components/sector/LegalExpertiseGrid';
import LegalTestimonials from '@/components/sector/LegalTestimonials';
import { Hospital, Heart, Pill, Stethoscope } from 'lucide-react';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';

const Healthcare = () => {
  const contentSections = [
    {
      title: 'Asesoramiento Especializado en Healthcare',
      content: 'Nuestro equipo multidisciplinar incluye profesionales con experiencia específica en el sector sanitario y farmacéutico, que comprenden tanto los aspectos regulatorios como las particularidades operativas del healthcare.',
      subsections: [
        {
          title: 'Conocimiento Regulatorio',
          content: 'Experiencia en normativas sanitarias, regulación farmacéutica y compliance en el sector salud.'
        },
        {
          title: 'Valoración Clínica',
          content: 'Análisis de capacidades médicas, tecnología sanitaria y protocolos de calidad asistencial.'
        }
      ]
    },
    {
      title: 'Metodologías de Valoración en Healthcare',
      content: 'El sector sanitario presenta características únicas que requieren enfoques de valoración especializados. Consideramos factores como regulación sanitaria, ciclos de desarrollo de productos farmacéuticos y modelos de reembolso.',
      subsections: [
        {
          title: 'Centros Sanitarios',
          content: 'Valoración de clínicas, hospitales y centros especializados considerando licencias, ubicación y cartera de servicios.'
        },
        {
          title: 'Farmacéutica y Biotecnología',
          content: 'Análisis de pipelines de desarrollo, valoración de patentes y valoración de riesgos regulatorios.'
        }
      ]
    }
  ];

  const expertiseItems = [
    {
      icon: Hospital,
      title: 'Centros Sanitarios',
      description: 'Experiencia en valoración de hospitales, clínicas y centros médicos especializados.',
      features: ['Análisis de licencias sanitarias', 'Valoración de equipamiento médico', 'Valoración de carteras de pacientes']
    },
    {
      icon: Heart,
      title: 'Servicios Especializados',
      description: 'Conocimiento en centros de especialidades médicas y servicios de alta complejidad.',
      features: ['Análisis de especialidades médicas', 'Valoración de tecnología avanzada', 'Estudio de mercados específicos']
    },
    {
      icon: Pill,
      title: 'Farmacéutica',
      description: 'Especialización en empresas farmacéuticas, desde distribución hasta desarrollo de medicamentos.',
      features: ['Valoración de pipelines', 'Análisis de patentes', 'Valoración regulatoria']
    },
    {
      icon: Stethoscope,
      title: 'Tecnología Sanitaria',
      description: 'Experiencia en empresas de tecnología médica y dispositivos sanitarios.',
      features: ['Análisis de innovación médica', 'Valoración de certificaciones', 'Estudio de mercados regulados']
    }
  ];

  const testimonials = [
    {
      content: 'Trabajar con Capittal nos permitió maximizar el valor de nuestra clínica durante el proceso de venta. Su profundo conocimiento del sector sanitario y su enfoque profesional fueron fundamentales para el éxito de la operación.',
      author: 'Dr. Miguel Rodríguez',
      role: 'Director Médico',
      company: 'Clínica San Rafael'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Empresas Healthcare y Farmacéuticas | Capittal"
        description="Expertos en M&A y valoración de empresas del sector salud: farmacéuticas, dispositivos médicos, servicios sanitarios. Análisis especializado en healthcare en España."
        canonical="https://capittal.es/sectores/healthcare"
        keywords="valoración empresas healthcare, M&A farmacéuticas, valoración dispositivos médicos, valoración salud"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas Healthcare",
            "Servicios especializados de M&A y valoración para empresas del sector salud y farmacéutico",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Healthcare",
            "Especialización en M&A y valoración de empresas de salud",
            "https://capittal.es/sectores/healthcare"
          )
        ]}
      />
      <Header />
      
      <SectorHero
        sector="Healthcare"
        title="Asesoramiento especializado en healthcare"
        description="Experiencia en M&A para el sector sanitario y farmacéutico con conocimiento regulatorio específico y enfoque multidisciplinar."
        primaryButtonText="Consultar Proyecto"
        secondaryButtonText="Ver Experiencia"
      />
      
      <LegalSectorContent sections={contentSections} />
      
      <LegalExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los subsectores del healthcare"
        items={expertiseItems}
      />
      
      <LegalTestimonials 
        testimonials={testimonials}
        ctaText="Ver Casos de Healthcare"
      />
      
      <Footer />
    </div>
  );
};

export default Healthcare;