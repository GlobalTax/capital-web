// ============= TYPEFORM QUESTIONS CONFIG =============
// Configuración optimizada de preguntas agrupadas

import { ExtendedCompanyData } from '@/features/valuation/types/unified.types';

export interface TypeformField {
  field: keyof ExtendedCompanyData;
  type: 'text' | 'email' | 'tel' | 'select' | 'number';
  label: string;
  placeholder: string;
  required: boolean;
  options?: { value: string; label: string }[];
  hint?: string;
}

export interface TypeformStep {
  id: number;
  emoji: string;
  title: string;
  subtitle?: string;
  fields: TypeformField[];
}

export const TYPEFORM_STEPS: TypeformStep[] = [
  // ============= PASO 1: CONTACTO =============
  {
    id: 1,
    emoji: '👋',
    title: '¡Hola! Cuéntanos sobre ti',
    subtitle: 'Solo necesitamos unos datos para empezar',
    fields: [
      {
        field: 'contactName',
        type: 'text',
        label: 'Tu nombre',
        placeholder: 'Ej: María García',
        required: true
      },
      {
        field: 'email',
        type: 'email',
        label: 'Tu email',
        placeholder: 'maria@empresa.com',
        required: true,
        hint: 'Te enviaremos la valoración aquí'
      },
      {
        field: 'phone',
        type: 'tel',
        label: 'Teléfono (opcional)',
        placeholder: '+34 600 000 000',
        required: false,
        hint: 'Por si queremos afinar más la valoración'
      }
    ]
  },

  // ============= PASO 2: EMPRESA =============
  {
    id: 2,
    emoji: '🏢',
    title: 'Sobre tu empresa',
    subtitle: 'Información básica de {companyName}',
    fields: [
      {
        field: 'companyName',
        type: 'text',
        label: 'Nombre de la empresa',
        placeholder: 'Ej: Tech Solutions SL',
        required: true
      },
      {
        field: 'industry',
        type: 'select',
        label: 'Sector de actividad',
        placeholder: 'Selecciona un sector',
        required: true,
        options: [
          { value: 'Tecnología', label: '💻 Tecnología' },
          { value: 'Retail', label: '🛒 Retail y Comercio' },
          { value: 'Servicios', label: '🤝 Servicios Profesionales' },
          { value: 'Manufactura', label: '🏭 Manufactura e Industria' },
          { value: 'Salud', label: '⚕️ Salud y Bienestar' },
          { value: 'Educación', label: '📚 Educación' },
          { value: 'Hostelería', label: '🍽️ Hostelería' },
          { value: 'Construcción', label: '🏗️ Construcción' },
          { value: 'Transporte', label: '🚚 Transporte y Logística' },
          { value: 'Otros', label: '📦 Otros' }
        ]
      },
      {
        field: 'activityDescription',
        type: 'text',
        label: '¿A qué se dedica tu empresa?',
        placeholder: 'Ej: Desarrollo de software para retail',
        required: true,
        hint: 'Describe brevemente la actividad principal'
      }
    ]
  },

  // ============= PASO 3: TAMAÑO =============
  {
    id: 3,
    emoji: '👥',
    title: '¿Cuál es el tamaño de {companyName}?',
    fields: [
      {
        field: 'employeeRange',
        type: 'select',
        label: 'Número de empleados',
        placeholder: 'Selecciona el rango',
        required: true,
        options: [
          { value: '1', label: '👤 Solo yo (autónomo)' },
          { value: '2-5', label: '👥 2-5 empleados' },
          { value: '6-10', label: '👥 6-10 empleados' },
          { value: '11-25', label: '👥 11-25 empleados' },
          { value: '26-50', label: '👥 26-50 empleados' },
          { value: '51-100', label: '👥 51-100 empleados' },
          { value: '101-250', label: '👥 101-250 empleados' },
          { value: '250+', label: '👥 Más de 250 empleados' }
        ]
      }
    ]
  },

  // ============= PASO 4: FINANZAS =============
  {
    id: 4,
    emoji: '💰',
    title: 'Datos financieros',
    subtitle: 'Última información para calcular la valoración',
    fields: [
      {
        field: 'revenue',
        type: 'number',
        label: 'Facturación anual (€)',
        placeholder: '500000',
        required: true,
        hint: 'Facturación aproximada del último año'
      },
      {
        field: 'ebitda',
        type: 'number',
        label: 'EBITDA anual (€) - opcional',
        placeholder: '100000',
        required: false,
        hint: 'Si no lo conoces, lo estimaremos automáticamente'
      }
    ]
  }
];

// Helper para interpolar variables en textos
export const interpolateText = (text: string, data: any): string => {
  return text.replace(/\{(\w+)\}/g, (_, key) => data[key] || key);
};
