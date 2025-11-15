import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AcquisitionHero from '@/components/landing/AcquisitionHero';
import GrowthStrategy from '@/components/landing/GrowthStrategy';
import AcquisitionProcess from '@/components/landing/AcquisitionProcess';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import SuccessStories from '@/components/landing/SuccessStories';
import Contact from '@/components/Contact';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';

const CompraEmpresas = () => {
  return (
    <>
      <SEOHead 
        title="Compra de Empresas - Oportunidades de Adquisición | Capittal"
        description="Accede a oportunidades exclusivas de compra de empresas. Asesoramiento profesional en adquisiciones estratégicas y crecimiento empresarial por M&A en España."
        canonical="https://capittal.es/compra-empresas"
        keywords="compra empresas España, adquisiciones empresariales, oportunidades M&A, inversión empresarial"
        structuredData={[
          getServiceSchema(
            "Compra de Empresas",
            "Asesoramiento en adquisiciones empresariales y crecimiento por M&A",
            "Business Acquisition Service"
          ),
          getWebPageSchema(
            "Compra de Empresas",
            "Oportunidades exclusivas de adquisición empresarial",
            "https://capittal.es/compra-empresas"
          )
        ]}
      />
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-16">
          <AcquisitionHero />
          <GrowthStrategy />
          <AcquisitionProcess />
          <WhyChooseUs />
          <SuccessStories />
          <Contact 
            id="contact"
            pageOrigin="compra-empresas"
            variant="compra"
          />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default CompraEmpresas;
