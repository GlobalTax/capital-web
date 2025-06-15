
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, TrendingUp } from 'lucide-react';

const VentaEmpresasHero = () => {
  const benefits = [
    'Maximizamos el valor de tu empresa',
    'Proceso confidencial y profesional',
    'Acceso a compradores cualificados',
    'Asesoramiento integral durante todo el proceso'
  ];

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-2 mb-6">
              <TrendingUp className="h-4 w-4 text-black mr-2" />
              <span className="text-sm font-medium text-black">Especialistas en M&A</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-black mb-6 leading-tight">
              Vende tu Empresa al
              <span className="block text-gray-600">Mejor Precio</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Más de 15 años de experiencia ayudando a empresarios a obtener 
              el máximo valor por sus negocios. Proceso confidencial y resultados garantizados.
            </p>

            <div className="space-y-4 mb-10">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="capittal-button text-lg px-8 py-4 group">
                Solicitar Valoración Gratuita
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="text-lg px-8 py-4 border-black hover:bg-gray-50">
                Descargar Guía
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&h=600" 
                alt="Reunión de negocios - Venta de empresas"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasHero;
