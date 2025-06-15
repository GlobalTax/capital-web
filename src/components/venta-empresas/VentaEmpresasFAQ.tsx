
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VentaEmpresasFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: '¿Cuánto tiempo tarda el proceso de venta?',
      answer: 'El proceso completo suele durar entre 4 y 6 meses, dependiendo de la complejidad de la empresa, las condiciones del mercado y la disponibilidad de compradores cualificados. Empresas más pequeñas pueden venderse en 3-4 meses, mientras que operaciones más complejas pueden requerir 6-8 meses.'
    },
    {
      question: '¿Cuáles son vuestros honorarios?',
      answer: 'Trabajamos con una estructura de éxito, cobrando un porcentaje del precio final de venta que varía entre el 3% y el 8% dependiendo del tamaño y complejidad de la operación. No cobramos ningún retainer inicial, solo cobramos si la operación se cierra exitosamente.'
    },
    {
      question: '¿Cómo se mantiene la confidencialidad?',
      answer: 'La confidencialidad es fundamental en nuestro proceso. Utilizamos acuerdos de confidencialidad (NDAs) con todos los potenciales compradores, creamos memorandos anónimos inicialmente, y solo revelamos la identidad de tu empresa tras confirmar el interés serio y la capacidad financiera del comprador.'
    },
    {
      question: '¿Qué documentación necesito preparar?',
      answer: 'Necesitarás estados financieros de los últimos 3-5 años, información detallada sobre clientes y contratos principales, estructura organizativa, activos principales, y cualquier documentación legal relevante. Nosotros te ayudamos a preparar y organizar toda esta información de manera profesional.'
    },
    {
      question: '¿Puedo seguir dirigiendo la empresa durante el proceso?',
      answer: 'Absolutamente. Es esencial que mantengas el foco en el negocio durante el proceso de venta. Nosotros nos encargamos de la mayor parte del trabajo de marketing, identificación de compradores y negociación inicial, minimizando las distracciones en tu día a día.'
    },
    {
      question: '¿Qué sucede con mis empleados?',
      answer: 'La retención del equipo es crucial para el éxito de la venta. Trabajamos con compradores que valoran el capital humano y buscamos estructuras que incentiven la continuidad del equipo clave. También podemos ayudar a diseñar planes de retención durante el proceso.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold text-black mb-6">
            Preguntas Frecuentes
          </h2>
          <p className="text-lg text-gray-600">
            Resolvemos las dudas más comunes sobre el proceso de venta de empresas
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <div key={index} className="capittal-card">
              <button
                className="w-full text-left flex justify-between items-center hover:bg-gray-50 transition-colors p-2 -m-2 rounded-lg"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-base font-semibold text-black pr-4">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
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
            ¿No encuentras la respuesta que buscas?
          </p>
          <Button className="capittal-button">
            Contacta con Nuestros Expertos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasFAQ;
