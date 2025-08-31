import React, { useEffect } from 'react';
import HomeLayout from '@/components/shared/HomeLayout';
import CompaniesForSale from '@/components/CompaniesForSale';

const Oportunidades = () => {
  useEffect(() => {
    document.title = 'Oportunidades de Inversión - Capittal';
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Descubre oportunidades exclusivas de compra de empresas. Acceso privilegiado a transacciones seleccionadas en diversos sectores.');
  }, []);

  return (
    <HomeLayout>
      <div className="pt-16">
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
                Oportunidades de Inversión
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Acceso exclusivo a empresas cuidadosamente seleccionadas para venta o inversión. 
                Oportunidades de alto valor en sectores estratégicos.
              </p>
            </div>
          </div>
        </section>
        <CompaniesForSale />
      </div>
    </HomeLayout>
  );
};

export default Oportunidades;