
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
    <section className="carta-section bg-gradient-to-b from-muted/50 to-background">
      <div className="carta-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="font-semibold text-foreground mb-6 leading-tight tracking-tight">
              Vende tu empresa al
              <span className="block text-muted-foreground">mejor precio</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Especialistas en la venta de empresas con más de 15 años de experiencia. 
              Te acompañamos en todo el proceso para maximizar el valor de tu negocio 
              y encontrar el comprador ideal.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-foreground font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="carta-button text-base px-8 py-4">
                Solicitar Valoración Gratuita
              </Button>
              <Button className="carta-button-outline text-base px-8 py-4">
                Descargar Guía
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="carta-card">
              <h3 className="text-2xl font-semibold text-foreground mb-6">
                Valoración Gratuita
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre de la empresa
                  </label>
                  <input
                    type="text"
                    className="carta-input w-full"
                    placeholder="Introduce el nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sector de actividad
                  </label>
                  <input
                    type="text"
                    className="carta-input w-full"
                    placeholder="Ej: Tecnología, Retail..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Facturación anual aproximada
                  </label>
                  <select className="carta-input w-full">
                    <option>Menos de 1M€</option>
                    <option>1M€ - 5M€</option>
                    <option>5M€ - 10M€</option>
                    <option>10M€ - 50M€</option>
                    <option>Más de 50M€</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email de contacto
                  </label>
                  <input
                    type="email"
                    className="carta-input w-full"
                    placeholder="tu@email.com"
                  />
                </div>
                <Button className="carta-button w-full">
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
