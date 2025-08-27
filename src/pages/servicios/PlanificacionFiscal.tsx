import React, { useEffect } from 'react';
import { HomeLayout } from '@/shared';
import SectorHero from '@/components/SectorHero';
import { Calculator, PiggyBank, FileText, TrendingDown } from 'lucide-react';

const PlanificacionFiscal = () => {
  useEffect(() => {
    document.title = 'Optimización Fiscal en Operaciones M&A | Capittal';
    
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Servicios especializados de planificación fiscal para optimizar la carga tributaria en operaciones corporativas. Estructuramos las transacciones de manera fiscalmente eficiente y cumpliendo con la normativa vigente.');
  }, []);

  return (
    <HomeLayout>
      <SectorHero
        sector="Planificación Fiscal"
        title="Optimización Fiscal en Operaciones M&A"
        description="Servicios especializados de planificación fiscal para optimizar la carga tributaria en operaciones corporativas. Estructuramos las transacciones de manera fiscalmente eficiente y cumpliendo con la normativa vigente."
        primaryButtonText="Consulta Fiscal"
        secondaryButtonText="Ver Estrategias"
      />
      
      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Servicios de Planificación Fiscal
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Optimización fiscal estratégica para operaciones corporativas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Calculator,
                title: "Estructuración Fiscal",
                description: "Diseño de estructuras fiscalmente eficientes para operaciones de M&A y reorganizaciones."
              },
              {
                icon: PiggyBank,
                title: "Optimización Tributaria",
                description: "Minimización de la carga fiscal aprovechando todos los beneficios y deducciones aplicables."
              },
              {
                icon: FileText,
                title: "Due Diligence Fiscal",
                description: "Análisis exhaustivo de contingencias fiscales y planificación de estrategias de mitigación."
              },
              {
                icon: TrendingDown,
                title: "Diferidos y Reorganizaciones",
                description: "Aplicación de regímenes especiales para diferir la tributación en reorganizaciones empresariales."
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border border-gray-300 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            ¿Quieres optimizar la fiscalidad de tu operación?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Nuestros expertos fiscales te ayudarán a estructurar tu transacción de manera eficiente
          </p>
          <button className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
            Consulta Fiscal Especializada
          </button>
        </div>
      </section>
    </HomeLayout>
  );
};

export default PlanificacionFiscal;