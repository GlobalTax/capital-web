import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';
import DeLooperACapittalContent from '@/components/DeLooperACapittalContent';

const DeLooperACapittal = () => {
  useEffect(() => {
    // SEO optimization
    document.title = 'De Looper a Capittal: Nuestra Evolución | Capittal';
    
    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Descubre por qué evolucionamos de Looper a Capittal. Conoce nuestra historia, los beneficios del cambio y cómo seguimos mejorando nuestros servicios de valoración empresarial.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Descubre por qué evolucionamos de Looper a Capittal. Conoce nuestra historia, los beneficios del cambio y cómo seguimos mejorando nuestros servicios de valoración empresarial.';
      document.head.appendChild(meta);
    }

    // Canonical URL
    const canonicalUrl = 'https://capittal.es/de-looper-a-capittal';
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Open Graph meta tags
    const ogTags = [
      { property: 'og:title', content: 'De Looper a Capittal: Nuestra Evolución' },
      { property: 'og:description', content: 'Descubre por qué evolucionamos de Looper a Capittal y cómo seguimos mejorando nuestros servicios.' },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: 'website' }
    ];

    ogTags.forEach(tag => {
      let ogTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!ogTag) {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', tag.property);
        document.head.appendChild(ogTag);
      }
      ogTag.setAttribute('content', tag.content);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main role="main">
        <div className="pt-16">
          <DeLooperACapittalContent />
        </div>
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

export default DeLooperACapittal;