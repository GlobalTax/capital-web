import React from 'react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const FAQ_DATA = [
  {
    question: '¿Es gratuita la calculadora de valoración?',
    answer:
      'Sí, nuestra calculadora de valoración de empresas es completamente gratuita y sin compromiso. Puedes utilizarla tantas veces como necesites para obtener una estimación orientativa del valor de tu negocio.',
  },
  {
    question: '¿Qué métodos de valoración utilizáis?',
    answer:
      'Nuestra calculadora utiliza el método de múltiplos de EBITDA y de facturación, ajustados por sector, tamaño de empresa, márgenes operativos y tasa de crecimiento. Estos múltiplos se basan en transacciones reales del mercado español y europeo, actualizados periódicamente.',
  },
  {
    question: '¿Cuánto tarda una valoración profesional?',
    answer:
      'Una valoración profesional completa realizada por nuestro equipo de expertos en M&A suele tardar entre 2 y 4 semanas, dependiendo de la complejidad de la empresa y la disponibilidad de la documentación financiera. La calculadora online ofrece un resultado inmediato como punto de partida.',
  },
  {
    question: '¿Los datos que introduzco son confidenciales?',
    answer:
      'Absolutamente. Todos los datos introducidos en la calculadora son tratados con total confidencialidad. No compartimos información con terceros y cumplimos con la normativa RGPD. Si solicitas un informe por email, tus datos se almacenan de forma segura y cifrada.',
  },
  {
    question: '¿Qué sectores cubre la calculadora?',
    answer:
      'La calculadora cubre más de 20 sectores, incluyendo tecnología, industrial, servicios profesionales, retail, hostelería, salud, educación, construcción, transporte y logística, alimentación, energía, y muchos más. Los múltiplos de cada sector se actualizan con datos de mercado reales.',
  },
];

const CalculatorSEOContent: React.FC = () => {
  return (
    <section className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      {/* Metodología */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          ¿Cómo funciona nuestra calculadora de valoración?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Nuestra calculadora de valoración de empresas utiliza la metodología de{' '}
          <strong>múltiplos de EBITDA</strong> (beneficio antes de intereses, impuestos,
          depreciación y amortización), uno de los métodos más utilizados en el mundo de las
          fusiones y adquisiciones (M&amp;A). Este enfoque permite obtener una estimación rápida y
          fundamentada del valor de un negocio, basándose en cómo el mercado valora empresas
          similares en el mismo sector.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          El proceso es sencillo: introduces los datos financieros básicos de tu empresa —
          facturación anual, EBITDA, sector de actividad y número de empleados — y la calculadora
          aplica los múltiplos sectoriales correspondientes. Estos múltiplos se extraen de bases de
          datos de transacciones reales del mercado español y europeo, y se actualizan
          periódicamente para reflejar las condiciones del mercado.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Además del múltiplo sectorial base, la calculadora incorpora{' '}
          <strong>ajustes por tamaño de empresa, tasa de crecimiento y márgenes operativos</strong>.
          Una empresa con márgenes superiores a la media de su sector, o con un crecimiento
          sostenido, recibirá una valoración más alta que la media. Del mismo modo, empresas más
          pequeñas suelen tener un descuento por menor liquidez y mayor riesgo operativo.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          El resultado es un <strong>rango de valoración</strong> que refleja el intervalo en el que
          podría cerrarse una transacción real, no un número único. Esto te ofrece una perspectiva
          más realista del valor de mercado de tu empresa y te ayuda a tomar decisiones informadas
          antes de iniciar cualquier proceso de venta, inversión o reestructuración.
        </p>
      </div>

      {/* Escenarios */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          ¿Cuándo necesitas valorar tu empresa?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Conocer el valor de tu empresa es fundamental en múltiples situaciones empresariales.
          No solo es necesario cuando planeas vender, sino en cualquier momento clave del ciclo
          de vida de tu negocio. Estos son los escenarios más habituales:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>
            <strong>Venta de la empresa:</strong> conocer el valor de mercado es el primer paso
            para negociar con garantías y maximizar el precio de venta.
          </li>
          <li>
            <strong>Entrada de un nuevo socio o inversor:</strong> una valoración objetiva
            determina el porcentaje de participación justo para ambas partes.
          </li>
          <li>
            <strong>Herencia y sucesión:</strong> para planificar la transmisión generacional o
            calcular el impacto fiscal de una herencia empresarial.
          </li>
          <li>
            <strong>Búsqueda de financiación:</strong> bancos e inversores necesitan una valoración
            actualizada para evaluar la solvencia y el potencial del negocio.
          </li>
          <li>
            <strong>Planificación estratégica:</strong> monitorizar la evolución del valor de tu
            empresa año a año te permite medir el impacto de tus decisiones de gestión.
          </li>
        </ul>
      </div>

      {/* Profesional vs Online */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          Valoración profesional vs. calculadora online
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Nuestra calculadora online proporciona una <strong>estimación orientativa</strong> del
          valor de tu empresa basada en datos de mercado y múltiplos sectoriales. Es una excelente
          herramienta para obtener una primera aproximación rápida y gratuita, pero no sustituye a
          una valoración profesional completa.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Una valoración profesional incluye un análisis detallado de los estados financieros, la
          posición competitiva, los activos tangibles e intangibles, la calidad del equipo
          directivo, los contratos recurrentes, y otros factores cualitativos que una calculadora
          automática no puede evaluar. Si estás considerando una operación de compraventa o
          necesitas un informe formal, te recomendamos contactar con nuestro equipo de expertos.
        </p>
        <div className="pt-2">
          <Link
            to="/contacto"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Solicita una valoración profesional
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Preguntas frecuentes</h2>
        <Accordion type="single" collapsible className="w-full">
          {FAQ_DATA.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default CalculatorSEOContent;
