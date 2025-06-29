
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-small font-medium mb-8">
              Especialistas en M&A desde 2008
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-8 leading-tight">
              Maximizamos el Valor de tu Empresa en su Venta
            </h1>
            
            <p className="text-xl text-gray-600 mb-12">
              Somos la boutique M&A líder en España. Conseguimos valoraciones superiores 
              al mercado gracias a nuestro proceso optimizado y experiencia de más de 15 años.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-16">
              <Button className="capittal-button text-lg px-8 py-4 bg-black text-white hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                Valorar mi Empresa Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button variant="outline" className="text-lg px-8 py-4 border-gray-300 text-black hover:bg-gray-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <Play className="mr-2 h-5 w-5" />
                Ver Casos de Éxito
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center lg:text-left">
                <div className="text-4xl font-bold text-black mb-2">200+</div>
                <div className="text-gray-600">Operaciones Completadas</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-4xl font-bold text-black mb-2">€2.5B</div>
                <div className="text-gray-600">Valor Total</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-4xl font-bold text-black mb-2">40%</div>
                <div className="text-gray-600">Superior</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl overflow-hidden">
              <img 
                src="/lovable-uploads/d28e14ed-a017-449f-8ceb-3998713ef22f.png" 
                alt="Dashboard de Capittal Market mostrando análisis de empresas en tiempo real" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 max-w-xs">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Valoración Completada</div>
                  <div className="text-xs text-gray-500">Empresa del sector tech</div>
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
