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
const ProgramaColaboradoresContent = () => {
  const { t } = useI18n();
  
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
        <section id="benefits-section">
          <EnhancedBenefitsSection />
        </section>
        <ProcessTimeline />
        <TestimonialsSection />
        <section id="application-form" className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <EnhancedCollaboratorForm />
          </div>
        </section>
        <FAQSection />
      </main>
      
        <Footer />
      </div>
    </>
  );
};

// Componente detector de idioma por ruta
const RouteLanguageDetector = ({ path }: { path: string }) => {
  const { setLang } = useI18n();
  
  useEffect(() => {
    if (path.includes('col·laboradors') || path.includes('col-laboradors')) {
      setLang('ca');
    } else if (path.includes('collaborators-program')) {
      setLang('en');
    } else {
      setLang('es');
    }
  }, [path, setLang]);
  
  return null;
};

// Componente exportado con Provider
const ProgramaColaboradores = () => {
  const location = useLocation();
  
  return (
    <I18nProvider>
      <RouteLanguageDetector path={location.pathname} />
      <ProgramaColaboradoresContent />
    </I18nProvider>
  );
};

export default ProgramaColaboradores;