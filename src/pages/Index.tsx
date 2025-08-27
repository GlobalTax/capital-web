
import React from 'react';
import { HomeLayout } from '@/shared';
import Hero from '@/components/Hero';
import LogoCarousel from '@/components/LogoCarousel';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import MarketInsights from '@/components/MarketInsights';
import WhyChooseCapittal from '@/components/WhyChooseCapittal';
import Services from '@/components/Services';
import CompaniesForSale from '@/components/CompaniesForSale';
import About from '@/components/About';
import CaseStudies from '@/components/CaseStudies';
import Team from '@/components/Team';
import BlogSection from '@/components/BlogSection';
import Contact from '@/components/Contact';
import OurGroup from '@/components/OurGroup';

const Index = () => {
  return (
    <HomeLayout>
      <Hero />
      <LogoCarousel />
      <TestimonialsCarousel />
      <MarketInsights />
      <WhyChooseCapittal />
      <Services />
      <CompaniesForSale />
      <OurGroup />
      <About />
      <CaseStudies />
      <Team />
      <BlogSection />
      <Contact />
    </HomeLayout>
  );
};

export default Index;
