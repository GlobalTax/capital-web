
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import LogoCarousel from '@/components/LogoCarousel';
import MarketInsights from '@/components/MarketInsights';
import WhyChooseCapittal from '@/components/WhyChooseCapittal';
import Services from '@/components/Services';
import CompaniesForSale from '@/components/CompaniesForSale';
import About from '@/components/About';
import CaseStudies from '@/components/CaseStudies';
import Team from '@/components/Team';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <LogoCarousel />
      <MarketInsights />
      <WhyChooseCapittal />
      <Services />
      <CompaniesForSale />
      <About />
      <CaseStudies />
      <Team />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
