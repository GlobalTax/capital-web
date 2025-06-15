
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CaseStudies = () => {
  const cases = [
    {
      title: 'Adquisición Tecnológica',
      sector: 'Tecnología',
      value: '€45M',
      description: 'Asesoramiento en la adquisición de una empresa de software por parte de una multinacional europea.',
      highlights: ['Due diligence completo', 'Negociación exitosa', 'Integración post-merger'],
    },
    {
      title: 'Fusión Industrial',
      sector: 'Manufactura',
      value: '€120M',
      description: 'Estructuración y ejecución de fusión entre dos líderes del sector manufacturero.',
      highlights: ['Valoración compleja', 'Sinergias identificadas', 'Proceso acelerado'],
    },
    {
      title: 'Venta Estratégica',
      sector: 'Retail',
      value: '€75M',
      description: 'Proceso de venta competitivo de cadena retail con múltiples oferentes internacionales.',
      highlights: ['Proceso competitivo', 'Múltiples ofertas', 'Maximización valor'],
    },
  ];

  return (
    <section id="casos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Casos de Éxito
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Nuestro historial habla por sí mismo. Descubra cómo hemos ayudado a empresas 
            a alcanzar sus objetivos estratégicos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.map((case_, index) => (
            <Card key={index} className="bg-white border-0.5 border-black rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-white border-0.5 border-black text-black rounded-lg hover:shadow-sm transition-all duration-300 ease-out">
                    {case_.sector}
                  </Badge>
                  <span className="text-xl font-bold text-black">{case_.value}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-black mb-3">
                  {case_.title}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                  {case_.description}
                </p>

                <div className="space-y-2">
                  {case_.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                      {highlight}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            ¿Quiere conocer más detalles sobre nuestros casos de éxito?
          </p>
          <button className="bg-white text-black border-0.5 border-black rounded-lg px-6 py-3 text-base font-medium hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            Descargar Case Studies
          </button>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
