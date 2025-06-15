
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-40 pb-32 bg-white min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Column - Content */}
          <div>
            <h1 className="text-6xl md:text-7xl font-normal text-black mb-10 leading-tight tracking-tight">
              Maximizamos el
              <br />
              <span className="text-gray-600">valor</span>
              {' '}de tu empresa
            </h1>
            
            <p className="text-2xl text-gray-600 mb-16 leading-relaxed font-normal max-w-lg">
              Somos especialistas en fusiones y adquisiciones con más de 15 años de experiencia. 
              Te acompañamos en cada paso para conseguir la mejor valoración.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Button className="capittal-button text-xl px-12 py-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Evaluar mi Empresa
                <ArrowRight className="ml-3" size={24} />
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-transparent border-0.5 border-black rounded-lg px-12 py-6 text-xl font-normal hover:bg-black hover:text-white transition-all duration-300 shadow-sm"
              >
                Ver Casos de Éxito
              </Button>
            </div>
          </div>

          {/* Right Column - Stats Card */}
          <div className="relative">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="text-8xl font-bold text-black mb-6">15+</div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-6">Años de Experiencia</h3>
                  <p className="text-gray-600 max-w-sm text-lg">
                    Maximizando el valor de empresas a través de nuestro proceso probado
                  </p>
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
