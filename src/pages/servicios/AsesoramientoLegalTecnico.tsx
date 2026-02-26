import React from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema, getBreadcrumbSchema } from '@/utils/seo';
import { useHreflang } from '@/hooks/useHreflang';
import LegalServiceTechnical from '@/components/asesoramiento-legal/LegalServiceTechnical';

const AsesoramientoLegalTecnico = () => {
  useHreflang();
  
  return (
    <UnifiedLayout variant="home">
      <SEOHead 
        title="Documentación Técnica Legal M&A | Capittal"
        description="Documentación técnica completa de nuestros servicios legales M&A: metodología, entregables, checklists, plantillas y SLA."
        canonical="https://capittal.es/servicios/asesoramiento-legal/tecnico"
        keywords="documentación legal M&A, metodología legal, plantillas M&A"
        structuredData={[
          getWebPageSchema(
            "Documentación Técnica Legal M&A",
            "Metodología, entregables y procedimientos de nuestros servicios legales M&A",
            "https://capittal.es/servicios/asesoramiento-legal/tecnico"
          ),
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://capittal.es/' },
            { name: 'Servicios', url: 'https://capittal.es/servicios' },
            { name: 'Asesoramiento Legal', url: 'https://capittal.es/servicios/asesoramiento-legal' },
            { name: 'Documentación Técnica', url: 'https://capittal.es/servicios/asesoramiento-legal/tecnico' }
          ])
        ]}
      />
      <LegalServiceTechnical />
    </UnifiedLayout>
  );
};

export default AsesoramientoLegalTecnico;