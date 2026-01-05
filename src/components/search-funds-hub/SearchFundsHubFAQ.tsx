import React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: '¿Qué diferencia a un Search Fund de un Private Equity tradicional?',
    answer: 'El Search Fund está liderado por un emprendedor individual que busca, adquiere y opera una sola empresa. El PE gestiona múltiples inversiones a través de gestores profesionales. El searcher tiene un compromiso personal de 5-7 años como CEO.',
  },
  {
    question: '¿Cuánto tiempo tarda el proceso de venta a un Search Fund?',
    answer: 'El proceso típico dura entre 6-12 meses desde el primer contacto hasta el cierre. Incluye valoración inicial, negociación de términos, due diligence (4-8 semanas) y cierre legal.',
  },
  {
    question: '¿Qué porcentaje del precio se paga al cierre?',
    answer: 'Típicamente, el 70-90% se paga al cierre. El resto puede estructurarse como vendor note (pagaré a 2-5 años) o earn-out vinculado a resultados futuros.',
  },
  {
    question: '¿Qué pasa con los empleados tras la adquisición?',
    answer: 'Los Search Funds suelen mantener al equipo existente, ya que valoran el conocimiento operativo. El nuevo CEO (searcher) trabaja junto al equipo durante la transición, que puede durar 6-12 meses.',
  },
  {
    question: '¿Es necesario que el fundador permanezca tras la venta?',
    answer: 'No es obligatorio, pero sí recomendable un periodo de transición de 6-12 meses. Esto ayuda a transferir conocimiento y relaciones clave con clientes y proveedores.',
  },
  {
    question: '¿Qué valoración puedo esperar para mi empresa?',
    answer: 'Los Search Funds típicamente pagan 4-7x EBITDA para empresas rentables. La valoración depende del sector, crecimiento, dependencia del fundador y calidad del equipo.',
  },
  {
    question: '¿Cómo sé si mi empresa es candidata para un Search Fund?',
    answer: 'Las características ideales incluyen: facturación €2-15M, EBITDA positivo (mínimo €500K), base de clientes diversificada, sector no cíclico, y baja dependencia del fundador. Usa nuestra calculadora de "Fit" para evaluarlo.',
  },
  {
    question: '¿Qué garantías piden los Search Funds?',
    answer: 'Las garantías estándar incluyen: representaciones sobre estados financieros, contratos vigentes, ausencia de litigios, y cumplimiento fiscal. Suelen estar vigentes 18-24 meses con caps del 10-20% del precio.',
  },
  {
    question: '¿Puedo vender solo una parte de mi empresa?',
    answer: 'Es menos común pero posible. Algunos vendedores mantienen un 10-20% del equity para participar en el crecimiento futuro (equity rollover). Esto también alinea intereses con el nuevo propietario.',
  },
  {
    question: '¿Qué pasa si el Search Fund no consigue financiación?',
    answer: 'La LOI (carta de intenciones) suele incluir condiciones de financiación. Si no se consigue, la operación no se cierra y no hay penalización para el vendedor, aunque se pierde tiempo.',
  },
];

export const SearchFundsHubFAQ: React.FC = () => {
  return (
    <section id="faq" className="py-16 scroll-mt-24">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Preguntas Frecuentes
        </h2>
        <p className="text-muted-foreground max-w-3xl">
          Respuestas a las dudas más comunes sobre Search Funds.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`faq-${index}`}
              className="border rounded-lg px-4 bg-card"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-medium text-foreground pr-4">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
};
