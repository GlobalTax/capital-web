import { ExitReadinessQuestion } from './types';

export const EXIT_READINESS_QUESTIONS: ExitReadinessQuestion[] = [
  {
    id: 1,
    question: "¿Tienes estados financieros auditados de los últimos 3 años?",
    options: [
      { label: "Sí, auditados y actualizados", value: "yes", points: 10 },
      { label: "Parcialmente, sin auditar", value: "partial", points: 5 },
      { label: "No tengo documentación organizada", value: "no", points: 0 }
    ],
    recommendation: "Prepara estados financieros auditados de los últimos 3-5 años"
  },
  {
    id: 2,
    question: "¿Tu empresa puede operar rentablemente sin tu participación diaria?",
    options: [
      { label: "Sí, tengo un equipo autónomo", value: "yes", points: 10 },
      { label: "En proceso de delegación", value: "partial", points: 5 },
      { label: "No, depende mucho de mí", value: "no", points: 0 }
    ],
    recommendation: "Desarrolla un equipo directivo capaz de operar sin el fundador"
  },
  {
    id: 3,
    question: "¿Tienes contratos formalizados con tus principales clientes?",
    options: [
      { label: "Todos formalizados", value: "yes", points: 10 },
      { label: "Algunos formalizados", value: "partial", points: 5 },
      { label: "Sin contratos formales", value: "no", points: 0 }
    ],
    recommendation: "Formaliza contratos con todos los clientes clave"
  },
  {
    id: 4,
    question: "¿Conoces el valor aproximado de tu empresa?",
    options: [
      { label: "Sí, tengo una valoración reciente", value: "yes", points: 10 },
      { label: "Tengo una idea aproximada", value: "partial", points: 5 },
      { label: "No lo he calculado nunca", value: "no", points: 0 }
    ],
    recommendation: "Obtén una valoración profesional actualizada de tu empresa"
  },
  {
    id: 5,
    question: "¿Tienes documentados los procesos clave del negocio?",
    options: [
      { label: "Completamente documentados", value: "yes", points: 10 },
      { label: "Parcialmente documentados", value: "partial", points: 5 },
      { label: "Sin documentar", value: "no", points: 0 }
    ],
    recommendation: "Documenta todos los procesos operativos y comerciales clave"
  },
  {
    id: 6,
    question: "¿Has identificado riesgos o contingencias que podrían afectar la venta?",
    options: [
      { label: "Sí, identificados y mitigados", value: "yes", points: 10 },
      { label: "Identificados pero sin mitigar", value: "partial", points: 5 },
      { label: "No los he analizado", value: "no", points: 0 }
    ],
    recommendation: "Realiza un análisis de riesgos y contingencias legales/fiscales"
  },
  {
    id: 7,
    question: "¿Tienes un equipo directivo preparado para la transición?",
    options: [
      { label: "Sí, equipo consolidado", value: "yes", points: 10 },
      { label: "En desarrollo", value: "partial", points: 5 },
      { label: "No tengo equipo directivo", value: "no", points: 0 }
    ],
    recommendation: "Forma y consolida un equipo directivo para la transición"
  },
  {
    id: 8,
    question: "¿En qué plazo consideras vender tu empresa?",
    options: [
      { label: "0-6 meses", value: "short", points: 10 },
      { label: "6-18 meses", value: "medium", points: 7 },
      { label: "Más de 18 meses", value: "long", points: 5 }
    ],
    recommendation: "Define un timeline claro y comienza la preparación con antelación"
  }
];

export const MAX_SCORE = EXIT_READINESS_QUESTIONS.reduce(
  (acc, q) => acc + Math.max(...q.options.map(o => o.points)),
  0
);

export const getReadinessLevel = (score: number): 'ready' | 'in_progress' | 'needs_work' => {
  if (score >= 70) return 'ready';
  if (score >= 40) return 'in_progress';
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
