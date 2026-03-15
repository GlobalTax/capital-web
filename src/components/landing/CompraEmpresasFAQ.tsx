import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const CompraEmpresasFAQ = () => {
  const faqs = [
    {
      question: '¿Qué tipo de empresas puedo adquirir con Capittal?',
      answer: 'Asesoramos en la adquisición de PYMES y mid-market en España, con facturación desde €1M hasta €50M+. Trabajamos en todos los sectores: industrial, tecnología, servicios, distribución, alimentación, construcción y más. Identificamos oportunidades que se ajusten a tus criterios de inversión específicos.'
    },
    {
      question: '¿Cuánto cuesta el proceso de compra de una empresa?',
      answer: 'Nuestros honorarios se basan en una estructura de éxito (success fee) alineada con tus intereses: solo cobramos si la operación se cierra. El porcentaje varía entre el 2% y el 5% del valor de la transacción, dependiendo del tamaño y complejidad. La consulta inicial es gratuita.'
    },
    {
      question: '¿Cuánto tiempo tarda el proceso de adquisición?',
      answer: 'El proceso completo suele durar entre 6 y 12 meses: identificación de targets (1-3 meses), negociación y LOI (1-2 meses), due diligence (2-3 meses), y documentación legal y cierre (1-2 meses). Operaciones más complejas o con múltiples targets pueden requerir más tiempo.'
    },
    {
      question: '¿Cómo identificáis las empresas objetivo?',
      answer: 'Utilizamos una combinación de nuestra base de datos propietaria con más de 5.000 empresas, análisis sectorial, red de contactos con intermediarios y brokers, y herramientas de inteligencia de mercado. Filtramos por criterios como sector, tamaño, rentabilidad, ubicación y potencial de crecimiento.'
    },
    {
      question: '¿Qué financiación necesito para comprar una empresa?',
      answer: 'Típicamente necesitarás entre el 30% y el 50% del precio en equity propio. El resto puede financiarse con deuda bancaria, vendor financing, o inversores externos. Te ayudamos a estructurar la financiación óptima y te conectamos con bancos y fondos especializados en M&A.'
    },
    {
      question: '¿Realizáis también el due diligence?',
      answer: 'Sí, ofrecemos un servicio integral que incluye due diligence financiera, legal, comercial y operativa. Coordinamos todo el proceso con nuestro equipo multidisciplinar para que tengas una visión completa de la empresa antes de tomar la decisión de compra.'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-normal text-black mb-6">
            Preguntas Frecuentes sobre Compra de Empresas
          </h2>
          <p className="text-lg text-gray-600">
            Resolvemos las dudas más comunes sobre el proceso de adquisición empresarial
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

export default CompraEmpresasFAQ;
