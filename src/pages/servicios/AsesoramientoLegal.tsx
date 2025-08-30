import React, { useEffect } from 'react';
import LegalServiceTechnical from '@/components/asesoramiento-legal/LegalServiceTechnical';
import LegalStickyFooter from '@/components/asesoramiento-legal/LegalStickyFooter';

const AsesoramientoLegal = () => {
  useEffect(() => {
    document.title = 'Asesoramiento Legal M&A | Capittal';
    
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Servicio legal especializado en compraventa de empresas: due diligence, contratos, disclosure, mitigación de riesgos y post‑closing.');
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://capittal.es/servicios/asesoramiento-legal');
  }, []);

  return (
    <>
      <LegalServiceTechnical />
      <LegalStickyFooter />
    </>
  );
};

export default AsesoramientoLegal;