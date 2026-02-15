import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Building, Scale, ArrowRight, Calculator } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/seo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getWebPageSchema, getFAQSchema } from '@/utils/seo/schemas';

const METHODS = [
  {
    icon: TrendingUp,
    title: 'Descuento de Flujos de Caja (DCF)',
    description:
      'Estima el valor de una empresa proyectando sus flujos de caja futuros y descontándolos a valor presente. Es el método más riguroso y utilizado en valoraciones formales, especialmente para empresas con flujos predecibles.',
  },
  {
    icon: BarChart3,
    title: 'Múltiplos de Mercado (EV/EBITDA, EV/Revenue)',
    description:
      'Compara la empresa con otras similares del mismo sector usando ratios como EV/EBITDA o EV/Revenue. Es rápido, intuitivo y refleja las condiciones actuales del mercado de compraventa.',
  },
  {
    icon: Building,
    title: 'Valoración por Activos',
    description:
      'Calcula el valor neto de los activos de la empresa menos sus pasivos. Es especialmente útil para empresas intensivas en activos, inmobiliarias o en situación de liquidación.',
  },
  {
    icon: Scale,
    title: 'Transacciones Comparables',
    description:
      'Analiza el precio pagado en transacciones reales de empresas similares. Proporciona una referencia directa del mercado y es muy valorado por inversores y fondos de adquisición.',
  },
];

const FAQ_DATA = [
  {
    question: '¿Es gratuita la calculadora de valoración?',
    answer:
      'Sí, nuestra calculadora de valoración de empresas es completamente gratuita y sin compromiso. Puedes utilizarla tantas veces como necesites para obtener una estimación orientativa del valor de tu negocio.',
  },
  {
    question: '¿Qué métodos de valoración utilizáis?',
    answer:
      'Nuestra calculadora utiliza el método de múltiplos de EBITDA y de facturación, ajustados por sector, tamaño de empresa, márgenes operativos y tasa de crecimiento. Para valoraciones profesionales, combinamos DCF, múltiplos y comparables.',
  },
  {
    question: '¿Cuánto tarda una valoración profesional?',
    answer:
      'Una valoración profesional completa realizada por nuestro equipo de expertos en M&A suele tardar entre 2 y 4 semanas, dependiendo de la complejidad de la empresa y la disponibilidad de la documentación financiera.',
  },
  {
    question: '¿Los datos que introduzco son confidenciales?',
    answer:
      'Absolutamente. Todos los datos introducidos en la calculadora son tratados con total confidencialidad. No compartimos información con terceros y cumplimos con la normativa RGPD.',
  },
  {
    question: '¿Qué sectores cubre la calculadora?',
    answer:
      'La calculadora cubre más de 20 sectores, incluyendo tecnología, industrial, servicios profesionales, retail, hostelería, salud, educación, construcción, transporte y logística, alimentación, energía, y muchos más.',
  },
];

const ValoracionEmpresas = () => {
  useEffect(() => {
    const canonicalUrl = 'https://capittal.es/valoracion-empresas';
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);
  }, []);

  const structuredData = [
    getWebPageSchema(
      'Valoración de Empresas | Métodos, Herramientas y Asesoramiento - Capittal',
      'Todo sobre valoración de empresas: métodos DCF, múltiplos, comparables. Usa nuestra calculadora gratuita o solicita una valoración profesional.',
      'https://capittal.es/valoracion-empresas'
    ),
    getFAQSchema(FAQ_DATA),
  ];

  return (
    <>
      <SEOHead
        title="Valoración de Empresas | Métodos, Herramientas y Asesoramiento - Capittal"
        description="Todo sobre valoración de empresas: métodos DCF, múltiplos, comparables. Usa nuestra calculadora gratuita o solicita una valoración profesional."
        structuredData={structuredData}
      />
      <Header />

      <main className="min-h-screen bg-background">
        {/* Section 1: Hero / Intro */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Valoración de Empresas: Guía Completa y Herramientas
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Conocer el valor real de tu empresa es fundamental para tomar decisiones estratégicas con confianza. 
              Ya sea que estés considerando una venta, buscando inversores, planificando una sucesión o simplemente 
              quieras entender el valor de mercado de tu negocio, esta guía te explica los principales métodos de 
              valoración y te ofrece herramientas gratuitas para obtener una primera estimación.
            </p>
          </div>
        </section>

        {/* Section 2: Métodos de Valoración */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">
              Métodos de Valoración
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {METHODS.map((method) => (
                <div
                  key={method.title}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <method.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg mb-2">
                        {method.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Banner Calculadora */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto bg-primary/5 border border-primary/20 rounded-2xl p-8 md:p-12 text-center">
            <Calculator className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Calcula el valor de tu empresa
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Utiliza nuestra calculadora gratuita de valoración basada en múltiplos de EBITDA y 
              benchmarks sectoriales actualizados. Resultado inmediato y confidencial.
            </p>
            <Link
              to="/lp/calculadora"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Usar calculadora gratuita
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Section 4: CTA Profesional */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              ¿Necesitas una valoración profesional?
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Nuestra calculadora da una estimación inicial. Para una valoración formal con informe 
              detallado, análisis de estados financieros, posición competitiva y factores cualitativos, 
              contacta con nuestro equipo de expertos en M&A.
            </p>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg font-semibold hover:bg-foreground/90 transition-colors"
            >
              Solicita una valoración profesional
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Section 5: FAQ */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              Preguntas frecuentes sobre valoración de empresas
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_DATA.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ValoracionEmpresas;
