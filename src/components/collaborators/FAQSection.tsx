import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    id: "faq-1",
    question: "¿Qué tipo de proyectos puedo esperar como colaborador?",
    answer: "Como colaborador de Capittal trabajarás en una amplia variedad de proyectos de M&A, incluyendo valoraciones de empresas, due diligence financiera, análisis de múltiplos comparables, modelado financiero para transacciones, y apoyo en procesos de venta o compra de empresas. Los proyectos varían desde startups tecnológicas hasta grandes corporaciones industriales."
  },
  {
    id: "faq-2",
    question: "¿Cuál es la remuneración y estructura de pagos?",
    answer: "La remuneración se basa en la experiencia y tipo de proyecto. Ofrecemos tarifas competitivas por hora o por proyecto, con pagos mensuales. Además, hay bonificaciones por performance en proyectos exitosos. Durante la entrevista discutimos en detalle la estructura de compensación específica para tu perfil."
  },
  {
    id: "faq-3",
    question: "¿Qué flexibilidad tengo en términos de horarios y ubicación?",
    answer: "El programa está diseñado para ser flexible. Puedes trabajar de forma remota en la mayoría de proyectos, aunque algunos pueden requerir presencia ocasional en Madrid. Los horarios son adaptables, pero esperamos disponibilidad para reuniones de coordinación y cumplimiento de deadlines acordados."
  },
  {
    id: "faq-4",
    question: "¿Necesito experiencia previa específicamente en M&A?",
    answer: "Valoramos la experiencia en M&A, pero no es exclusivamente necesaria. Aceptamos profesionales con experiencia sólida en finanzas corporativas, banca de inversión, consultoría estratégica, auditoría o roles similares que demuestren competencias analíticas y conocimiento del mundo empresarial."
  },
  {
    id: "faq-5",
    question: "¿Qué oportunidades de desarrollo profesional ofrece el programa?",
    answer: "Ofrecemos mentoría continua con nuestros socios senior, acceso a formación especializada en valoraciones y M&A, networking con otros profesionales del sector, y la posibilidad de participar en transacciones de alto perfil que fortalecen significativamente tu CV y experiencia profesional."
  },
  {
    id: "faq-6",
    question: "¿Hay posibilidad de convertirse en empleado a tiempo completo?",
    answer: "Sí, consideramos regularmente a nuestros mejores colaboradores para posiciones permanentes cuando surgen oportunidades. De hecho, varios de nuestros empleados actuales comenzaron como colaboradores. Es una excelente manera de conocer nuestra cultura y demostrar tu valor añadido al equipo."
  },
  {
    id: "faq-7",
    question: "¿Qué herramientas y recursos tendré disponibles?",
    answer: "Proporcionamos acceso a nuestras bases de datos especializadas (Capital IQ, Pitchbook, etc.), plantillas de valoración propias, metodologías probadas, y herramientas de colaboración. También tendrás acceso a nuestro knowledge center con casos de estudio y mejores prácticas."
  },
  {
    id: "faq-8",
    question: "¿Cuánto tiempo de compromiso se espera por proyecto?",
    answer: "Varía según el proyecto. Algunos pueden requerir 10-15 horas semanales durante 2-3 semanas, mientras que proyectos más complejos pueden necesitar mayor dedicación durante 1-2 meses. Siempre acordamos el scope y timeline antes de comenzar, respetando tu disponibilidad."
  }
];

export const FAQSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 flex items-center justify-center gap-2 w-fit mx-auto">
              <HelpCircle className="w-4 h-4" />
              Preguntas Frecuentes
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Resolvemos tus dudas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encuentra respuestas a las preguntas más comunes sobre nuestro 
              Programa de Colaboradores y cómo formar parte del equipo.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id}
                className="admin-card border-0 rounded-lg"
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  <span className="font-semibold text-foreground">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Contact CTA */}
          <div className="text-center mt-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              ¿Tienes más preguntas?
            </h3>
            <p className="text-muted-foreground mb-6">
              Nuestro equipo está disponible para resolver cualquier duda adicional 
              que puedas tener sobre el programa.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                📧 colaboradores@capittal.com
              </div>
              <div className="flex items-center gap-2">
                📞 +34 695 717 490
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;