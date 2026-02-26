import React from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getBreadcrumbSchema } from '@/utils/seo';
import { useHreflang } from '@/hooks/useHreflang';
import PlanificacionFiscalHero from '@/components/planificacion-fiscal/PlanificacionFiscalHero';
import PlanificacionFiscalWhyOptimize from '@/components/planificacion-fiscal/PlanificacionFiscalWhyOptimize';
import PlanificacionFiscalServices from '@/components/planificacion-fiscal/PlanificacionFiscalServices';
import PlanificacionFiscalFAQ from '@/components/planificacion-fiscal/PlanificacionFiscalFAQ';
import PlanificacionFiscalCTA from '@/components/planificacion-fiscal/PlanificacionFiscalCTA';

const PlanificacionFiscal = () => {
  const location = useLocation();
  useHreflang();
  
  return (
    <UnifiedLayout variant="home">
      <SEOHead 
        title="Planificación Fiscal M&A en España | Capittal"
        description="Optimización fiscal en fusiones y adquisiciones. Reducimos la carga tributaria diseñando estructuras eficientes y conformes a la normativa española."
        canonical={`https://capittal.es${location.pathname}`}
        keywords="planificación fiscal M&A, optimización fiscal, estructuras fiscales España"
        structuredData={[
          getServiceSchema(
            "Planificación Fiscal M&A",
            "Optimización y estructuración fiscal para operaciones de M&A en España"
          ),
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://capittal.es/' },
            { name: 'Servicios', url: 'https://capittal.es/servicios' },
            { name: 'Planificación Fiscal', url: 'https://capittal.es/servicios/planificacion-fiscal' }
          ])
        ]}
      />
      <PlanificacionFiscalHero />
      <PlanificacionFiscalWhyOptimize />
      <PlanificacionFiscalServices />
      <PlanificacionFiscalFAQ />
      <PlanificacionFiscalCTA />
    </UnifiedLayout>
  );
};

export default PlanificacionFiscal;