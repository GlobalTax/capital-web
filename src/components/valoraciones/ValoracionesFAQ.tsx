
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ValoracionesFAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const faqs = [
    {
      pregunta: '¿Es realmente gratuita la valoración?',
      respuesta: 'Sí, completamente gratuita. Recibirás un reporte profesional en PDF sin coste alguno. No hay letra pequeña ni costes ocultos. Solo pedimos algunos datos básicos de tu empresa para personalizar el análisis.'
    },
    {
      pregunta: '¿Qué tan precisa es la valoración?',
      respuesta: 'Nuestra herramienta tiene una precisión promedio del 95% comparada con valoraciones profesionales. Utilizamos las mismas metodologías que empleamos en nuestras valoraciones de pago, con una base de datos de más de 50,000 transacciones.'
    },
    {
      pregunta: '¿Qué datos necesito para la valoración?',
      respuesta: 'Necesitarás datos básicos como facturación anual, EBITDA, sector de actividad, años de operación y número de empleados. Todo información que cualquier empresario tiene a mano. El proceso toma solo 5 minutos.'
    },
    {
      pregunta: '¿Puedo usar esta valoración para vender mi empresa?',
      respuesta: 'La valoración te dará una excelente referencia inicial, pero para procesos de venta recomendamos una valoración profesional completa. Como cliente de la calculadora, tienes acceso a descuentos especiales en nuestros servicios premium.'
    },
    {
      pregunta: '¿Qué pasa con mis datos? ¿Son confidenciales?',
      respuesta: 'Absolutamente. Todos los datos están protegidos bajo estrictos protocolos de confidencialidad. No compartimos información con terceros y puedes solicitar la eliminación de tus datos en cualquier momento.'
    },
    {
      pregunta: '¿Puedo actualizar la valoración si mi empresa cambia?',
      respuesta: 'Sí, puedes actualizar los datos trimestralmente sin coste. Además, recibirás notificaciones cuando cambien los múltiplos de tu sector para mantener tu valoración actualizada.'
    }
  ];

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Preguntas Frecuentes
          </h2>
          <p className="text-xl text-gray-600">
            Resolvemos las dudas más comunes sobre nuestra calculadora de valoración.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-black pr-4">
                  {faq.pregunta}
                </h3>
                {activeIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              {activeIndex === index && (
                <div className="px-8 pb-6">
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.respuesta}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            ¿Tienes más preguntas? Nuestro equipo está aquí para ayudarte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+34917702717" 
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              📞 +34 917 702 717
            </a>
            <a 
              href="mailto:contacto@capittal.com" 
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              ✉️ contacto@capittal.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValoracionesFAQ;
