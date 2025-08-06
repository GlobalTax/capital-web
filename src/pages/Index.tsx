
import React from 'react';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
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
import Footer from '@/components/Footer';
import OurGroup from '@/components/OurGroup';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main role="main">
        <HeroSlider />
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
      </main>
      <Footer />
      
      {/* Herramientas de accesibilidad flotantes */}
      <AccessibilityTools />
      <NotificationCenter className="mr-16" />
      
      {/* Live region para anuncios de accesibilidad */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="accessibility-announcements"
      />
    </div>
  );
};

export default Index;
