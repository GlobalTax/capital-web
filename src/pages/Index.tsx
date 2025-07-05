
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import KPIBar from '@/components/KPIBar';
import LogoCarousel from '@/components/LogoCarousel';
import MarketInsights from '@/components/MarketInsights';
import WhyChooseCapittal from '@/components/WhyChooseCapittal';
import Services from '@/components/Services';
import CompaniesForSale from '@/components/CompaniesForSale';
import About from '@/components/About';
import CaseStudies from '@/components/CaseStudies';
import Team from '@/components/Team';
import BlogSection from '@/components/BlogSection';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';
import LazySection from '@/components/LazySection';

const Index = () => {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />
      <main role="main">
        {/* Above the fold - immediate load */}
        <Hero />
        <KPIBar />
        
        {/* Below the fold - lazy load */}
        <LazySection threshold={0.1} rootMargin="100px">
          <LogoCarousel />
        </LazySection>
        
        <LazySection threshold={0.1} rootMargin="100px">
          <MarketInsights />
        </LazySection>
        
        <LazySection threshold={0.1} rootMargin="100px">
          <WhyChooseCapittal />
        </LazySection>
        
        <LazySection threshold={0.1} rootMargin="100px">
          <Services />
        </LazySection>
        
        <LazySection threshold={0.1} rootMargin="100px">
          <CompaniesForSale />
        </LazySection>
        
        <LazySection threshold={0.1} rootMargin="100px">
          <About />
        </LazySection>
        
        <LazySection threshold={0.1} rootMargin="100px">
          <CaseStudies />
        </LazySection>
        
        <LazySection threshold={0.1} rootMargin="100px">
          <Team />
        </LazySection>
        
        <LazySection threshold={0.1} rootMargin="100px">
          <BlogSection />
        </LazySection>
        
        {/* Testimonials antes del footer */}
        <LazySection threshold={0.1} rootMargin="100px">
          <Testimonials />
        </LazySection>
        
        <LazySection threshold={0.1} rootMargin="100px">
          <Contact />
        </LazySection>
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
