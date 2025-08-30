
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const AsesoramientoLegalFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: '¿Qué documentos legales son imprescindibles en una compraventa de empresas?',
      answer: 'Los documentos esenciales incluyen: Letter of Intent (LOI), Share Purchase Agreement (SPA) o Asset Purchase Agreement (APA), Disclosure Letter, Transition Services Agreement (TSA), y documentos de garantías. También son necesarios los poderes notariales, certificados registrales actualizados y documentación de due diligence legal completa.'
    },
    {
      question: '¿Qué riesgos se identifican en una due diligence legal?',
      answer: 'Identificamos contingencias laborales (despidos, reclamaciones), disputas comerciales, incumplimientos contractuales, problemas de propiedad intelectual, pasivos fiscales ocultos, problemas regulatorios sectoriales, litigios pendientes y cuestiones de compliance. Cada riesgo se cuantifica y se proponen mecanismos de cobertura.'
    },
    {
      question: '¿Cómo se estructura un earn-out en un contrato de compraventa?',
      answer: 'El earn-out se estructura definiendo métricas objetivas (EBITDA, facturación, clientes), periodos de medición (normalmente 2-3 años), umbrales mínimos y máximos, mecanismos de cálculo detallados, y cláusulas de protección para el comprador (no competencia, permanencia del management). Se incluyen auditorías independientes y resolución de disputas.'
    },
    {
      question: '¿Qué pasa si surgen contingencias tras el cierre?',
      answer: 'Se activan las garantías contractuales: el vendedor responde según las warranty & indemnity clauses, se ejecutan las escrow accounts si las hay, se inician procedimientos de reclamación detallados en el SPA, y se aplican los caps y baskets acordados. Navarro Legal gestiona todo el proceso de reclamación.'
    },
    {
      question: '¿Cuál es el coste del asesoramiento legal en M&A?',
      answer: 'Dependiendo de la complejidad: operaciones simples (€15,000-30,000), operaciones medianas (€30,000-60,000), transacciones complejas (€60,000-120,000). Incluimos fee structures flexibles: tarifa fija, por horas, o mixta con success fee. Siempre proporcionamos presupuesto cerrado inicial.'
    },
    {
      question: '¿Cómo se coordina el asesoramiento legal con el proceso de valoración?',
      answer: 'La coordinación es total: Capittal maneja la valoración y negociación comercial mientras Navarro Legal gestiona todos los aspectos legales. Ambos equipos trabajan en paralelo con comunicación constante, timeline integrado y reporting unificado para maximizar eficiencia y minimizar costes.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            FAQs Legales M&A
          </h2>
          <p className="text-lg text-muted-foreground">
            Respuestas a las dudas más frecuentes sobre aspectos legales en fusiones y adquisiciones
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <button
                  className="w-full text-left p-6 hover:bg-muted/50 transition-colors rounded-lg"
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-semibold text-foreground pr-4 leading-relaxed">
                      {faq.question}
                    </h3>
                    <div className="w-5 h-5 text-muted-foreground flex-shrink-0 font-bold">
                      {openIndex === index ? '−' : '+'}
                    </div>
                  </div>
                </button>
                
                {openIndex === index && (
                  <div className="px-6 pb-6">
                    <div className="pt-4 border-t border-border">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                      <div className="mt-4 text-sm text-muted-foreground">
                        <a href="/conocimiento" className="text-primary hover:underline">
                          → Más información en nuestra sección de Conocimiento
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-6">
            ¿Necesitas asesoramiento legal específico para tu operación?
          </p>
          <Button className="hover:shadow-lg transition-shadow duration-300">
            Consulta Legal Gratuita
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AsesoramientoLegalFAQ;
