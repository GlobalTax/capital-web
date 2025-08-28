// ============= DOCUMENTATION SYSTEM =============
// Sistema centralizado de documentación y ADRs

export interface ArchitecturalDecisionRecord {
  id: string;
  title: string;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  date: string;
  context: string;
  decision: string;
  consequences: string[];
  alternatives?: string[];
  supersededBy?: string;
}

export interface ComponentDocumentation {
  name: string;
  purpose: string;
  props: Record<string, {
    type: string;
    required: boolean;
    description: string;
    defaultValue?: any;
  }>;
  examples: {
    title: string;
    code: string;
    description: string;
  }[];
  hooks?: string[];
  dependencies?: string[];
  performance?: {
    renderTime: number;
    memoryUsage: number;
    bundleSize: number;
  };
}

export interface APIDocumentation {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters: Record<string, {
    type: string;
    required: boolean;
    description: string;
    example?: any;
  }>;
  responses: Record<string, {
    description: string;
    schema: any;
    example: any;
  }>;
  authentication?: string;
  rateLimit?: string;
}

// ADRs del sistema actual
export const ARCHITECTURAL_DECISIONS: ArchitecturalDecisionRecord[] = [
  {
    id: 'ADR-001',
    title: 'Separación de App.tsx en módulos especializados',
    status: 'accepted',
    date: '2024-12-19',
    context: 'App.tsx violaba el principio de responsabilidad única conteniendo routing, analytics, providers y redirects.',
    decision: 'Dividir App.tsx en AppRouter, HostRedirectService, AnalyticsBootstrap y AppProviders.',
    consequences: [
      'Mejor separación de responsabilidades',
      'Código más mantenible y testeable',
      'Carga lazy más eficiente',
      'Posible overhead inicial de arquitectura'
    ]
  },
  {
    id: 'ADR-002',
    title: 'Consolidación de calculadoras versionadas',
    status: 'accepted',
    date: '2024-12-19',
    context: 'Múltiples versiones de calculadoras (V1-V4) generaban duplicación de código y complejidad.',
    decision: 'Implementar patrón Strategy con CalculationEngine unified.',
    consequences: [
      'Eliminación de duplicación de código',
      'Facilita mantenimiento y testing',
      'Mejor extensibilidad para nuevos tipos de cálculo',
      'Migración necesaria de componentes existentes'
    ]
  },
  {
    id: 'ADR-003',
    title: 'Sistema de logging condicional',
    status: 'accepted',
    date: '2024-12-19',
    context: 'Exceso de console.log en producción afectaba rendimiento y debugging.',
    decision: 'Implementar ConditionalLogger que solo registra errores críticos en producción.',
    consequences: [
      'Mejor rendimiento en producción',
      'Logs estructurados para debugging',
      'Menor spam en consola',
      'Posible pérdida de información de debug en producción'
    ]
  },
  {
    id: 'ADR-004',
    title: 'TypeScript strict mode',
    status: 'accepted',
    date: '2024-12-19',
    context: 'Múltiples usos de "any" y tipos débiles generaban bugs en runtime.',
    decision: 'Habilitar strict mode y crear interfaces tipadas.',
    consequences: [
      'Mayor seguridad de tipos',
      'Mejor IntelliSense y developer experience',
      'Detección temprana de errores',
      'Tiempo adicional de desarrollo inicial'
    ]
  },
  {
    id: 'ADR-005',
    title: 'Capa de abstracción de datos con DataService',
    status: 'accepted',
    date: '2024-12-19',
    context: 'Llamadas directas a Supabase dispersas por toda la aplicación.',
    decision: 'Centralizar acceso a datos en DataService con patrón Repository.',
    consequences: [
      'Mejor testabilidad y mocking',
      'Centralización de lógica de datos',
      'Facilita migración entre backends',
      'Capa adicional de abstracción'
    ]
  }
];

// Documentación de componentes críticos
export const COMPONENT_DOCS: ComponentDocumentation[] = [
  {
    name: 'ValuationCalculator',
    purpose: 'Calculadora principal de valoración de empresas con múltiples métodos',
    props: {
      mode: {
        type: 'CalculationMode',
        required: false,
        description: 'Modo de cálculo (dcf, multiples, asset)',
        defaultValue: 'dcf'
      },
      onValuationComplete: {
        type: '(result: ValuationResult) => void',
        required: false,
        description: 'Callback ejecutado al completar valoración'
      }
    },
    examples: [
      {
        title: 'Uso básico',
        code: '<ValuationCalculator mode="dcf" />',
        description: 'Calculadora con método DCF por defecto'
      }
    ],
    hooks: ['useValuationEngine', 'useFormPersistence'],
    dependencies: ['@react-pdf/renderer', 'zod', 'react-hook-form']
  }
];

// Helper para generar documentación
export const generateComponentDoc = (component: any): ComponentDocumentation => {
  return {
    name: component.name || 'UnknownComponent',
    purpose: 'Auto-generated documentation',
    props: {},
    examples: [],
    hooks: [],
    dependencies: []
  };
};

export const getADR = (id: string): ArchitecturalDecisionRecord | undefined => {
  return ARCHITECTURAL_DECISIONS.find(adr => adr.id === id);
};

export const getActiveADRs = (): ArchitecturalDecisionRecord[] => {
  return ARCHITECTURAL_DECISIONS.filter(adr => adr.status === 'accepted');
};

export default {
  ARCHITECTURAL_DECISIONS,
  COMPONENT_DOCS,
  generateComponentDoc,
  getADR,
  getActiveADRs
};