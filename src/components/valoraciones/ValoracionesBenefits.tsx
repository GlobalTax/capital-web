
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
    <section className="py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6">
            ¿Cuándo Necesitas una Valoración?
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Conocer el valor de tu empresa es fundamental en múltiples situaciones empresariales.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {casos.map((caso, index) => {
            const Icon = caso.icon;
            return (
              <div key={index} className="group text-center">
                <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-primary transition-colors h-full">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">{caso.titulo}</h3>
                  <p className="text-slate-600 text-xs mb-4 leading-relaxed">{caso.descripcion}</p>
                  <div className="bg-slate-50 text-slate-600 px-3 py-2 rounded text-xs font-medium">
                    {caso.beneficio}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg p-8 border border-slate-200">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-6">
                ¿Qué Incluye tu Valoración Gratuita?
              </h3>
              <div className="space-y-3 mb-6">
                {ventajas.map((ventaja, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-600 text-sm">{ventaja}</span>
                  </div>
                ))}
              </div>
              <Link to="/lp/calculadora-web">
                <InteractiveHoverButton 
                  text="Comenzar Valoración Gratuita" 
                  variant="primary" 
                  size="lg" 
                  className="w-full sm:w-auto"
                />
              </Link>
            </div>

            <div className="relative">
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-slate-900">Reporte de Valoración</h4>
                  <span className="bg-slate-900 text-white px-2 py-1 rounded text-xs font-medium">
                    Ejemplo
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600 text-sm">Valor Estimado</span>
                    <span className="text-lg font-semibold text-slate-900">€2.8M - €3.4M</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600 text-sm">Múltiplo EBITDA</span>
                    <span className="font-medium text-slate-700">6.2x</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600 text-sm">Vs. Mediana Sector</span>
                    <span className="text-primary font-medium">+18%</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 text-sm">Puntuación</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full mr-1 ${i < 4 ? 'bg-slate-400' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Próxima actualización</span>
                    <span>En 3 meses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValoracionesBenefits;
