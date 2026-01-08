import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useHubVentaTracking } from '@/hooks/useHubVentaTracking';

const faqs = [
  {
    question: '¿Cuánto vale mi empresa?',
    answer: 'El valor de una empresa depende de múltiples factores: beneficios, sector, crecimiento, activos, y situación del mercado. Ofrecemos una valoración profesional gratuita que analiza tu empresa desde diferentes metodologías (DCF, múltiplos de mercado, valor patrimonial) para determinar un rango de valor realista.',
  },
  {
    question: '¿Cuánto tiempo lleva vender una empresa?',
    answer: 'El proceso típico de venta dura entre 6 y 12 meses, aunque puede variar según el sector, tamaño de la empresa y condiciones del mercado. Las fases son: preparación (1-2 meses), búsqueda de compradores (2-4 meses), negociación y due diligence (2-4 meses), y cierre (1-2 meses).',
  },
  {
    question: '¿Cómo garantizáis la confidencialidad?',
    answer: 'La confidencialidad es nuestra prioridad absoluta. Utilizamos acuerdos NDA con todos los interesados, presentamos la empresa de forma anónima en las primeras fases, y solo revelamos información detallada a compradores cualificados que han demostrado interés serio y capacidad financiera.',
  },
  {
    question: '¿Cuánto cobráis por vuestros servicios?',
    answer: 'Trabajamos con un modelo de éxito: no cobramos honorarios iniciales. Nuestros honorarios son un porcentaje del precio de venta final, lo que alinea nuestros intereses con los tuyos. Solo ganamos si tú ganas. La valoración inicial es completamente gratuita.',
  },
  {
    question: '¿Qué pasa si no encontráis comprador?',
    answer: 'Si tras un período razonable de búsqueda activa no encontramos comprador, no tendrás ningún coste. Antes de iniciar el proceso, evaluamos la viabilidad de la operación y solo aceptamos mandatos donde vemos posibilidades reales de éxito.',
  },
  {
    question: '¿Puedo seguir en la empresa después de venderla?',
    answer: 'Sí, es una opción común. Muchos compradores valoran la continuidad del equipo directivo durante un período de transición (típicamente 1-2 años). Podemos negociar acuerdos de permanencia, earn-outs vinculados a resultados, o incluso participaciones minoritarias post-venta.',
  },
  {
    question: '¿Qué documentación necesito para empezar?',
    answer: 'Para la valoración inicial necesitamos: estados financieros de los últimos 3 años, balance y cuenta de resultados actual, información sobre la estructura de propiedad, y una descripción general del negocio. Todo el proceso es confidencial desde el primer momento.',
  },
  // New FAQs
  {
    question: '¿Puedo vender solo una parte de mi empresa?',
    answer: 'Sí, es posible vender una participación minoritaria o mayoritaria manteniendo parte del capital. Esta opción es habitual cuando el empresario quiere capitalizar parte de su esfuerzo pero seguir involucrado, o cuando busca un socio estratégico para acelerar el crecimiento. Analizamos qué estructura es óptima para tus objetivos.',
  },
  {
    question: '¿Qué pasa con mis empleados después de la venta?',
    answer: 'Los empleados están protegidos por la normativa de sucesión de empresas, que obliga al comprador a mantener las condiciones laborales existentes. Además, muchos compradores valoran especialmente los equipos estables y suelen ofrecer incentivos de retención. Podemos negociar cláusulas específicas de protección para empleados clave.',
  },
  {
    question: '¿Qué es un earnout y cómo funciona?',
    answer: 'Un earnout es una parte del precio de venta que se paga en el futuro, condicionada a que la empresa alcance ciertos objetivos (facturación, beneficios, retención de clientes...). Es una herramienta útil cuando comprador y vendedor tienen diferentes expectativas de valor. Típicamente representa un 10-30% del precio total.',
  },
  {
    question: '¿Cuál es el momento ideal para vender mi empresa?',
    answer: 'El mejor momento es cuando la empresa está en crecimiento, con buenos resultados y perspectivas positivas. Vender "desde arriba" te da poder de negociación. Evita vender por necesidad o cuando los resultados están cayendo. Idealmente, planifica la venta con 2-3 años de antelación para optimizar la preparación.',
  },
  {
    question: '¿Qué diferencia hay entre vender a un fondo vs. a un comprador estratégico?',
    answer: 'Los fondos de inversión buscan rentabilizar su inversión en 4-7 años y suelen pagar múltiplos más conservadores, pero pueden mantener al equipo gestor. Los compradores estratégicos (empresas del sector) pueden pagar primas por sinergias y suelen integrarte en su estructura. Cada perfil tiene ventajas según tu situación.',
  },
];

const HubVentaFAQ: React.FC = () => {
  const { trackFAQExpand } = useHubVentaTracking();

  const handleValueChange = (value: string) => {
    if (value) {
      const index = parseInt(value.replace('item-', ''));
      if (!isNaN(index) && faqs[index]) {
        trackFAQExpand(faqs[index].question);
      }
    }
  };

  // Generate FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="py-20 md:py-28 bg-slate-50">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-mono text-xs font-light uppercase tracking-widest text-slate-500 mb-4">
            Resolvemos tus dudas
          </p>
          <h2 className="text-3xl md:text-4xl font-normal text-slate-900">
            Preguntas Frecuentes
          </h2>
        </div>

        {/* FAQ Accordion */}
        <Accordion 
          type="single" 
          collapsible 
          className="space-y-4"
          onValueChange={handleValueChange}
        >
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-white rounded-xl border border-slate-200 px-6 data-[state=open]:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left py-5 hover:no-underline">
                <span className="text-base font-medium text-slate-900 pr-4">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-slate-600 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* More Questions CTA */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 mb-4">¿Tienes más preguntas?</p>
          <button
            onClick={() => document.getElementById('hero-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors"
          >
            Consultar sin compromiso
          </button>
        </div>
      </div>
    </section>
  );
};

export default HubVentaFAQ;
