
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Search, Target, Users, Award, TrendingUp, Shield } from 'lucide-react';

const CompraEmpresas = () => {
  const benefits = [
    {
      icon: Search,
      title: 'Identificación de Oportunidades',
      description: 'Acceso exclusivo a empresas en venta que no están en el mercado público'
    },
    {
      icon: Target,
      title: 'Due Diligence Completa',
      description: 'Análisis exhaustivo financiero, legal y operacional antes de la compra'
    },
    {
      icon: Users,
      title: 'Negociación Experta',
      description: 'Representación profesional para obtener las mejores condiciones de compra'
    },
    {
      icon: Award,
      title: 'Integración Post-Compra',
      description: 'Asesoramiento en la integración y optimización de la empresa adquirida'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
              Compra de Empresas
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Te ayudamos a identificar y adquirir empresas que se alineen con tu estrategia de crecimiento. 
              Acceso exclusivo a oportunidades de compra y asesoramiento integral durante todo el proceso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-white border-0.5 border-black rounded-lg p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="bg-black text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-4">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Button className="bg-white text-black border-0.5 border-black rounded-lg px-8 py-4 text-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
              Explorar Oportunidades
            </Button>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
              Nuestro Proceso de Compra
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Un enfoque estructurado que minimiza riesgos y maximiza el valor de tu inversión
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border-0.5 border-black rounded-lg p-8 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Definición de Criterios</h3>
              <p className="text-gray-600">Establecemos juntos los criterios de búsqueda: sector, tamaño, ubicación y perfil financiero objetivo.</p>
            </div>

            <div className="bg-white border-0.5 border-black rounded-lg p-8 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Identificación y Análisis</h3>
              <p className="text-gray-600">Búsqueda activa de oportunidades y análisis preliminar de candidatos que cumplan tus criterios.</p>
            </div>

            <div className="bg-white border-0.5 border-black rounded-lg p-8 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Ejecución y Cierre</h3>
              <p className="text-gray-600">Due diligence completa, negociación de términos y acompañamiento hasta el cierre exitoso.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CompraEmpresas;
