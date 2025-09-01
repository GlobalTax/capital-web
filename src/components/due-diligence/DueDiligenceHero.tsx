
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Link } from 'react-router-dom';
import { Search, FileText, BarChart3, Shield } from 'lucide-react';

const DueDiligenceHero = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight">
                Due Diligence
                <span className="block text-gray-600">Exhaustivo y Preciso</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Análisis completo financiero, legal y comercial que identifica 
                riesgos ocultos y oportunidades reales en cada inversión.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Análisis 360°</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Informes Detallados</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Riesgos Identificados</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Recomendaciones</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contacto">
                <InteractiveHoverButton
                  text="Solicitar Análisis"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                />
              </Link>
              <InteractiveHoverButton
                text="Ver Metodología"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              />
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-300">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-black">Dashboard de Due Diligence</h3>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    En Progreso
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Search className="text-blue-600" size={20} />
                      <span className="font-medium">Análisis Financiero</span>
                    </div>
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs">98,7%</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-purple-600" size={20} />
                      <span className="font-medium">Due Diligence Legal</span>
                    </div>
                    <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">78%</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="text-green-600" size={20} />
                      <span className="font-medium">Análisis Comercial</span>
                    </div>
                    <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs">60%</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="text-red-600" size={20} />
                      <span className="font-medium">Evaluación de Riesgos</span>
                    </div>
                    <div className="bg-gray-400 text-white px-2 py-1 rounded text-xs">45%</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-bold text-black mb-2">Próximos Hitos</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• Revisión de contratos principales</div>
                    <div>• Análisis de competencia</div>
                    <div>• Informe final de riesgos</div>
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

export default DueDiligenceHero;
