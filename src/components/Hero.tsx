
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Shield, Users } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-24 pb-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-black/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-gray-900/5 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-white border-0.5 border-black rounded-full shadow-sm">
            <TrendingUp size={16} className="mr-2" />
            <span className="text-sm font-medium text-black">Líderes en M&A en España</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-8 leading-[0.9] tracking-tight">
            Maximizamos el
            <br />
            <span className="relative">
              <span className="text-gray-600">valor</span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-black/10 rounded-full"></div>
            </span>
            {' '}de tu empresa
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            Somos especialistas en fusiones y adquisiciones con más de 15 años de experiencia. 
            Te acompañamos en cada paso para conseguir la mejor valoración y encontrar el comprador ideal.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <Button className="capittal-button text-lg px-10 py-5 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Evaluar mi Empresa
              <ArrowRight className="ml-3" size={20} />
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-transparent border-0.5 border-black rounded-lg px-10 py-5 text-lg font-medium hover:bg-black hover:text-white transition-all duration-300 shadow-sm"
            >
              Ver Casos de Éxito
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="flex items-center justify-center space-x-3 text-gray-600">
              <Shield size={24} className="text-black" />
              <span className="font-medium">Proceso 100% Confidencial</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-gray-600">
              <Users size={24} className="text-black" />
              <span className="font-medium">Equipo de Expertos</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-gray-600">
              <TrendingUp size={24} className="text-black" />
              <span className="font-medium">Resultados Garantizados</span>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group">
              <div className="capittal-card text-center bg-gradient-to-br from-white to-gray-50/50 border-2 hover:border-black/20 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-black mb-3 group-hover:scale-110 transition-transform duration-300">
                  +150
                </div>
                <div className="text-gray-600 font-medium text-lg">
                  Transacciones Completadas
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  En los últimos 5 años
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="capittal-card text-center bg-gradient-to-br from-white to-gray-50/50 border-2 hover:border-black/20 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-black mb-3 group-hover:scale-110 transition-transform duration-300">
                  €2.5B
                </div>
                <div className="text-gray-600 font-medium text-lg">
                  Valor Transaccional
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Volumen gestionado
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="capittal-card text-center bg-gradient-to-br from-white to-gray-50/50 border-2 hover:border-black/20 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-black mb-3 group-hover:scale-110 transition-transform duration-300">
                  98%
                </div>
                <div className="text-gray-600 font-medium text-lg">
                  Tasa de Éxito
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Operaciones cerradas
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
