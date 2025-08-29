import React, { useState } from 'react';
import { ChevronDown, Phone, Mail } from 'lucide-react';

const ValoracionesFAQNew = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      pregunta: "¿Cuál es la diferencia entre una valoración gratuita y una profesional?",
      respuesta: "La valoración gratuita es una estimación orientativa basada en múltiplos sectoriales y datos básicos de la empresa. La valoración profesional incluye análisis detallado con múltiples metodologías, due diligence, proyecciones personalizadas y un informe certificado que puede usarse para operaciones legales, fiscales o corporativas."
    },
    {
      pregunta: "¿Cuándo necesito una valoración certificada?",
      respuesta: "Una valoración certificada es necesaria para operaciones de M&A, reestructuraciones societarias, herencias, divorcios, entrada/salida de socios, ampliaciones de capital, procesos judiciales, fusiones, escisiones, y para cumplir con normativas contables o fiscales específicas."
    },
    {
      pregunta: "¿Qué metodología es más adecuada para mi empresa?",
      respuesta: "Depende del sector, tamaño, rentabilidad y propósito de la valoración. Empresas estables con historial: DCF. Sectores con comparables: Múltiplos. Holdings o asset-heavy: Patrimonial. Para máxima precisión recomendamos un enfoque multimetodológico que combine todas las técnicas."
    },
    {
      pregunta: "¿Cuánto cuesta una valoración profesional?",
      respuesta: "El coste varía según la complejidad, tamaño de la empresa y urgencia. Típicamente entre €3,000-€15,000 para PYMES, y €10,000-€50,000+ para empresas grandes. Incluye análisis completo, informe certificado y presentación. Solicita presupuesto personalizado sin compromiso."
    },
    {
      pregunta: "¿Qué información necesito preparar?",
      respuesta: "Estados financieros de 3-5 años, presupuestos/proyecciones, detalle de activos y pasivos, contratos relevantes, información de mercado y competencia, estructura societaria, y datos operativos clave. Te proporcionamos una lista detallada al inicio del proceso."
    },
    {
      pregunta: "¿Cuánto tiempo dura el proceso?",
      respuesta: "Una valoración estándar toma 4-6 semanas desde el inicio hasta la entrega del informe final. Procesos urgentes pueden completarse en 2-3 semanas con recargo. El timing depende de la complejidad y la disponibilidad de información completa."
    },
    {
      pregunta: "¿La valoración incluye recomendaciones estratégicas?",
      respuesta: "Sí, nuestras valoraciones incluyen análisis de sensibilidad, identificación de palancas de valor, recomendaciones para optimizar la valoración y benchmarking sectorial. También identificamos fortalezas, debilidades y oportunidades de mejora."
    },
    {
      pregunta: "¿Puedo usar la valoración para vender mi empresa?",
      respuesta: "Absolutamente. Nuestras valoraciones están diseñadas para soportar procesos de venta y proporcionan la base técnica para negociaciones. Incluyen análisis de comparables, rango de valoración justificado y argumentación para maximizar el precio de venta."
    }
  ];

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Preguntas Frecuentes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Resolvemos las dudas más comunes sobre valoraciones empresariales
          </p>
        </div>

        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 transition-colors"
                onClick={() => toggleAccordion(index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-black pr-4">
                    {faq.pregunta}
                  </h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                      activeIndex === index ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
              </button>
              
              {activeIndex === index && (
                <div className="px-6 pb-6 pt-0">
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.respuesta}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg p-8 shadow-md text-center">
          <h3 className="text-2xl font-bold text-black mb-4">
            ¿No encuentras tu respuesta?
          </h3>
          <p className="text-gray-600 mb-6">
            Nuestros expertos en valoración están disponibles para resolver cualquier duda específica sobre tu caso
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+34912345678" 
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Phone className="w-5 h-5 mr-2" />
              +34 91 234 5678
            </a>
            <a 
              href="mailto:valoraciones@capittal.com" 
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              valoraciones@capittal.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValoracionesFAQNew;