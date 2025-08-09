
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Team from '@/components/Team';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const Equipo = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Helmet>
        <title>Equipo Capittal | Asesores M&A</title>
        <meta name="description" content="Conoce al equipo de Capittal, especialistas en M&A y valoración de empresas." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <div className="pt-16">
        <Team />
      </div>
      <Footer />
    </div>
  );
};

export default Equipo;
