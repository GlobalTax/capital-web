
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Link } from 'react-router-dom';

const PlanificacionFiscalHero = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="mb-8">
              <div className="inline-flex items-center bg-black text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                Optimización Fiscal desde 2008
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
                Planificación{' '}
                <span className="text-gray-600">Fiscal Estratégica</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Maximiza el valor de tu operación con estrategias fiscales avanzadas. 
                Nuestros expertos optimizan la carga tributaria sin comprometer el cumplimiento.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-3xl font-bold text-black mb-2">€180M</div>
                <div className="text-gray-600">Ahorro Fiscal Generado</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black mb-2">23%</div>
                <div className="text-gray-600">Ahorro Promedio</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contacto">
                <InteractiveHoverButton
                  text="Consulta Fiscal Gratuita"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                />
              </Link>
              <Link to="/calculadora-valoracion">
                <InteractiveHoverButton
                  text="Calculadora de Ahorro"
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
              <h3 className="text-lg font-bold text-black mb-4">
                Simulador de Optimización Fiscal
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valor de la Operación</span>
                  <span className="font-bold text-black">€15.000.000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fiscalidad Estándar</span>
                  <span className="text-red-600 font-bold">€3.450.000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Con Planificación Fiscal</span>
                  <span className="text-green-600 font-bold">€2.250.000</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-black">Ahorro Generado</span>
                    <span className="text-green-600">€1.200.000</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-2">Optimización Fiscal</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '80%'}}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">80% de Eficiencia Fiscal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanificacionFiscalHero;
