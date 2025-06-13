
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-24 pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Especialistas en
            <br />
            <span className="text-gray-700">Fusiones y Adquisiciones</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Somos su socio estratégico en operaciones de M&A, due diligence y valoraciones empresariales. 
            Experiencia y confianza en cada transacción.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button className="capittal-button text-lg px-8 py-4">
              Evaluar mi Empresa
              <ArrowRight className="ml-2" size={20} />
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-transparent border-0.5 border-black rounded-lg px-8 py-4 text-lg font-medium hover:bg-black hover:text-white transition-all duration-300"
            >
              Ver Casos de Éxito
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="capittal-card text-center">
              <div className="text-3xl font-bold text-black mb-2">+150</div>
              <div className="text-gray-600 font-medium">Transacciones Completadas</div>
            </div>
            
            <div className="capittal-card text-center">
              <div className="text-3xl font-bold text-black mb-2">€2.5B</div>
              <div className="text-gray-600 font-medium">Valor Transaccional</div>
            </div>
            
            <div className="capittal-card text-center">
              <div className="text-3xl font-bold text-black mb-2">15+</div>
              <div className="text-gray-600 font-medium">Años de Experiencia</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
