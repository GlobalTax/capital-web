
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NosotrosTabs from '@/components/nosotros/NosotrosTabs';

const Nosotros = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <NosotrosTabs />
      </div>
      <Footer />
    </div>
  );
};

export default Nosotros;
