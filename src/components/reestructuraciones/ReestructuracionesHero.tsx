
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Link } from 'react-router-dom';
import { RefreshCw, TrendingUp, Shield, Target } from 'lucide-react';

const ReestructuracionesHero = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight">
                Reestructuraciones
                <span className="block text-black">Empresariales</span>
              </h1>
              <p className="text-xl text-black leading-relaxed">
                Procesos de reestructuración operativa y financiera diseñados 
                para maximizar el valor empresarial y asegurar la viabilidad futura.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-black">Reestructuración Operativa</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-black">Reestructuración Financiera</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-black">Optimización de Costes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-black">Turnaround Management</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contacto">
                <InteractiveHoverButton
                  text="Evaluar Reestructuración"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-300">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-black">Plan de Reestructuración</h3>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Activo
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <RefreshCw className="text-blue-600" size={20} />
                      <span className="font-medium">Análisis Situacional</span>
                    </div>
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs">Completado</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Target className="text-purple-600" size={20} />
                      <span className="font-medium">Plan Estratégico</span>
                    </div>
                    <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">En Progreso</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="text-green-600" size={20} />
                      <span className="font-medium">Implementación</span>
                    </div>
                    <div className="bg-gray-400 text-white px-2 py-1 rounded text-xs">Pendiente</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="text-red-600" size={20} />
                      <span className="font-medium">Seguimiento</span>
                    </div>
                    <div className="bg-gray-400 text-white px-2 py-1 rounded text-xs">Pendiente</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-bold text-black mb-2">Objetivos Principales</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• Reducir costes operativos en 25%</div>
                    <div>• Mejorar flujo de caja en 18 meses</div>
                    <div>• Reestructurar deuda financiera</div>
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

export default ReestructuracionesHero;
