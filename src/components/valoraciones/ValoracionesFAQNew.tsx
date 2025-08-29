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
    <section className="py-12 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6">
            Preguntas Frecuentes
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Resolvemos las dudas más comunes sobre valoraciones empresariales
          </p>
        </div>

        <div className="space-y-3 mb-12">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <button
                className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-primary hover:bg-slate-50 transition-colors"
                onClick={() => toggleAccordion(index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 pr-4">
                    {faq.pregunta}
                  </h3>
                  <ChevronDown 
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                      activeIndex === index ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
              </button>
              
              {activeIndex === index && (
                <div className="px-4 pb-4 pt-0">
                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {faq.respuesta}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg p-6 border border-slate-200 text-center">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            ¿No encuentras tu respuesta?
          </h3>
          <p className="text-slate-600 mb-6 text-sm">
            Nuestros expertos en valoración están disponibles para resolver cualquier duda específica sobre tu caso
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="tel:+34912345678" 
              className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
            >
              <Phone className="w-4 h-4 mr-2" />
              +34 91 234 5678
            </a>
            <a 
              href="mailto:valoraciones@capittal.com" 
              className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
            >
              <Mail className="w-4 h-4 mr-2" />
              valoraciones@capittal.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValoracionesFAQNew;