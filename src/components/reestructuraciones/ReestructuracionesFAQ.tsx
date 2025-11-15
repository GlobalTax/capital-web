import React from 'react';
import { SEOHead } from '@/components/seo';
import { getFAQSchema } from '@/utils/seo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const ReestructuracionesFAQ = () => {
  const faqs = [
    {
      question: "¿Cuándo es necesaria una reestructuración empresarial?",
      answer: "Una reestructuración es necesaria cuando la empresa presenta pérdidas recurrentes, problemas de flujo de caja, alta carga de deuda, pérdida de competitividad, o cuando enfrenta cambios significativos en su mercado que requieren una transformación profunda."
    },
    {
      question: "¿Qué tipos de reestructuración realizan?",
      answer: "Realizamos reestructuraciones operativas (optimización de procesos, reducción de costes, reorganización), financieras (renegociación de deuda, inyección de capital, mejora de estructura financiera), y estratégicas (reposicionamiento, diversificación, desinversiones)."
    },
    {
      question: "¿Cuánto tiempo toma una reestructuración completa?",
      answer: "El proceso varía según la complejidad, pero típicamente el diagnóstico y plan toman 4-7 semanas, la implementación 6-12 meses, y el seguimiento es continuo hasta la estabilización completa de la empresa."
    },
    {
      question: "¿Cómo gestionan la continuidad del negocio durante el proceso?",
      answer: "Priorizamos la continuidad operativa mediante planes detallados que minimizan la disrupción. Trabajamos en fases, mantenemos la comunicación con stakeholders clave, y implementamos medidas temporales para asegurar la operación durante la transición."
    },
    {
      question: "¿Qué involucra la gestión de stakeholders en una reestructuración?",
      answer: "Gestionamos las relaciones con bancos, proveedores, clientes, empleados y otros acreedores. Esto incluye negociaciones de deuda, acuerdos de pago, comunicación transparente y alineación de intereses para el éxito del proceso."
    },
    {
      question: "¿Cuál es la tasa de éxito de sus reestructuraciones?",
      answer: "Nuestra tasa de éxito es del 87%, medida por empresas que logran estabilidad financiera y operativa sostenible. El éxito depende del compromiso del management, la viabilidad del negocio base y la correcta implementación del plan."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <SEOHead 
        structuredData={getFAQSchema(faqs.map(faq => ({
          question: faq.question,
          answer: faq.answer
        })))}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Preguntas Frecuentes sobre Reestructuraciones
          </h2>
          <p className="text-lg text-gray-600">
            Resolvemos las dudas más comunes sobre procesos de reestructuración empresarial
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

export default ReestructuracionesFAQ;
