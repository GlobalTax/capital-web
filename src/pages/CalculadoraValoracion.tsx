
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ValuationCalculator from '@/components/ValuationCalculator';

const CalculadoraValoracion = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Calculadora de valoración de empresas | Capittal</title>
        <meta name="description" content="Calcula el valor de tu empresa gratis en minutos. Simula escenarios con la metodología de Capittal." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Header />
      <main className="pt-20">
        <ValuationCalculator />
      </main>
      <Footer />
    </div>
  );
};

export default CalculadoraValoracion;
