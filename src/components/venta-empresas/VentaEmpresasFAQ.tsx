
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
    },
    {
      question: '¿Cuál es el tamaño mínimo de empresa que asesoráis?',
      answer: 'Generalmente trabajamos con empresas que facturan al menos 2-3 millones de euros anuales y tienen un EBITDA mínimo de 500.000€. Sin embargo, evaluamos cada caso individualmente, especialmente si la empresa tiene características especiales o gran potencial de crecimiento.'
    },
    {
      question: '¿Cómo determinamos el precio de venta?',
      answer: 'Realizamos una valoración completa utilizando múltiples metodologías: múltiplos de mercado, flujos de caja descontados, y comparables de transacciones recientes. Consideramos factores como rentabilidad, crecimiento, posición competitiva, y condiciones del mercado para establecer un rango de valoración realista.'
    },
    {
      question: '¿Qué tipos de compradores tenéis en vuestra red?',
      answer: 'Tenemos acceso a una amplia red que incluye compradores estratégicos (empresas del sector), fondos de private equity, family offices, inversores individuales, y compradores internacionales. Seleccionamos los más adecuados según el perfil de tu empresa y tus objetivos.'
    },
    {
      question: '¿Qué garantías ofrecéis sobre el éxito de la operación?',
      answer: 'Si bien no podemos garantizar la venta (depende de muchos factores externos), nuestra tasa de éxito es del 85%. Solo cobramos si la operación se cierra, y trabajamos incansablemente para encontrar el mejor comprador al mejor precio. Nuestro éxito está directamente ligado al tuyo.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-6">
            Preguntas Frecuentes
          </h2>
          <p className="text-xl text-gray-600">
            Resolvemos las dudas más comunes sobre el proceso de venta de empresas
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg font-semibold text-black pr-4">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            ¿No encuentras la respuesta que buscas?
          </p>
          <button className="capittal-button">
            Contacta con Nuestros Expertos
          </button>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasFAQ;
