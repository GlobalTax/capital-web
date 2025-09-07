
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const PlanificacionFiscalFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: '¿Cuánto puedo ahorrar con planificación fiscal?',
      answer: 'El ahorro depende de múltiples factores como el tipo de operación, estructura societaria y timing. En promedio, nuestros clientes ahorran un 23% en su carga fiscal, llegando hasta un 50% en casos complejos con estructuras internacionales. Realizamos un análisis inicial gratuito para estimar tu ahorro potencial.'
    },
    {
      question: '¿Es legal la planificación fiscal que realizáis?',
      answer: 'Absolutamente. Todas nuestras estrategias están basadas en normativa vigente, interpretaciones de la AEAT y jurisprudencia consolidada. Diferenciamos claramente entre planificación fiscal legítima y elusión fiscal. Nuestro equipo de expertos fiscales valida cada estrategia con rigor técnico y experiencia consolidada.'
    },
    {
      question: '¿Cuándo debe iniciarse la planificación fiscal?',
      answer: 'Idealmente, 6-12 meses antes de la operación. La planificación anticipada nos permite implementar estrategias más sofisticadas y efectivas. Sin embargo, también podemos optimizar operaciones en curso, aunque las opciones pueden ser más limitadas.'
    },
    {
      question: '¿Qué diferencia vuestra planificación de la de otros?',
      answer: 'Nuestro equipo combina experiencia en M&A con expertise fiscal especializado. Contamos con abogados fiscalistas senior, expertos en M&A y experiencia directa en más de 200 operaciones. Además, mantenemos relaciones con las mejores firmas fiscales internacionales para casos complejos.'
    },
    {
      question: '¿Cómo se estructura el coste del servicio?',
      answer: 'Ofrecemos diferentes modalidades: tarifa fija para análisis estándar, porcentaje del ahorro generado para casos complejos, o una combinación de ambas. El análisis inicial siempre es gratuito y sin compromiso. Solo cobramos si generamos valor real.'
    },
    {
      question: '¿Qué garantías ofrecéis sobre las estrategias fiscales?',
      answer: 'Ofrecemos garantía de cumplimiento normativo al 100%. En caso de discrepancia con Hacienda (muy poco frecuente), nos hacemos cargo de la defensa. Además, todas nuestras estrategias están respaldadas por opiniones legales escritas y análisis de jurisprudencia.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Preguntas Frecuentes sobre Planificación Fiscal
          </h2>
          <p className="text-lg text-gray-600">
            Resolvemos las dudas más comunes sobre optimización fiscal en operaciones M&A
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
              <button
                className="w-full text-left flex justify-between items-center hover:bg-gray-50 transition-colors p-2 -m-2 rounded-lg"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-base font-semibold text-black pr-4">
                  {faq.question}
                </h3>
                <div className="w-5 h-5 text-gray-500 flex-shrink-0">
                  {openIndex === index ? '−' : '+'}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-6">
            ¿Quieres conocer tu potencial de ahorro fiscal?
          </p>
          <Button className="bg-white text-black border border-gray-300 rounded-lg px-6 py-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            Análisis de Ahorro Gratuito
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PlanificacionFiscalFAQ;
