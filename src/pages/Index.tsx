
import React from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import Hero from '@/components/Hero';
import SocialProofCompact from '@/components/SocialProofCompact';
import Services from '@/components/Services';
import EcosistemaIntegral from '@/components/EcosistemaIntegral';
import CaseStudiesCompact from '@/components/CaseStudiesCompact';

import WhyChooseCapittal from '@/components/WhyChooseCapittal';
import Contact from '@/components/Contact';

const Index = () => {
  return (
    <UnifiedLayout variant="home">
      <Hero />
      <SocialProofCompact />
      <Services />
      <EcosistemaIntegral />
      <CaseStudiesCompact />
      <WhyChooseCapittal />
      <Contact />
    </UnifiedLayout>
  );
};

export default Index;
