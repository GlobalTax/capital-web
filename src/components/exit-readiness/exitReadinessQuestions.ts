import { ExitReadinessQuestion } from './types';

// 10 Marktlink-style questions for Exit-Ready test
export const EXIT_READINESS_QUESTIONS: ExitReadinessQuestion[] = [
  {
    id: 1,
    question: "¿Cuál es tu horizonte temporal para una posible venta?",
    options: [
      { label: "Quiero vender lo antes posible", value: "asap", points: 10 },
      { label: "Estoy considerando vender en los próximos 5 años", value: "5years", points: 7 },
      { label: "No tengo planes concretos pero estoy abierto", value: "open", points: 4 }
    ],
    recommendation: "Define un horizonte temporal claro para poder planificar adecuadamente la preparación de tu empresa."
  },
  {
    id: 2,
    question: "¿Cuántos empleados tiene tu empresa?",
    options: [
      { label: "Más de 50 empleados", value: "50plus", points: 10 },
      { label: "Entre 10 y 50 empleados", value: "10to50", points: 7 },
      { label: "Menos de 10 empleados", value: "less10", points: 4 }
    ],
    recommendation: "Las empresas más grandes suelen ser más atractivas. Considera estrategias de crecimiento antes de la venta."
  },
  {
    id: 3,
    question: "¿Cuánto depende el negocio de ti como propietario?",
    options: [
      { label: "El negocio funciona de forma independiente", value: "independent", points: 10 },
      { label: "Tengo un rol importante pero el equipo puede asumir mucho", value: "partial", points: 6 },
      { label: "Soy esencial en las operaciones diarias", value: "essential", points: 2 }
    ],
    recommendation: "Reduce tu dependencia delegando funciones clave y documentando procesos. Esto aumentará significativamente el valor de tu empresa."
  },
  {
    id: 4,
    question: "¿Tienes un plan de sucesión o de salida definido?",
    options: [
      { label: "Sí, está completamente desarrollado", value: "complete", points: 10 },
      { label: "Lo he pensado pero no está definido", value: "partial", points: 5 },
      { label: "No, no tengo ningún plan", value: "none", points: 1 }
    ],
    recommendation: "Desarrolla un plan de sucesión claro. Los compradores valoran empresas con transiciones planificadas."
  },
  {
    id: 5,
    question: "¿Has buscado asesoramiento legal o fiscal para la venta?",
    options: [
      { label: "Sí, tengo asesores legales y fiscales", value: "both", points: 10 },
      { label: "Sí, pero solo uno de los dos", value: "partial", points: 6 },
      { label: "No, aún no he buscado asesoramiento", value: "none", points: 2 }
    ],
    recommendation: "Busca asesoramiento especializado en M&A. Una buena estructuración puede optimizar significativamente el resultado fiscal."
  },
  {
    id: 6,
    question: "¿Cuál es tu posición competitiva en el mercado?",
    options: [
      { label: "Posición única con poca competencia directa", value: "unique", points: 10 },
      { label: "Buena posición pero con competencia significativa", value: "good", points: 6 },
      { label: "Posición desafiante por alta competencia", value: "challenging", points: 3 }
    ],
    recommendation: "Trabaja en diferenciarte de la competencia. Una posición de mercado sólida aumenta el atractivo para compradores."
  },
  {
    id: 7,
    question: "¿Tienes un plan de negocio actualizado para los próximos 3 años?",
    options: [
      { label: "Sí, tengo un plan detallado y actualizado", value: "yes", points: 10 },
      { label: "Tengo ideas pero no están documentadas", value: "partial", points: 5 },
      { label: "No tengo un plan formal", value: "no", points: 2 }
    ],
    recommendation: "Elabora un plan de negocio con proyecciones a 3-5 años. Los compradores quieren ver potencial de crecimiento."
  },
  {
    id: 8,
    question: "¿Cómo han evolucionado los resultados (beneficio neto) en los últimos 3 años?",
    options: [
      { label: "Mejora cada año de forma constante", value: "improving", points: 10 },
      { label: "Mayormente estable", value: "stable", points: 7 },
      { label: "Variación significativa cada año", value: "variable", points: 4 },
      { label: "En declive", value: "decline", points: 1 }
    ],
    recommendation: "Trabaja en estabilizar y mejorar tus resultados antes de la venta. La tendencia es clave para los compradores."
  },
  {
    id: 9,
    question: "¿Cómo ha evolucionado la facturación en los últimos 3 años?",
    options: [
      { label: "Mejora cada año de forma constante", value: "improving", points: 10 },
      { label: "Mayormente estable", value: "stable", points: 7 },
      { label: "Variación significativa cada año", value: "variable", points: 4 },
      { label: "En declive", value: "decline", points: 1 }
    ],
    recommendation: "Desarrolla estrategias para aumentar y diversificar ingresos. El crecimiento sostenido es muy valorado."
  },
  {
    id: 10,
    question: "¿Cuál es tu EBITDA medio anual aproximado?",
    options: [
      { label: "Más de 1M EUR", value: "1m_plus", points: 10 },
      { label: "Entre 500K y 1M EUR", value: "500k_1m", points: 8 },
      { label: "Entre 200K y 500K EUR", value: "200k_500k", points: 5 },
      { label: "Menos de 200K EUR", value: "less_200k", points: 3 },
      { label: "No lo sé / Prefiero no decir", value: "unknown", points: 1 }
    ],
    recommendation: "Conoce y optimiza tu EBITDA. Es la métrica más importante para valorar tu empresa."
  }
];

export const MAX_SCORE = EXIT_READINESS_QUESTIONS.reduce(
  (acc, q) => acc + Math.max(...q.options.map(o => o.points)),
  0
);

export const getReadinessLevel = (score: number): 'ready' | 'in_progress' | 'needs_work' => {
  const percentage = (score / MAX_SCORE) * 100;
  if (percentage >= 70) return 'ready';
  if (percentage >= 40) return 'in_progress';
  return 'needs_work';
};

export const getReadinessLabel = (level: 'ready' | 'in_progress' | 'needs_work'): string => {
  switch (level) {
    case 'ready': return 'Preparado';
    case 'in_progress': return 'En Progreso';
    case 'needs_work': return 'Necesita Trabajo';
  }
};

export const getReadinessDescription = (level: 'ready' | 'in_progress' | 'needs_work'): string => {
  switch (level) {
    case 'ready': 
      return 'Tu empresa está bien preparada para iniciar un proceso de venta. Tienes la documentación y estructura necesarias.';
    case 'in_progress': 
      return 'Tu empresa tiene buenas bases pero hay áreas de mejora. Te recomendamos trabajar en los puntos débiles antes de iniciar el proceso.';
    case 'needs_work': 
      return 'Tu empresa necesita preparación adicional antes de considerar una venta. Te recomendamos comenzar a trabajar en las áreas identificadas.';
  }
};
