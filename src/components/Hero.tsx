
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Shield, Users } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-32 pb-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 mb-8 bg-gray-50 border border-gray-200 rounded-full">
              <TrendingUp size={16} className="mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Líderes en M&A en España</span>
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
            
            <p className="text-xl text-gray-600 mb-12 leading-relaxed font-light max-w-lg">
              Somos especialistas en fusiones y adquisiciones con más de 15 años de experiencia. 
              Te acompañamos en cada paso para conseguir la mejor valoración.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
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

            {/* Trust indicators - Simplified */}
            <div className="flex flex-wrap gap-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield size={16} />
                <span>Proceso Confidencial</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users size={16} />
                <span>Equipo de Expertos</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp size={16} />
                <span>98% Tasa de Éxito</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Element */}
          <div className="relative animate-fade-in">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl"></div>
            
            {/* Main visual container */}
            <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
              {/* Mock dashboard/chart visual */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-900 rounded w-32"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="h-3 bg-gray-200 rounded flex-1"></div>
                    <div className="text-sm font-medium text-gray-900">€2.5M</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="h-3 bg-gray-200 rounded flex-1"></div>
                    <div className="text-sm font-medium text-gray-900">€1.8M</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div className="h-3 bg-gray-200 rounded flex-1"></div>
                    <div className="text-sm font-medium text-gray-900">€1.2M</div>
                  </div>
                </div>

                {/* Chart visualization */}
                <div className="mt-8">
                  <div className="flex items-end space-x-2 h-32">
                    <div className="bg-gray-300 rounded-t w-8 h-16"></div>
                    <div className="bg-gray-400 rounded-t w-8 h-20"></div>
                    <div className="bg-gray-600 rounded-t w-8 h-24"></div>
                    <div className="bg-black rounded-t w-8 h-32"></div>
                    <div className="bg-gray-500 rounded-t w-8 h-28"></div>
                    <div className="bg-gray-300 rounded-t w-8 h-18"></div>
                  </div>
                </div>
                
                <div className="text-center pt-4">
                  <div className="text-2xl font-bold text-gray-900">Valoración Optimizada</div>
                  <div className="text-sm text-gray-500 mt-1">Maximizamos el valor de tu empresa</div>
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
