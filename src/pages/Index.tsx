
import React from 'react';
import Header from '@/components/Header';
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
import Footer from '@/components/Footer';
import OurGroup from '@/components/OurGroup';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';
import SEO from '@/components/SEO';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SEO
        title="Asesores M&A y valoración de empresas"
        description="Asesoría en fusiones y adquisiciones, valoración de empresas y venta de compañías en España. Expertos en M&A."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Capittal",
          address: [
            "Carrer Ausias March número 36 principal.",
            "P.º de la Castellana, 11, B - A, Chamberí, 28046 Madrid"
          ]
        }}
      />
      <main role="main">
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
