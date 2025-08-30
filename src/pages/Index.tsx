
import React from 'react';
import { HomeLayout } from '@/shared';
import Hero from '@/components/Hero';
import SocialProofCompact from '@/components/SocialProofCompact';
import Services from '@/components/Services';
import EcosistemaIntegral from '@/components/EcosistemaIntegral';
import CaseStudiesCompact from '@/components/CaseStudiesCompact';
import OperationsCompact from '@/components/OperationsCompact';
import WhyChooseCapittal from '@/components/WhyChooseCapittal';
import Contact from '@/components/Contact';

const Index = () => {
  return (
    <HomeLayout>
      <Hero />
      <SocialProofCompact />
      <Services />
      <EcosistemaIntegral />
      <CaseStudiesCompact />
      <OperationsCompact />
      <WhyChooseCapittal />
      <Contact />
    </HomeLayout>
  );
};

export default Index;
