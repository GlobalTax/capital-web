import React, { useEffect } from 'react';
import LandingLayout from '@/components/shared/LandingLayout';
import AsesoramientoLegalHero from '@/components/asesoramiento-legal/AsesoramientoLegalHero';
import AsesoramientoLegalServices from '@/components/asesoramiento-legal/AsesoramientoLegalServices';
import AsesoramientoLegalProcess from '@/components/asesoramiento-legal/AsesoramientoLegalProcess';
import AsesoramientoLegalExperience from '@/components/asesoramiento-legal/AsesoramientoLegalExperience';
import AsesoramientoLegalBenefits from '@/components/asesoramiento-legal/AsesoramientoLegalBenefits';
import AsesoramientoLegalFAQ from '@/components/asesoramiento-legal/AsesoramientoLegalFAQ';
import LegalConsultationForm from '@/components/asesoramiento-legal/LegalConsultationForm';

const AsesoramientoLegal = () => {
  useEffect(() => {
    document.title = 'Asesoramiento Legal Especializado M&A | Capittal';
    
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Asesoramiento legal especializado en operaciones M&A. Protege tu transacción con la experiencia combinada de Capittal y Navarro Legal. Consulta gratuita.');
    
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
    <LandingLayout>
      <AsesoramientoLegalHero />
      <AsesoramientoLegalServices />
      <AsesoramientoLegalProcess />
      <AsesoramientoLegalExperience />
      <AsesoramientoLegalBenefits />
      <AsesoramientoLegalFAQ />
      <LegalConsultationForm />
    </LandingLayout>
  );
};

export default AsesoramientoLegal;