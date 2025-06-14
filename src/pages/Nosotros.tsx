
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import About from '@/components/About';

const Nosotros = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <About />
      </div>
      <Footer />
    </div>
  );
};

export default Nosotros;
