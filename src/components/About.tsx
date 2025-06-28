
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const About = () => {
  const stats = [
    { value: "200+", label: "Operaciones M&A" },
    { value: "€2.5B", label: "Valor Transaccionado" },
    { value: "15+", label: "Años de Experiencia" },
    { value: "40%", label: "Superior al Mercado" }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <Badge className="mb-6 bg-black text-white badge-text">
              Acerca de Capittal
            </Badge>
            
            <h2 className="section-title text-black mb-6">
              Líderes en M&A en España desde 2008
            </h2>
            
            <div className="space-y-6 mb-8">
              <p className="content-text text-gray-600">
                Somos la boutique de M&A líder en España, especializada exclusivamente en 
                fusiones y adquisiciones. Nuestro enfoque se centra en maximizar el valor 
                para nuestros clientes a través de un proceso optimizado y personalizado.
              </p>
              
              <p className="content-text text-gray-600">
                Con más de 15 años de experiencia y 200+ operaciones completadas, hemos 
                desarrollado una metodología única que nos permite conseguir valoraciones 
                superiores al mercado de forma consistente.
              </p>
              
              <p className="content-text text-gray-600">
                Nuestro equipo senior trabaja exclusivamente en cada operación, garantizando 
                el máximo nivel de expertise y atención personalizada para cada cliente.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="metric-value text-black mb-1">{stat.value}</div>
                  <div className="metric-label">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="capittal-button button-label bg-black text-white hover:bg-gray-800">
                Conocer Nuestro Equipo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button variant="outline" className="button-label">
                Ver Casos de Éxito
              </Button>
            </div>
          </div>

          {/* Image placeholder */}
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <p className="help-text text-gray-500">Imagen del equipo Capittal</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
