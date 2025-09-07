
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const DueDiligenceFAQ = () => {
  const faqs = [
    {
      question: "¿Qué áreas cubre el proceso de due diligence?",
      answer: "Nuestro due diligence cubre análisis financiero (estados financieros, proyecciones, flujos de caja), legal (contratos, litigios, compliance), comercial (mercado, competencia, clientes), operativo (procesos, sistemas, personal) y estratégico (posicionamiento, sinergias)."
    },
    {
      question: "¿Cuánto tiempo requiere un due diligence completo?",
      answer: "El proceso típico toma entre 6-8 semanas, dependiendo del tamaño y complejidad de la empresa. Incluye 1 semana de análisis preliminar, 3-4 semanas de investigación detallada, 1-2 semanas de análisis e interpretación, y 1 semana para el informe final."
    },
    {
      question: "¿Qué documentación necesitamos proporcionar?",
      answer: "Requerimos estados financieros de los últimos 3-5 años, contratos principales, información legal corporativa, datos comerciales y de mercado, información sobre personal clave, y cualquier documentación relevante sobre operaciones y estrategia."
    },
    {
      question: "¿Cómo garantizan la confidencialidad del proceso?",
      answer: "Todos nuestros profesionales firman acuerdos de confidencialidad estrictos. Mantenemos protocolos de seguridad de información robustos y limitamos el acceso a la información solo al equipo necesario para el análisis."
    },
    {
      question: "¿Qué incluye el informe final de due diligence?",
      answer: "El informe incluye resumen ejecutivo, análisis detallado por áreas, identificación de riesgos y oportunidades, impacto en la valoración, recomendaciones estratégicas y anexos con documentación de soporte."
    },
    {
      question: "¿Pueden realizar due diligence en sectores específicos?",
      answer: "Sí, tenemos experiencia especializada en múltiples sectores incluyendo tecnología, healthcare, industrial, retail, servicios financieros y energía. Adaptamos nuestro enfoque a las particularidades de cada sector."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Preguntas Frecuentes sobre Due Diligence
          </h2>
          <p className="text-lg text-gray-600">
            Resolvemos las dudas más comunes sobre nuestro proceso de due diligence
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-gray-300 rounded-lg px-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out"
            >
              <AccordionTrigger className="text-left font-semibold text-black hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default DueDiligenceFAQ;
