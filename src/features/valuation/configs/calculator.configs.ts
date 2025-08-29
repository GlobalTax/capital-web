// ============= CALCULATOR CONFIGURATIONS =============
// Pre-defined configs for each calculator version

import { CalculatorConfig } from '../types/unified.types';

// ============= V1 CONFIG =============
export const V1_CONFIG: CalculatorConfig = {
  version: 'v1',
  steps: 3,
  features: {
    autosave: true,
    tracking: true,
    taxCalculation: false,
    scenarios: false,
    realTime: false,
    standalone: false
  },
  ui: {
    theme: 'default',
    showProgress: true,
    showSaveStatus: true
  }
};

// ============= V2 CONFIG =============
export const V2_CONFIG: CalculatorConfig = {
  version: 'v2',
  steps: 2, // Solo 2 pasos reales: datos combinados + resultados
  features: {
    autosave: false,
    tracking: true,
    taxCalculation: false,
    scenarios: false,
    realTime: false,
    standalone: false
  },
  ui: {
    theme: 'default',
    showProgress: true,
    showSaveStatus: false
  }
};

// ============= V3 CONFIG =============
export const V3_CONFIG: CalculatorConfig = {
  version: 'v3',
  steps: 1, // Pre-loaded data, mainly scenarios
  features: {
    autosave: false,
    tracking: true,
    taxCalculation: true,
    scenarios: true,
    realTime: true,
    standalone: false
  },
  ui: {
    theme: 'advanced',
    showProgress: false,
    showSaveStatus: false
  }
};

// ============= MASTER CONFIG =============
export const MASTER_CONFIG: CalculatorConfig = {
  version: 'master',
  steps: 3,
  features: {
    autosave: true,
    tracking: true,
    taxCalculation: false,
    scenarios: false,
    realTime: false,
    standalone: false
  },
  ui: {
    theme: 'default',
    showProgress: true,
    showSaveStatus: true
  }
};

// ============= STANDALONE CONFIG =============
export const STANDALONE_CONFIG: CalculatorConfig = {
  version: 'standalone',
  steps: 1, // Single step form + results
  features: {
    autosave: false,
    tracking: false,
    taxCalculation: true,
    scenarios: true,
    realTime: true,
    standalone: true
  },
  ui: {
    theme: 'minimal',
    showProgress: false,
    showSaveStatus: false
  }
};

// ============= CONFIG HELPERS =============
export const getConfigByVersion = (version: string): CalculatorConfig => {
  switch (version) {
    case 'v1': return V1_CONFIG;
    case 'v2': return V2_CONFIG;
    case 'v3': return V3_CONFIG;
    case 'master': return MASTER_CONFIG;
    case 'standalone': return STANDALONE_CONFIG;
    default: return V1_CONFIG;
  }
};