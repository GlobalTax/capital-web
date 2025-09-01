import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const VentaEmpresasFAQLanding = () => {
  const [openItems, setOpenItems] = useState<number[]>([0]); // First item open by default

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqs = [
    {
      question: "¿Realmente la valoración es GRATUITA y sin compromiso?",
      answer: "¡SÍ, completamente GRATUITA! En 48 horas recibes un informe completo de valoración profesional sin pagar ni un euro y sin ningún tipo de compromiso. Solo cobramos cuando vendemos tu empresa exitosamente.",
      highlight: "100% Gratuita"
    },
    {
      question: "¿Cuánto dinero extra puedo conseguir con Capittal?",
      answer: "Nuestros clientes consiguen entre un 25% y 45% más dinero que con otras consultoras. El récord está en 52% más de lo esperado inicialmente. ¡Tu empresa vale más de lo que crees!",
      highlight: "+25% a +45%"
    },
    {
      question: "¿Cuánto tiempo tarda todo el proceso de venta?",
      answer: "El proceso completo dura entre 6 y 9 meses. La valoración la tienes en 48h, y desde ahí trabajamos sin descanso para conseguir el mejor comprador al mejor precio en el menor tiempo posible.",
      highlight: "6-9 meses"
    },
    {
      question: "¿Mi información será completamente confidencial?",
      answer: "¡ABSOLUTAMENTE SÍ! Tu privacidad es sagrada para nosotros. Firmamos acuerdos de confidencialidad estrictos y solo compartimos información con compradores previamente cualificados y tras tu autorización expresa.",
      highlight: "100% Confidencial"
    },
    {
      question: "¿Qué tamaño de empresa necesito para trabajar con vosotros?",
      answer: "Trabajamos con empresas desde €500K hasta €50M+ de facturación. Si tu empresa es rentable y tiene potencial de crecimiento, ¡podemos conseguirte un precio excelente!",
      highlight: "€500K a €50M+"
    },
    {
      question: "¿Cuándo y cómo cobráis vuestros honorarios?",
      answer: "¡Solo cobramos cuando TÚ cobras! Nuestros honorarios se pagan únicamente al cierre exitoso de la operación. Si no vendemos tu empresa, no cobramos ni un euro. ¡Así de simple!",
      highlight: "Solo al cierre"
    },
    {
      question: "¿Qué garantías me dais de que vais a vender mi empresa?",
      answer: "Tenemos un 98,7% de tasa de éxito en nuestras operaciones. Si aceptamos tu empresa es porque estamos seguros de poder venderla al mejor precio. Además, si no conseguimos mejorar el valor esperado, ¡no cobramos!",
      highlight: "98,7% éxito"
    },
    {
      question: "¿Puedo seguir dirigiendo mi empresa durante el proceso?",
      answer: "¡Por supuesto! Tú sigues siendo el CEO y tomando todas las decisiones. Nosotros trabajamos en segundo plano buscando compradores y preparando la operación sin interrumpir tu día a día.",
      highlight: "Tú sigues al mando"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <HelpCircle className="mr-2 h-4 w-4" />
            Resolvemos Todas Tus Dudas
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Preguntas <span className="text-blue-600">Frecuentes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            <strong>¡Estas son las preguntas que nos hacen el 98,7% de nuestros clientes!</strong> 
            Si tienes alguna duda más, llámanos y te la resolvemos en 2 minutos.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <button
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                onClick={() => toggleItem(index)}
              >
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {faq.question}
                  </h3>
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                    ⭐ {faq.highlight}
                  </span>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {openItems.includes(index) ? (
                    <ChevronUp className="h-6 w-6 text-blue-600" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </button>
              
              {openItems.includes(index) && (
                <div className="px-8 pb-6 border-t border-gray-100 bg-gray-50">
                  <div className="pt-4">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">¿Tienes Más Preguntas?</h3>
            <p className="text-blue-100 mb-6">
              ¡Llámanos AHORA y te las resolvemos todas en una conversación de 15 minutos! 
              Sin compromisos, solo información clara y directa.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="tel:+34900123456"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-200"
              >
                📞 Llamar Ahora: 900 123 456
              </a>
              
              <div className="text-yellow-300 text-sm font-medium">
                ⏰ Horario: L-V 9:00-19:00 | Sáb 10:00-14:00
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasFAQLanding;