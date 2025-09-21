import React, { useEffect } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import LegalServiceTechnical from '@/components/asesoramiento-legal/LegalServiceTechnical';

const AsesoramientoLegalTecnico = () => {
  useEffect(() => {
    document.title = 'Documentación Técnica Legal M&A | Capittal';
    
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Documentación técnica completa de nuestros servicios legales M&A: metodología, entregables, checklists, plantillas y SLA.');
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://capittal.es/servicios/asesoramiento-legal/tecnico');
  }, []);

  return (
    <UnifiedLayout variant="home">
      <LegalServiceTechnical />
    </UnifiedLayout>
  );
};

export default AsesoramientoLegalTecnico;