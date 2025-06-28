
import React from 'react';
import { BarChart3, TrendingUp, Calculator, Award } from 'lucide-react';

const ValoracionesMethodology = () => {
  const metodologias = [
    {
      icon: BarChart3,
      titulo: 'Múltiplos de Mercado',
      descripcion: 'Comparación con empresas similares cotizadas y transacciones recientes del sector.',
      precision: '±15%'
    },
    {
      icon: TrendingUp,
      titulo: 'Flujos de Caja Descontados',
      descripcion: 'Análisis de la capacidad de generación de caja futura de la empresa.',
      precision: '±20%'
    },
    {
      icon: Calculator,
      titulo: 'Valor Contable Ajustado',
      descripcion: 'Valoración de activos tangibles e intangibles a precios de mercado.',
      precision: '±10%'
    },
    {
      icon: Award,
      titulo: 'Síntesis Final',
      descripcion: 'Combinación ponderada de las metodologías para obtener un rango de valor.',
      precision: '±12%'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Metodologías de Valoración Profesional
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Utilizamos las mismas técnicas que empleamos en valoraciones profesionales 
            para grandes corporaciones y operaciones de M&A.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {metodologias.map((metodologia, index) => {
            const Icon = metodologia.icon;
            return (
              <div key={index} className="group">
                <div className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-black group-hover:text-blue-600 transition-colors duration-300">
                          {metodologia.titulo}
                        </h3>
                        <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {metodologia.precision}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {metodologia.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="bg-white rounded-lg p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-black mb-4">
              ¿Por qué confiar en nuestra valoración?
            </h3>
            <p className="text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
              Nuestro algoritmo combina más de 15 años de experiencia en M&A con 
              datos de mercado actualizados semanalmente de más de 50,000 transacciones.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-black">500+</div>
                <div className="text-gray-600">Empresas valoradas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black">€2.8B+</div>
                <div className="text-gray-600">Valor total analizado</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black">95%</div>
                <div className="text-gray-600">Precisión promedio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValoracionesMethodology;
