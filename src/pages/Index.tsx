
import React from 'react';
import HomeLayout from '@/components/shared/HomeLayout';
import Hero from '@/components/Hero';
import SocialProofCompact from '@/components/SocialProofCompact';
import Services from '@/components/Services';
import EcosistemaIntegral from '@/components/EcosistemaIntegral';
import CaseStudiesCompact from '@/components/CaseStudiesCompact';
import OperationsTeaser from '@/components/operations/OperationsTeaser';
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
      <OperationsTeaser />
      <WhyChooseCapittal />
      <Contact />
    </HomeLayout>
  );
};

export default Index;
