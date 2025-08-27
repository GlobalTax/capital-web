
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Team from '@/components/Team';

const Equipo = () => {
  useEffect(() => {
    // SEO Meta Tags
    document.title = 'Nuestro Equipo - Capittal | Profesionales M&A con Experiencia Global';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Conoce al equipo de expertos en M&A de Capittal. Profesionales con trayectorias excepcionales en las principales firmas de inversión y consultoría del mundo.');
    }

    // Structured Data for Team Page
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "Equipo de Capittal",
      "description": "Profesionales especializados en M&A con experiencia global",
      "url": "https://capittal.es/equipo",
      "mainEntity": {
        "@type": "Organization",
        "name": "Capittal",
        "description": "Firma especializada en M&A y asesoramiento financiero"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Team />
      <Footer />
    </div>
  );
};

export default Equipo;
