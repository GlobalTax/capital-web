
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ValuationCalculator from '@/components/ValuationCalculator';

const CalculadoraValoracion = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-20">
        <ValuationCalculator />
      </div>
      <Footer />
    </div>
  );
};

export default CalculadoraValoracion;
