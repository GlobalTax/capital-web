
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ValuationCalculatorV2 from '@/components/ValuationCalculatorV2';

const CalculadoraValoracionV2 = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-20">
        <ValuationCalculatorV2 />
      </div>
      <Footer />
    </div>
  );
};

export default CalculadoraValoracionV2;
