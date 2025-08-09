
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
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const Index = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Helmet>
        <title>Capittal | Asesores M&A y valoración de empresas</title>
        <meta name="description" content="Asesoría en fusiones y adquisiciones, valoración de empresas y venta de compañías en España. Expertos en M&A." />
        <link rel="canonical" href={canonical} />
      </Helmet>
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
