import React, { useEffect } from 'react';
import Team from '@/components/Team';

const Equipo = () => {
  useEffect(() => {
    document.title = 'Nuestro Equipo - Capittal';
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Conoce al equipo de expertos en M&A de Capittal. Profesionales con experiencia global y resultados probados en transacciones empresariales.');
  }, []);

  return <Team />;
};

export default Equipo;