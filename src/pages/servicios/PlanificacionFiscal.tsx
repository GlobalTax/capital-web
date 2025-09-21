import React, { useEffect } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import PlanificacionFiscalHero from '@/components/planificacion-fiscal/PlanificacionFiscalHero';
import PlanificacionFiscalWhyOptimize from '@/components/planificacion-fiscal/PlanificacionFiscalWhyOptimize';
import PlanificacionFiscalServices from '@/components/planificacion-fiscal/PlanificacionFiscalServices';
import PlanificacionFiscalFAQ from '@/components/planificacion-fiscal/PlanificacionFiscalFAQ';
import PlanificacionFiscalCTA from '@/components/planificacion-fiscal/PlanificacionFiscalCTA';

const PlanificacionFiscal = () => {
  useEffect(() => {
    document.title = 'Planificación Fiscal M&A en España | Capittal';
    
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Optimización fiscal en fusiones y adquisiciones. Reducimos la carga tributaria diseñando estructuras eficientes y conformes a la normativa española.');
    
    // Add canonical link
    const canonicalUrl = 'https://capittal.es/servicios/planificacion-fiscal';
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  }, []);

  return (
    <UnifiedLayout variant="home">
      <PlanificacionFiscalHero />
      <PlanificacionFiscalWhyOptimize />
      <PlanificacionFiscalServices />
      <PlanificacionFiscalFAQ />
      <PlanificacionFiscalCTA />
    </UnifiedLayout>
  );
};

export default PlanificacionFiscal;