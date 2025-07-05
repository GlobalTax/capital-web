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

const ProgramaColaboradores = () => {
  return (
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
  );
};

export default ProgramaColaboradores;