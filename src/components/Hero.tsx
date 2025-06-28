
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-small font-medium mb-8">
            Especialistas en M&A desde 2008
          </div>
          
          <h1 className="text-display font-bold text-black mb-8 leading-tight max-w-4xl mx-auto">
            Maximizamos el Valor de tu Empresa en su Venta
          </h1>
          
          <p className="content-text text-gray-600 max-w-3xl mx-auto mb-12">
            Somos la boutique M&A líder en España. Conseguimos valoraciones superiores 
            al mercado gracias a nuestro proceso optimizado y experiencia de más de 15 años.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button className="capittal-button button-label text-lg px-8 py-4 bg-black text-white hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              Valorar mi Empresa Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button variant="outline" className="button-label text-lg px-8 py-4 border-gray-300 text-black hover:bg-gray-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <Play className="mr-2 h-5 w-5" />
              Ver Casos de Éxito
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="metric-value text-black mb-2">200+</div>
              <div className="metric-label">Operaciones Completadas</div>
            </div>
            <div className="text-center">
              <div className="metric-value text-black mb-2">€2.5B</div>
              <div className="metric-label">Valor Total Transacciones</div>
            </div>
            <div className="text-center">
              <div className="metric-value text-black mb-2">40%</div>
              <div className="metric-label">Superior al Mercado</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
