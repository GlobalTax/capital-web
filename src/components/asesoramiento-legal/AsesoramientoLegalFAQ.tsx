
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const AsesoramientoLegalFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: '¿Qué incluye el asesoramiento legal en M&A?',
      answer: 'Incluye due diligence legal completa, revisión y redacción de contratos, estructuración legal de la operación, asesoramiento en negociaciones, gestión de autorizaciones regulatorias y seguimiento post-cierre. Cubrimos todos los aspectos legales desde el inicio hasta después del cierre.'
    },
    {
      question: '¿Cuánto tiempo dura el proceso legal?',
      answer: 'El proceso completo suele durar entre 6-11 semanas, dependiendo de la complejidad de la operación. Operaciones más simples pueden completarse en 6-8 semanas, mientras que transacciones complejas con múltiples jurisdicciones pueden requerir 10-12 semanas.'
    },
    {
      question: '¿Cómo se estructura el coste del asesoramiento legal?',
      answer: 'Ofrecemos diferentes modalidades: tarifa fija para operaciones estándar, tarifa por horas para casos complejos, o una combinación de ambas. Siempre proporcionamos un presupuesto detallado inicial sin compromiso para que puedas planificar con certeza.'
    },
    {
      question: '¿Qué documentación legal necesito preparar?',
      answer: 'Necesitarás escrituras de constitución y estatutos sociales, contratos principales (clientes, proveedores, empleados clave), documentación de propiedad intelectual, seguros vigentes, documentación laboral y cualquier litigio pendiente. Te ayudamos a preparar y organizar toda la documentación.'
    },
    {
      question: '¿Cómo se mantiene la confidencialidad?',
      answer: 'Implementamos protocolos estrictos: NDAs con todas las partes, salas de datos virtuales seguras, comunicaciones encriptadas, y acceso restringido solo a personal autorizado. La confidencialidad es fundamental en nuestro servicio legal.'
    },
    {
      question: '¿Qué pasa si surgen problemas legales durante el proceso?',
      answer: 'Nuestro equipo está preparado para resolver cualquier complicación legal que surja. Contamos con especialistas en diferentes áreas (laboral, fiscal, regulatorio) y mantenemos comunicación constante para resolver issues rápidamente sin paralizar la operación.'
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
            Preguntas Frecuentes sobre Asesoramiento Legal
          </h2>
          <p className="text-lg text-gray-600">
            Resolvemos las dudas más comunes sobre nuestros servicios legales en M&A
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
            ¿Necesitas asesoramiento legal específico para tu caso?
          </p>
          <Button className="bg-white text-black border border-gray-300 rounded-lg px-6 py-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            Consulta Legal Gratuita
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AsesoramientoLegalFAQ;
