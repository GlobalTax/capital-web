
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
      question: "**¿Cuál es la diferencia entre Buy-side y Vendor Due Diligence?**",
      answer: "**Buy-side DD es para compradores que evalúan una inversión - enfocado en identificar riesgos y validar información. Vendor DD es para vendedores preparando su empresa para la venta - enfocado en optimizar valor y acelerar el proceso M&A. Ambos usan metodología similar pero con objetivos diferentes.**"
    },
    {
      question: "**¿Cuánto tiempo y costo tiene cada tipo de Due Diligence?**", 
      answer: "**Buy-side DD: 6-8 semanas, desde €15,000 según complejidad. Vendor DD: 4-6 semanas, ROI promedio +15% en valoración. Incluimos consulta inicial gratuita para determinar alcance exacto según tu situación específica.**"
    },
    {
      question: "**¿Qué documentación necesito proporcionar para cada tipo?**",
      answer: "**Buy-side: Data room del vendedor, contratos clave, EEFF auditados, proyecciones. Vendor: EEFF internos 3-5 años, contratos principales, información legal corporativa, datos comerciales, organigrama. Te proporcionamos checklist detallado según el tipo.**"
    },
    {
      question: "**¿Cómo garantizan confidencialidad en procesos sensibles?**",
      answer: "**NDAs estrictos con todo el equipo, protocolos de seguridad nivel bancario, acceso limitado solo a profesionales necesarios, comunicación encriptada. En Vendor DD, podemos trabajar bajo project names para máxima discreción.**"
    },
    {
      question: "**¿Qué incluye cada tipo de informe final?**",
      answer: "**Buy-side: Recomendación Go/No-go, riesgos críticos, impacto en valoración, plan post-adquisición. Vendor: Value gap analysis, plan de optimización pre-venta, posicionamiento competitivo, estrategia de marketing al comprador.**"
    },
    {
      question: "**¿Tienen experiencia en mi sector específico?**", 
      answer: "**Experiencia probada en tecnología, healthcare, industrial, retail, servicios financieros, energía y más. 150+ transacciones completadas. Asignamos especialistas sectoriales a cada proyecto para máximo expertise.**"
    },
    {
      question: "**¿Puedo convertir un Vendor DD en Buy-side si recibo ofertas?**",
      answer: "**Sí, es común. El Vendor DD sirve como base para acelerar el Buy-side DD posterior. Aprovechamos trabajo previo para reducir tiempos y costos en la fase de comprador, manteniendo independencia profesional.**"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            **Preguntas Frecuentes**
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            **Resolvemos dudas sobre Buy-side y Vendor Due Diligence basadas 
            en nuestra experiencia en 150+ transacciones**
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
