
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Team from '@/components/Team';

const Equipo = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <Team />
      </div>
      <Footer />
    </div>
  );
};

export default Equipo;
