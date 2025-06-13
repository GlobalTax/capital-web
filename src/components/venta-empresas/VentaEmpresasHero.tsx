
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const VentaEmpresasHero = () => {
  const benefits = [
    'Maximizamos el valor de tu empresa',
    'Proceso confidencial y profesional',
    'Acceso a compradores cualificados',
    'Asesoramiento integral durante todo el proceso'
  ];

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
              Vende tu Empresa al
              <span className="block text-gray-600">Mejor Precio</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Especialistas en la venta de empresas con más de 15 años de experiencia. 
              Te acompañamos en todo el proceso para maximizar el valor de tu negocio 
              y encontrar el comprador ideal.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="capittal-button text-lg px-8 py-4">
                Solicitar Valoración Gratuita
              </Button>
              <Button variant="outline" className="text-lg px-8 py-4 border-black hover:bg-gray-50">
                Descargar Guía
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-black mb-6">
                Valoración Gratuita
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la empresa
                  </label>
                  <input
                    type="text"
                    className="capittal-input w-full"
                    placeholder="Introduce el nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sector de actividad
                  </label>
                  <input
                    type="text"
                    className="capittal-input w-full"
                    placeholder="Ej: Tecnología, Retail..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facturación anual aproximada
                  </label>
                  <select className="capittal-input w-full">
                    <option>Menos de 1M€</option>
                    <option>1M€ - 5M€</option>
                    <option>5M€ - 10M€</option>
                    <option>10M€ - 50M€</option>
                    <option>Más de 50M€</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de contacto
                  </label>
                  <input
                    type="email"
                    className="capittal-input w-full"
                    placeholder="tu@email.com"
                  />
                </div>
                <Button className="capittal-button w-full">
                  Obtener Valoración
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasHero;
