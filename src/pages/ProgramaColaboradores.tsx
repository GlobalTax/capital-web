import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { EnhancedHeroSection } from '@/components/collaborators/EnhancedHeroSection';
import { EnhancedBenefitsSection } from '@/components/collaborators/EnhancedBenefitsSection';
import { ProcessTimeline } from '@/components/collaborators/ProcessTimeline';
import { TestimonialsSection } from '@/components/collaborators/TestimonialsSection';
import { FAQSection } from '@/components/collaborators/FAQSection';
import { EnhancedCollaboratorForm } from '@/components/collaborators/EnhancedCollaboratorForm';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo';
import { I18nProvider, useI18n } from '@/shared/i18n/I18nProvider';

// Componente interno que usa traducciones
const ProgramaColaboradores = () => {
  const location = useLocation();
  const { t, setLang } = useI18n();
  
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('col·laboradors') || path.includes('col-laboradors')) {
      setLang('ca');
    } else if (path.includes('collaborators-program')) {
      setLang('en');
    } else {
      setLang('es');
    }
  }, [location.pathname, setLang]);

  useEffect(() => {
    const hreflangUrls = {
      'es': 'https://capittal.es/programa-colaboradores',
      'ca': 'https://capittal.es/programa-col·laboradors',
      'en': 'https://capittal.es/collaborators-program',
      'x-default': 'https://capittal.es/programa-colaboradores'
    };
    
    Object.entries(hreflangUrls).forEach(([hreflang, url]) => {
      let link = document.querySelector(`link[hreflang="${hreflang}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', hreflang);
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    });
  }, []);
  
  return (
    <>
      <SEOHead 
        title={t('collab.seo.title')}
        description={t('collab.seo.description')}
        canonical="https://capittal.es/programa-colaboradores"
        keywords={t('collab.seo.keywords')}
        structuredData={getWebPageSchema(
          t('collab.seo.title'),
          t('collab.seo.description'),
          "https://capittal.es/programa-colaboradores"
        )}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <EnhancedHeroSection />
          <EnhancedBenefitsSection />
          <ProcessTimeline />
          <TestimonialsSection />
          <FAQSection />
          <EnhancedCollaboratorForm />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ProgramaColaboradores;