
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Link } from 'react-router-dom';

const AsesoramientoLegalHero = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="mb-8">
              <div className="inline-flex items-center bg-black text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                Asesoramiento Legal desde 2008
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
                Asesoramiento Legal en{' '}
                <span className="text-gray-600">Compraventas</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Protegemos tus intereses en cada operación. Nuestro equipo legal especializado 
                en M&A te acompaña desde la estructuración hasta el cierre exitoso.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-3xl font-bold text-black mb-2">200+</div>
                <div className="text-gray-600">Operaciones Asesoradas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black mb-2">€2.5B</div>
                <div className="text-gray-600">Valor Total Protegido</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contacto">
                <InteractiveHoverButton
                  text="Consulta Legal Gratuita"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                />
              </Link>
              <Link to="/calculadora-valoracion">
                <InteractiveHoverButton
                  text="Ver Casos de Éxito"
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
                Caso Legal en Progreso
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Due Diligence Legal</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Completado</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revisión Contractual</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">En Proceso</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estructuración Legal</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">Pendiente</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cierre Legal</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">Pendiente</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-2">Progreso del Caso</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-black h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">60% Completado</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AsesoramientoLegalHero;
