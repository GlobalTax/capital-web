import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Users, Trophy, TrendingUp } from 'lucide-react';

export const EnhancedHeroSection = () => {
  const scrollToForm = () => {
    const formSection = document.getElementById('application-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-32 pb-20 bg-white min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium mb-8">
                <Star className="w-4 h-4 mr-2" />
                Programa Exclusivo
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-8 leading-tight">
                Únete al equipo de expertos en M&A
              </h1>
              
              <p className="text-lg text-gray-600 mb-12 leading-relaxed max-w-2xl">
                Forma parte de nuestra red de profesionales especializados. 
                Trabaja en transacciones de alto nivel con la flexibilidad 
                que buscas y el respaldo de 15 años de experiencia.
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-8 mb-12 py-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black mb-2">€5M-€100M+</div>
                  <div className="text-sm text-gray-600">Proyectos Premium</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black mb-2">50+</div>
                  <div className="text-sm text-gray-600">Colaboradores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black mb-2">95%</div>
                  <div className="text-sm text-gray-600">Satisfacción</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <Button 
                  className="bg-black text-white hover:bg-gray-900 px-8 py-3 rounded-lg font-medium"
                  onClick={scrollToForm}
                >
                  Aplicar Ahora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button 
                  className="bg-white text-black border border-gray-300 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out px-8 py-3"
                >
                  Ver Requisitos
                </Button>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="lg:col-span-5">
              <div className="relative">
                {/* Main dashboard card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-gray-900 text-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Capittal Collaborators</h3>
                        <p className="text-gray-300 text-sm">Network Dashboard</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-black mb-2">50+</div>
                        <div className="text-sm text-gray-600">Colaboradores Activos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-black mb-2">€1.2B</div>
                        <div className="text-sm text-gray-600">Valor Gestionado</div>
                      </div>
                    </div>

                    {/* Recent activity */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 mb-4">Actividad Reciente</h4>
                      
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-gray-900">TechCorp Valuation</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">€25M</div>
                          <div className="text-sm text-green-600">Completado</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium text-gray-900">Industrial M&A</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">€45M</div>
                          <div className="text-sm text-blue-600">En Progreso</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-black rounded-full"></div>
                          <span className="font-medium text-gray-900">Retail DD</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">€18M</div>
                          <div className="text-sm text-black">Iniciado</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Proyectos Q4 2024</span>
                        <span className="font-bold text-gray-900">23 activos</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Stats */}
                <div className="absolute -top-4 -right-4 bg-black text-white rounded-lg p-4 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div>
                      <div className="font-bold">+12</div>
                      <div className="text-xs text-gray-300">Nuevos</div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-4 shadow-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">95%</div>
                    <div className="text-xs text-gray-500">Satisfacción</div>
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

export default EnhancedHeroSection;