
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ValuationCalculatorV2 from '@/components/ValuationCalculatorV2';

const CalculadoraValoracionV2 = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Calculadora de valoración avanzada | Capittal</title>
        <meta name="description" content="Simula el valor de tu empresa con nuestra calculadora avanzada. Escenarios, múltiplos y fiscalidad en un flujo guiado." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Header />
      <main className="pt-20">
        <ValuationCalculatorV2 />
      </main>
      <Footer />
    </div>
  );
};

export default CalculadoraValoracionV2;
