import React, { useEffect } from 'react';
import HomeLayout from '@/components/shared/HomeLayout';
import AsesoramientoLegalHero from '@/components/asesoramiento-legal/AsesoramientoLegalHero';
import AsesoramientoLegalWhyChoose from '@/components/asesoramiento-legal/AsesoramientoLegalWhyChoose';
import AsesoramientoLegalServices from '@/components/asesoramiento-legal/AsesoramientoLegalServices';
import AsesoramientoLegalProcess from '@/components/asesoramiento-legal/AsesoramientoLegalProcess';
import AsesoramientoLegalBenefits from '@/components/asesoramiento-legal/AsesoramientoLegalBenefits';
import AsesoramientoLegalExperience from '@/components/asesoramiento-legal/AsesoramientoLegalExperience';
import AsesoramientoLegalFAQ from '@/components/asesoramiento-legal/AsesoramientoLegalFAQ';
import AsesoramientoLegalCTA from '@/components/asesoramiento-legal/AsesoramientoLegalCTA';

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
    <HomeLayout>
      <AsesoramientoLegalHero />
      <AsesoramientoLegalWhyChoose />
      <AsesoramientoLegalServices />
      <AsesoramientoLegalProcess />
      <AsesoramientoLegalBenefits />
      <AsesoramientoLegalExperience />
      <AsesoramientoLegalFAQ />
      <AsesoramientoLegalCTA />
    </HomeLayout>
  );
};

export default AsesoramientoLegal;