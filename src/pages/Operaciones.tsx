import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OperationsSection from '@/components/operations/OperationsSection';
import { Building, TrendingUp, Users, Globe } from 'lucide-react';

const Operaciones = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Oportunidades de <span className="text-primary">Adquisición</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Explora nuestro portfolio exclusivo de empresas en venta, 
                cuidadosamente seleccionadas por su potencial de crecimiento y rentabilidad.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <Building className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">47+</div>
                  <div className="text-sm text-gray-600">Operaciones Activas</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">€180M+</div>
                  <div className="text-sm text-gray-600">Valor Total Portfolio</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">85%</div>
                  <div className="text-sm text-gray-600">Tasa de Éxito</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <Globe className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">12</div>
                  <div className="text-sm text-gray-600">Sectores Cubiertos</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Operations List */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <OperationsSection 
              variant="full" 
              showFilters={true}
              showStats={false}
              showCTA={false}
              displayLocation="operaciones"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Nuestro equipo tiene acceso a un pipeline exclusivo de operaciones off-market. 
              Comparte tus criterios de inversión y te ayudaremos a encontrar la oportunidad perfecta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contacto"
                className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Contactar Equipo
              </a>
              <a
                href="/compra-empresas"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Ver Proceso de Adquisición
              </a>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Operaciones;