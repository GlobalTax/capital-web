import type { SecuritySubsector } from '@/utils/securityValuation';

export interface SubsectorFieldConfig {
  id: string;
  label: string;
  placeholder: string;
  type: 'number' | 'select' | 'percentage';
  required?: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
  suffix?: string;
}

export interface SubsectorConfig {
  id: SecuritySubsector;
  label: string;
  icon: string; // lucide icon name
  description: string;
  fields: SubsectorFieldConfig[];
}

const COMMON_FINANCIAL_FIELDS: SubsectorFieldConfig[] = [
  {
    id: 'annualRevenue',
    label: 'Facturación anual (€)',
    placeholder: '2.000.000',
    type: 'number',
    required: true,
    helpText: 'Ingresos totales del último ejercicio',
  },
  {
    id: 'ebitda',
    label: 'EBITDA anual (€)',
    placeholder: '400.000',
    type: 'number',
    required: true,
    helpText: 'Beneficio antes de intereses, impuestos, depreciación y amortización',
  },
  {
    id: 'employeeCount',
    label: 'Número de empleados',
    placeholder: '25',
    type: 'number',
    required: true,
  },
];

export const SUBSECTOR_CONFIGS: SubsectorConfig[] = [
  {
    id: 'alarmas_cra',
    label: 'Alarmas / CRA',
    icon: 'Bell',
    description: 'Centrales receptoras de alarmas, sistemas de monitorización y cuotas de conexión.',
    fields: [
      ...COMMON_FINANCIAL_FIELDS,
      {
        id: 'craConnections',
        label: 'Conexiones CRA activas',
        placeholder: '500',
        type: 'number',
        required: true,
        helpText: 'Número de conexiones monitorizadas activamente',
      },
      {
        id: 'contractsOver24Months',
        label: 'Contratos >24 meses (%)',
        placeholder: '65',
        type: 'percentage',
        helpText: '% de contratos con permanencia superior a 24 meses',
      },
      {
        id: 'churnRate',
        label: 'Tasa de baja anual (%)',
        placeholder: '4',
        type: 'percentage',
        helpText: '% de conexiones perdidas al año',
      },
    ],
  },
  {
    id: 'vigilancia',
    label: 'Vigilancia',
    icon: 'Eye',
    description: 'Servicios de vigilancia privada, escoltas y protección de instalaciones.',
    fields: [
      ...COMMON_FINANCIAL_FIELDS,
      {
        id: 'topClientConcentration',
        label: 'Concentración top 3 clientes (%)',
        placeholder: '35',
        type: 'percentage',
        helpText: '% de facturación de los 3 principales clientes',
      },
      {
        id: 'publicContracts',
        label: 'Contratos públicos (%)',
        placeholder: '40',
        type: 'percentage',
        helpText: '% de ingresos procedentes de sector público',
      },
      {
        id: 'contractsOver24Months',
        label: 'Contratos >24 meses (%)',
        placeholder: '50',
        type: 'percentage',
      },
    ],
  },
  {
    id: 'sistemas_electronicos',
    label: 'Sistemas electrónicos',
    icon: 'Monitor',
    description: 'CCTV, control de accesos, intrusión y sistemas integrados de seguridad.',
    fields: [
      ...COMMON_FINANCIAL_FIELDS,
      {
        id: 'maintenanceMRR',
        label: 'MRR mantenimiento (€/mes)',
        placeholder: '30.000',
        type: 'number',
        helpText: 'Ingresos recurrentes mensuales por contratos de mantenimiento',
      },
      {
        id: 'installationBacklog',
        label: 'Backlog instalaciones (€)',
        placeholder: '200.000',
        type: 'number',
        helpText: 'Valor de instalaciones contratadas pendientes de ejecución',
      },
    ],
  },
  {
    id: 'contra_incendios',
    label: 'Contra incendios',
    icon: 'Flame',
    description: 'Instalación y mantenimiento de protección contra incendios (PCI).',
    fields: [
      ...COMMON_FINANCIAL_FIELDS,
      {
        id: 'maintenanceMRR',
        label: 'MRR mantenimiento (€/mes)',
        placeholder: '25.000',
        type: 'number',
        helpText: 'Ingresos recurrentes mensuales por mantenimiento obligatorio',
      },
      {
        id: 'installationBacklog',
        label: 'Backlog instalaciones (€)',
        placeholder: '150.000',
        type: 'number',
      },
      {
        id: 'contractsOver24Months',
        label: 'Contratos >24 meses (%)',
        placeholder: '70',
        type: 'percentage',
      },
    ],
  },
  {
    id: 'ciberseguridad',
    label: 'Ciberseguridad',
    icon: 'ShieldCheck',
    description: 'SOC, SIEM, auditoría IT, pentesting y consultoría de ciberseguridad.',
    fields: [
      ...COMMON_FINANCIAL_FIELDS,
      {
        id: 'revenueGrowthRate',
        label: 'Crecimiento revenue YoY (%)',
        placeholder: '25',
        type: 'percentage',
        required: true,
        helpText: 'Tasa de crecimiento de ingresos respecto al año anterior',
      },
      {
        id: 'maintenanceMRR',
        label: 'MRR servicios gestionados (€/mes)',
        placeholder: '40.000',
        type: 'number',
        helpText: 'Ingresos recurrentes mensuales por servicios gestionados (SOC, MDR)',
      },
    ],
  },
  {
    id: 'mixto',
    label: 'Mixto / Multi-servicio',
    icon: 'Layers',
    description: 'Empresas que combinan vigilancia, sistemas electrónicos y/o otros servicios.',
    fields: [
      ...COMMON_FINANCIAL_FIELDS,
      {
        id: 'maintenanceMRR',
        label: 'MRR servicios recurrentes (€/mes)',
        placeholder: '35.000',
        type: 'number',
        helpText: 'Total de ingresos mensuales recurrentes por todos los servicios',
      },
      {
        id: 'contractsOver24Months',
        label: 'Contratos >24 meses (%)',
        placeholder: '55',
        type: 'percentage',
      },
      {
        id: 'churnRate',
        label: 'Tasa de baja anual (%)',
        placeholder: '6',
        type: 'percentage',
      },
    ],
  },
];
