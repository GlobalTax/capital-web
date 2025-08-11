
import React from 'react';
import { CheckCircle, TrendingUp, Users, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const ValoracionesBenefits = () => {
  const casos = [
    {
      icon: TrendingUp,
      titulo: 'Preparar la Venta',
      descripcion: 'Conoce el valor de mercado antes de negociar con potenciales compradores.',
      beneficio: 'Maximiza el precio de venta'
    },
    {
      icon: Users,
      titulo: 'Atraer Inversores',
      descripcion: 'Presenta valoraciones profesionales para rondas de inversión.',
      beneficio: 'Acelera el proceso de fundraising'
    },
    {
      icon: Shield,
      titulo: 'Planificación Estratégica',
      descripcion: 'Evalúa el impacto de decisiones estratégicas en el valor empresarial.',
      beneficio: 'Toma decisiones informadas'
    },
    {
      icon: Clock,
      titulo: 'Procesos Legales',
      descripcion: 'Valoraciones para herencias, divorcios o disputas societarias.',
      beneficio: 'Soporte legal y fiscal'
    }
  ];

  const ventajas = [
    'Reporte profesional en PDF descargable',
    'Análisis comparativo con el sector',
    'Recomendaciones para incrementar valor',
    'Acceso a base de datos de transacciones',
    'Consulta gratuita con nuestros expertos',
    'Actualización trimestral sin coste'
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            ¿Cuándo Necesitas una Valoración?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conocer el valor de tu empresa es fundamental en múltiples situaciones empresariales.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {casos.map((caso, index) => {
            const Icon = caso.icon;
            return (
              <div key={index} className="group text-center">
                <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-3">{caso.titulo}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{caso.descripcion}</p>
                  <div className="bg-gray-100 text-black px-3 py-2 rounded-lg text-xs font-semibold">
                    {caso.beneficio}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg p-12 border border-gray-200">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-black mb-6">
                ¿Qué Incluye tu Valoración Gratuita?
              </h3>
              <div className="space-y-4 mb-8">
                {ventajas.map((ventaja, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{ventaja}</span>
                  </div>
                ))}
              </div>
              <Link to="/lp/calculadora">
                <InteractiveHoverButton 
                  text="Comenzar Valoración Gratuita" 
                  variant="primary" 
                  size="lg" 
                  className="w-full sm:w-auto"
                />
              </Link>
            </div>

            <div className="relative">
              <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold text-black">Reporte de Valoración</h4>
                  <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Ejemplo
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Valor Estimado</span>
                    <span className="text-2xl font-bold text-black">€2.8M - €3.4M</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Múltiplo EBITDA</span>
                    <span className="font-semibold text-gray-800">6.2x</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Vs. Mediana Sector</span>
                    <span className="text-green-600 font-semibold">+18%</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Puntuación</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full mr-1 ${i < 4 ? 'bg-yellow-400' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Próxima actualización</span>
                    <span>En 3 meses</span>
                  </div>
                </div>
              </div>

              {/* Elementos decorativos */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-black rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gray-800 rounded-full opacity-30"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValoracionesBenefits;
