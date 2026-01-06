import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Qué diferencia a un Search Fund de un Private Equity?",
    answer: "Los Search Funds son emprendedores individuales (o en pareja) que buscan una sola empresa para adquirir y dirigir personalmente durante 5-7 años. El Private Equity son fondos que invierten en múltiples empresas, con un horizonte más corto (3-5 años) y gestores profesionales que no se involucran en el día a día. Los Search Funds suelen ofrecer un trato más personal y un compromiso más largo con la empresa."
  },
  {
    question: "¿Cuánto paga un Search Fund por una empresa?",
    answer: "Los múltiplos típicos oscilan entre 4x y 7x EBITDA, dependiendo del sector, crecimiento y calidad del negocio. Son valoraciones de mercado, similares o incluso superiores a otros compradores. Los Search Funds buscan empresas de calidad, no gangas."
  },
  {
    question: "¿Qué pasa con mis empleados después de la venta?",
    answer: "Los Search Funds suelen mantener al equipo existente porque necesitan la continuidad operativa. El Searcher se convierte en CEO pero depende del conocimiento del equipo para tener éxito. Es uno de los compradores más seguros para la plantilla."
  },
  {
    question: "¿Puedo seguir involucrado después de vender?",
    answer: "Sí, es muy común. Muchos vendedores permanecen como advisors, mantienen una participación minoritaria o tienen un período de transición de 1-2 años. La estructura se negocia según tus preferencias."
  },
  {
    question: "¿Cómo sé si un Searcher es serio?",
    answer: "Capittal verifica: 1) Que tenga capital comprometido de inversores reconocidos, 2) Su formación y experiencia profesional, 3) Referencias de sus inversores o mentores, 4) Historial de comportamiento profesional en otras negociaciones. No presentamos Searchers que no pasen nuestro filtro."
  },
  {
    question: "¿Cuánto tarda el proceso de venta a un Search Fund?",
    answer: "Típicamente entre 6 y 12 meses desde el primer contacto hasta el cierre. Esto incluye: negociación inicial (1-2 meses), due diligence (2-3 meses), documentación legal (1-2 meses) y cierre. Es similar a una venta tradicional pero el trato es más directo."
  },
  {
    question: "¿Qué sectores interesan a los Search Funds?",
    answer: "Prefieren sectores estables y no cíclicos: servicios empresariales (B2B), tecnología/software, salud, manufactura especializada, distribución, educación. Evitan sectores muy regulados, muy cíclicos o con alto riesgo de disrupción tecnológica."
  },
  {
    question: "¿Cuánto cobra Capittal por este servicio?",
    answer: "Trabajamos con una estructura de éxito (success fee) alineada con tus intereses: solo cobramos si la operación se cierra. La valoración inicial es gratuita. Contacta con nosotros para conocer los detalles según el tamaño de tu operación."
  },
  {
    question: "¿Soy Searcher, cómo puedo acceder a vuestro deal flow?",
    answer: "Regístrate a través de nuestro formulario de Searchers. Verificaremos tu perfil (inversores, formación, criterios) y si encajas, te daremos acceso a empresas que cumplan tus criterios. El proceso de verificación tarda 48-72h."
  },
  {
    question: "¿Por qué España es líder europeo en Search Funds?",
    answer: "Varios factores: 1) Tejido empresarial fragmentado con muchas PYMES de calidad, 2) Generación de empresarios baby-boomer sin sucesión, 3) IESE Business School como epicentro formativo, 4) Red de inversores especializados ya establecida, 5) Valoraciones atractivas comparadas con otros mercados europeos."
  }
];

export const SearchFundsFAQ = () => {
  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Preguntas frecuentes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
              Preguntas frecuentes sobre Search Funds en España
            </h2>
            <p className="text-lg text-muted-foreground">
              Las preguntas más comunes de empresarios y Searchers sobre trabajar con Search Funds.
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
