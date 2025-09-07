
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AcquisitionHero from '@/components/landing/AcquisitionHero';
import GrowthStrategy from '@/components/landing/GrowthStrategy';
import AcquisitionProcess from '@/components/landing/AcquisitionProcess';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import SuccessStories from '@/components/landing/SuccessStories';
import Contact from '@/components/Contact';

const CompraEmpresas = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <AcquisitionHero />
        <GrowthStrategy />
        <AcquisitionProcess />
        <WhyChooseUs />
        <SuccessStories />
        <Contact 
          title="Solicita Información sobre Oportunidades"
          description="¿Interesado en adquirir una empresa? Cuéntanos qué tipo de oportunidad buscas y te pondremos en contacto con las mejores opciones del mercado."
          pageOrigin="compra-empresas"
        />
      </div>
      <Footer />
    </div>
  );
};

export default CompraEmpresas;
