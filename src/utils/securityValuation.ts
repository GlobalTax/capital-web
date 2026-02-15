// ============= SECURITY SECTOR VALUATION ENGINE =============

export type SecuritySubsector = 
  | 'alarmas_cra'
  | 'vigilancia'
  | 'sistemas_electronicos'
  | 'contra_incendios'
  | 'ciberseguridad'
  | 'mixto';

export interface SecurityInputData {
  subsector: SecuritySubsector;
  // Common fields
  annualRevenue: number;
  ebitda: number;
  employeeCount: number;
  // Alarmas/CRA specific
  craConnections?: number;
  contractsOver24Months?: number; // percentage 0-100
  churnRate?: number; // percentage 0-100
  // Vigilancia specific
  topClientConcentration?: number; // percentage 0-100 (revenue from top 3 clients)
  publicContracts?: number; // percentage 0-100
  // Sistemas / Contra incendios
  maintenanceMRR?: number; // monthly recurring revenue from maintenance
  installationBacklog?: number; // value of signed but unexecuted installations
  // Ciberseguridad
  revenueGrowthRate?: number; // percentage YoY
  // Licenses
  hasSecurityLicense?: boolean;
  hasCRALicense?: boolean;
  hasFireLicense?: boolean;
}

export interface SecurityValuationResult {
  baseValuation: number;
  recurrencePremium: number;
  licensePremium: number;
  totalValuation: number;
  valuationRange: { min: number; max: number };
  multipleUsed: { min: number; base: number; max: number };
  dealStructure: {
    fixedPrice: number;
    fixedPricePercentage: number;
    earnOut: number;
    earnOutPercentage: number;
    earnOutCondition: string;
  };
  sectorComparables: {
    label: string;
    multipleRange: string;
    avgDealSize: string;
  }[];
  breakdown: {
    label: string;
    value: number;
    percentage: number;
  }[];
}

// --- Subsector multiples configuration ---
const SUBSECTOR_MULTIPLES: Record<SecuritySubsector, { min: number; base: number; max: number; metric: 'ebitda' | 'revenue' | 'connections' }> = {
  alarmas_cra: { min: 6, base: 7.5, max: 9, metric: 'connections' },
  vigilancia: { min: 4, base: 5, max: 6, metric: 'ebitda' },
  sistemas_electronicos: { min: 5, base: 6.5, max: 8, metric: 'ebitda' },
  contra_incendios: { min: 5.5, base: 6.5, max: 8, metric: 'ebitda' },
  ciberseguridad: { min: 2, base: 3.5, max: 5, metric: 'revenue' },
  mixto: { min: 5, base: 6, max: 7.5, metric: 'ebitda' },
};

// Value per CRA connection (EUR)
const CONNECTION_VALUE = { min: 800, base: 1150, max: 1500 };

// --- Calculation helpers ---
function calcRecurrencePremium(data: SecurityInputData): number {
  let premium = 0;
  const { subsector, maintenanceMRR, contractsOver24Months, churnRate } = data;

  // Long-term contracts premium (up to 15%)
  if (contractsOver24Months && contractsOver24Months > 50) {
    premium += data.ebitda * 0.15 * (contractsOver24Months / 100);
  }

  // Low churn premium (up to 10%)
  if (churnRate !== undefined && churnRate < 5) {
    premium += data.ebitda * 0.10 * ((5 - churnRate) / 5);
  }

  // MRR premium for systems/fire (up to 12%)
  if ((subsector === 'sistemas_electronicos' || subsector === 'contra_incendios') && maintenanceMRR) {
    const annualMRR = maintenanceMRR * 12;
    const mrrRatio = annualMRR / (data.annualRevenue || 1);
    premium += data.ebitda * 0.12 * Math.min(mrrRatio, 1);
  }

  return Math.round(premium);
}

function calcLicensePremium(data: SecurityInputData): number {
  let premium = 0;
  const baseAmount = data.ebitda * 0.05;

  if (data.hasSecurityLicense) premium += baseAmount;
  if (data.hasCRALicense) premium += baseAmount * 1.5; // CRA license is harder to get
  if (data.hasFireLicense) premium += baseAmount;

  return Math.round(premium);
}

function getSectorComparables(subsector: SecuritySubsector) {
  const comparables: Record<SecuritySubsector, { label: string; multipleRange: string; avgDealSize: string }[]> = {
    alarmas_cra: [
      { label: 'CRA regionales (España)', multipleRange: '6x-8x EBITDA', avgDealSize: '€5M-€15M' },
      { label: 'Plataformas alarmas UE', multipleRange: '8x-10x EBITDA', avgDealSize: '€20M-€80M' },
      { label: 'Integradores con CRA', multipleRange: '7x-9x EBITDA', avgDealSize: '€8M-€25M' },
    ],
    vigilancia: [
      { label: 'Vigilancia regional', multipleRange: '4x-5x EBITDA', avgDealSize: '€3M-€10M' },
      { label: 'Vigilancia nacional', multipleRange: '5x-6x EBITDA', avgDealSize: '€15M-€50M' },
      { label: 'Seguridad integral', multipleRange: '5x-7x EBITDA', avgDealSize: '€10M-€30M' },
    ],
    sistemas_electronicos: [
      { label: 'Integradores CCTV/control accesos', multipleRange: '5x-7x EBITDA', avgDealSize: '€4M-€12M' },
      { label: 'Instaladores con mantenimiento', multipleRange: '6x-8x EBITDA', avgDealSize: '€6M-€20M' },
      { label: 'Plataformas tecnológicas', multipleRange: '7x-9x EBITDA', avgDealSize: '€10M-€40M' },
    ],
    contra_incendios: [
      { label: 'PCI regional', multipleRange: '5x-7x EBITDA', avgDealSize: '€3M-€10M' },
      { label: 'PCI con cartera mantenimiento', multipleRange: '6x-8x EBITDA', avgDealSize: '€8M-€25M' },
      { label: 'PCI + ingeniería', multipleRange: '6x-8x EBITDA', avgDealSize: '€5M-€15M' },
    ],
    ciberseguridad: [
      { label: 'MSSP regionales', multipleRange: '2x-3x Revenue', avgDealSize: '€5M-€20M' },
      { label: 'SOC/SIEM providers', multipleRange: '3x-5x Revenue', avgDealSize: '€10M-€50M' },
      { label: 'Consultoría ciber', multipleRange: '1.5x-2.5x Revenue', avgDealSize: '€3M-€15M' },
    ],
    mixto: [
      { label: 'Seguridad integral regional', multipleRange: '5x-6x EBITDA', avgDealSize: '€5M-€15M' },
      { label: 'Grupos multi-servicio', multipleRange: '6x-7x EBITDA', avgDealSize: '€10M-€30M' },
      { label: 'Plataformas consolidación', multipleRange: '6x-8x EBITDA', avgDealSize: '€15M-€60M' },
    ],
  };

  return comparables[subsector];
}

// --- Main calculation ---
export function calculateSecurityValuation(data: SecurityInputData): SecurityValuationResult {
  const multiples = SUBSECTOR_MULTIPLES[data.subsector];
  let baseValuation: number;

  // Calculate base valuation depending on metric
  if (data.subsector === 'alarmas_cra' && data.craConnections) {
    // Connections-based valuation
    baseValuation = data.craConnections * CONNECTION_VALUE.base;
    // Also consider EBITDA multiple as sanity check
    const ebitdaVal = data.ebitda * multiples.base;
    baseValuation = Math.max(baseValuation, ebitdaVal);
  } else if (data.subsector === 'ciberseguridad') {
    // Revenue-based valuation
    baseValuation = data.annualRevenue * multiples.base;
  } else {
    // EBITDA-based valuation
    baseValuation = data.ebitda * multiples.base;
  }

  const recurrencePremium = calcRecurrencePremium(data);
  const licensePremium = calcLicensePremium(data);
  const totalValuation = baseValuation + recurrencePremium + licensePremium;

  // Valuation range
  let rangeMin: number, rangeMax: number;
  if (data.subsector === 'alarmas_cra' && data.craConnections) {
    rangeMin = Math.min(data.craConnections * CONNECTION_VALUE.min, data.ebitda * multiples.min);
    rangeMax = data.craConnections * CONNECTION_VALUE.max + recurrencePremium + licensePremium;
    rangeMin = Math.max(rangeMin, data.ebitda * multiples.min);
  } else if (data.subsector === 'ciberseguridad') {
    rangeMin = data.annualRevenue * multiples.min;
    rangeMax = data.annualRevenue * multiples.max + recurrencePremium + licensePremium;
  } else {
    rangeMin = data.ebitda * multiples.min;
    rangeMax = data.ebitda * multiples.max + recurrencePremium + licensePremium;
  }

  // Deal structure: more earn-out for higher churn / less predictability
  const churn = data.churnRate ?? 5;
  const earnOutPct = Math.min(40, Math.max(15, churn * 3 + 10)); // 15%-40%
  const fixedPct = 100 - earnOutPct;

  const earnOutCondition = data.subsector === 'alarmas_cra'
    ? 'Retención ≥90% de conexiones CRA a 24 meses'
    : data.subsector === 'vigilancia'
    ? 'Mantenimiento ≥85% de contratos activos a 18 meses'
    : data.subsector === 'ciberseguridad'
    ? 'Crecimiento revenue ≥15% anual durante 2 años'
    : 'Retención ≥90% de contratos de mantenimiento a 24 meses';

  // Breakdown for chart
  const breakdown = [
    { label: 'Valor base', value: baseValuation, percentage: Math.round((baseValuation / totalValuation) * 100) },
  ];
  if (recurrencePremium > 0) {
    breakdown.push({ label: 'Prima recurrencia', value: recurrencePremium, percentage: Math.round((recurrencePremium / totalValuation) * 100) });
  }
  if (licensePremium > 0) {
    breakdown.push({ label: 'Prima licencias', value: licensePremium, percentage: Math.round((licensePremium / totalValuation) * 100) });
  }

  return {
    baseValuation: Math.round(baseValuation),
    recurrencePremium,
    licensePremium,
    totalValuation: Math.round(totalValuation),
    valuationRange: { min: Math.round(rangeMin), max: Math.round(rangeMax) },
    multipleUsed: multiples,
    dealStructure: {
      fixedPrice: Math.round(totalValuation * fixedPct / 100),
      fixedPricePercentage: fixedPct,
      earnOut: Math.round(totalValuation * earnOutPct / 100),
      earnOutPercentage: earnOutPct,
      earnOutCondition,
    },
    sectorComparables: getSectorComparables(data.subsector),
    breakdown,
  };
}
