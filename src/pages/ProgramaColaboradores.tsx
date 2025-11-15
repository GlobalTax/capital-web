import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { EnhancedHeroSection } from '@/components/collaborators/EnhancedHeroSection';
import { EnhancedBenefitsSection } from '@/components/collaborators/EnhancedBenefitsSection';
import { ProcessTimeline } from '@/components/collaborators/ProcessTimeline';
import { TestimonialsSection } from '@/components/collaborators/TestimonialsSection';
import { FAQSection } from '@/components/collaborators/FAQSection';
import { EnhancedCollaboratorForm } from '@/components/collaborators/EnhancedCollaboratorForm';
import { FinalCTASection } from '@/components/collaborators/FinalCTASection';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo';

const ProgramaColaboradores = () => {
  return (
    <>
      <SEOHead 
        title="Programa de Colaboradores M&A - Únete a Capittal"
        description="Únete al programa de colaboradores de Capittal. Gana comisiones atractivas recomendando nuestros servicios M&A. Red de profesionales y expertos del sector."
        canonical="https://capittal.es/programa-colaboradores"
        keywords="programa colaboradores M&A, red asesores M&A, comisiones M&A, partnership M&A España"
        structuredData={getWebPageSchema(
          "Programa de Colaboradores Capittal",
          "Red de colaboradores profesionales en M&A con comisiones atractivas",
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
        <section id="application-form" className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <EnhancedCollaboratorForm />
          </div>
        </section>
        <FAQSection />
        <FinalCTASection />
      </main>
      
        <Footer />
      </div>
    </>
  );
};

export default ProgramaColaboradores;