
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

  const stats = [
    { label: 'Empresas vendidas', value: '200+' },
    { label: 'Valor total transacciones', value: '€2.5B' },
    { label: 'Tasa de éxito', value: '85%' },
    { label: 'Múltiplo promedio', value: '4.2x' }
  ];

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Bar */}
        <div className="bg-gray-50 rounded-xl p-6 mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-2xl lg:text-3xl font-bold text-black mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-2 mb-6">
              <TrendingUp className="h-4 w-4 text-black mr-2" />
              <span className="text-sm font-medium text-black">Especialistas en M&A</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-black mb-6 leading-tight">
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
            <div className="capittal-card p-8 max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-black mb-6 text-center">
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
