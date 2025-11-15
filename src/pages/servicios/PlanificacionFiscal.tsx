import React from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { getServiceSchema } from '@/utils/seo';
import PlanificacionFiscalHero from '@/components/planificacion-fiscal/PlanificacionFiscalHero';
import PlanificacionFiscalWhyOptimize from '@/components/planificacion-fiscal/PlanificacionFiscalWhyOptimize';
import PlanificacionFiscalServices from '@/components/planificacion-fiscal/PlanificacionFiscalServices';
import PlanificacionFiscalFAQ from '@/components/planificacion-fiscal/PlanificacionFiscalFAQ';
import PlanificacionFiscalCTA from '@/components/planificacion-fiscal/PlanificacionFiscalCTA';

const PlanificacionFiscal = () => {
  return (
    <UnifiedLayout variant="home">
      <SEOHead 
        title="Planificación Fiscal M&A en España | Capittal"
        description="Optimización fiscal en fusiones y adquisiciones. Reducimos la carga tributaria diseñando estructuras eficientes y conformes a la normativa española."
        canonical="https://capittal.es/servicios/planificacion-fiscal"
        keywords="planificación fiscal M&A, optimización fiscal, estructuras fiscales España"
        structuredData={getServiceSchema(
          "Planificación Fiscal M&A",
          "Optimización y estructuración fiscal para operaciones de M&A en España"
        )}
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