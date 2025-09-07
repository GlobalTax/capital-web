
import React from 'react';

const AsesoramientoLegalBenefits = () => {
  const benefits = [
    {
      title: 'Protección Total',
      description: 'Identificamos y mitigamos todos los riesgos legales antes de que se conviertan en problemas costosos.',
      stats: '98% sin litigios post-cierre'
    },
    {
      title: 'Cumplimiento Normativo',
      description: 'Garantizamos el cumplimiento de toda la normativa aplicable, evitando sanciones y complicaciones.',
      stats: '100% compliance'
    },
    {
      title: 'Optimización Estructural',
      description: 'Diseñamos la estructura legal más eficiente para tu operación, optimizando beneficios fiscales.',
      stats: 'Hasta 25% ahorro fiscal'
    },
    {
      title: 'Negociación Experta',
      description: 'Nuestros abogados especializados en M&A negocian las mejores condiciones para proteger tus intereses.',
      stats: '+15% valor protegido'
    },
    {
      title: 'Rapidez y Eficiencia',
      description: 'Procesos optimizados que aceleran el cierre sin comprometer la calidad del asesoramiento legal.',
      stats: '30% más rápido'
    },
    {
      title: 'Seguimiento Post-Cierre',
      description: 'Acompañamiento legal continuo para garantizar el cumplimiento de todas las obligaciones pactadas.',
      stats: '12 meses seguimiento'
    }
  ];

  const casosExito = [
    {
      tipo: 'Adquisición Tecnológica',
      problema: 'Patentes y PI complejos',
      solucion: 'Estructuración IP y garantías específicas',
      resultado: 'Cierre exitoso sin riesgos',
      highlight: true
    },
    {
      tipo: 'Venta Industrial',
      problema: 'Pasivos ambientales',
      solucion: 'Due diligence ambiental y seguros',
      resultado: 'Protección total del vendedor',
      highlight: false
    },
    {
      tipo: 'Fusión Internacional',
      problema: 'Regulaciones múltiples jurisdicciones',
      solucion: 'Coordinación legal internacional',
      resultado: 'Aprobaciones regulatorias obtenidas',
      highlight: false
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            ¿Por Qué Confiar en Nuestro Equipo Legal?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Más de 15 años protegiendo los intereses de nuestros clientes en operaciones M&A. 
            Experiencia que marca la diferencia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center group">
              <div className="bg-gray-50 text-gray-300 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-100 transition-colors duration-300">
                <span className="text-sm font-medium">{index + 1}</span>
              </div>
              
              <h3 className="text-lg font-bold text-black mb-4">
                {benefit.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {benefit.description}
              </p>
              
              <div className="bg-gray-50 rounded-lg py-3 px-4 border border-gray-200">
                <span className="text-sm font-bold text-black">
                  {benefit.stats}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-black mb-8">
              Casos Legales Resueltos
            </h3>
            <div className="space-y-6">
              {casosExito.map((caso, index) => (
                <div key={index} className={`border-l-4 ${caso.highlight ? 'border-black bg-gray-50' : 'border-gray-300'} pl-6 py-4 rounded-r-lg`}>
                  <h4 className="font-bold text-lg text-black">{caso.tipo}</h4>
                  <p className="text-gray-600 mb-1"><strong>Desafío:</strong> {caso.problema}</p>
                  <p className="text-gray-600 mb-1"><strong>Solución:</strong> {caso.solucion}</p>
                  <p className="text-green-600 font-semibold">{caso.resultado}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            <h4 className="text-xl font-bold text-black mb-8 text-center">
              Nuestros Resultados Legales
            </h4>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">+100</div>
                <div className="text-gray-600 text-sm">Operaciones asesoradas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">905 millones</div>
                <div className="text-gray-600 text-sm">Valor protegido</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">98%</div>
                <div className="text-gray-600 text-sm">Sin litigios post-cierre</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">15+</div>
                <div className="text-gray-600 text-sm">Años experiencia</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AsesoramientoLegalBenefits;
