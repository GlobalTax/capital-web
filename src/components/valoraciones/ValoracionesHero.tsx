
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Calculator, TrendingUp, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ValoracionesHero = () => {
  const beneficios = [
    'Valoración profesional en 5 minutos',
    'Metodologías utilizadas por expertos',
    'Análisis comparativo del mercado',
    'Reporte detallado gratuito'
  ];

  const metricas = [
    { valor: '€2.8B+', label: 'Valorado', icon: TrendingUp },
    { valor: '500+', label: 'Empresas', icon: Calculator },
    { valor: '95%', label: 'Precisión', icon: Shield },
    { valor: '5min', label: 'Tiempo', icon: Clock }
  ];

  return (
    <section className="pt-32 pb-20 bg-white min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center bg-black text-white rounded-lg px-4 py-2 mb-6">
              <span className="text-sm font-medium">Valoración Empresarial Profesional</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
              Descubre el Valor Real de tu Empresa
              <span className="block font-bold text-primary">
                en 5 Minutos
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Nuestra calculadora utiliza las mismas metodologías que empleamos en 
              valoraciones profesionales de €2.8B+ en transacciones reales.
            </p>

            <div className="space-y-4 mb-10">
              {beneficios.map((beneficio, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-700">{beneficio}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/lp/calculadora">
                <InteractiveHoverButton 
                  text="Calcular Valoración Gratis" 
                  variant="primary" 
                  size="lg" 
                  className="w-full sm:w-auto"
                />
              </Link>
              <InteractiveHoverButton 
                text="Ver Ejemplo de Reporte" 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto"
              />
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {metricas.map((metrica, index) => {
                const Icon = metrica.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-3 mx-auto">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-black mb-1">{metrica.valor}</div>
                    <div className="text-sm text-gray-600">{metrica.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            {/* Preview de la Calculadora */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-gray-900 text-white p-6">
                <h3 className="text-lg font-semibold mb-2">Calculadora de Valoración</h3>
                <p className="text-gray-300 text-sm">Paso 1 de 3</p>
              </div>
              
              {/* Simulación de campos */}
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Empresa
                  </label>
                  <div className="w-full h-12 bg-gray-100 rounded-lg flex items-center px-4">
                    <span className="text-gray-400">Ej: Mi Empresa S.L.</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sector de Actividad
                  </label>
                  <div className="w-full h-12 bg-gray-100 rounded-lg flex items-center px-4">
                    <span className="text-gray-400">Seleccionar sector...</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facturación Anual (€)
                  </label>
                  <div className="w-full h-12 bg-gray-100 rounded-lg flex items-center px-4">
                    <span className="text-gray-400">Ej: 1,500,000</span>
                  </div>
                </div>

                <Link to="/lp/calculadora">
                  <InteractiveHoverButton 
                    text="Comenzar Valoración →" 
                    variant="primary" 
                    size="lg" 
                    className="w-full"
                  />
                </Link>
              </div>
            </div>
            
            {/* Indicadores flotantes */}
            <div className="absolute -top-6 -left-6 bg-white border-2 border-blue-500 rounded-xl p-4 shadow-xl">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">5min</div>
                <div className="text-xs text-gray-600">Rápido</div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-black text-white rounded-xl p-4 shadow-xl">
              <div className="text-center">
                <div className="text-lg font-bold">100%</div>
                <div className="text-xs text-gray-300">Gratis</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValoracionesHero;
