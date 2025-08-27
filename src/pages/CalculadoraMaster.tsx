import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ValuationCalculatorMaster from '@/components/ValuationCalculatorMaster';

const CalculadoraMaster = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-20">
        <ValuationCalculatorMaster />
      </div>
      <Footer />
    </div>
  );
};

export default CalculadoraMaster;