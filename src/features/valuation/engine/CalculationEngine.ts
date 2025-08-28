import { CalculationStrategy, BaseCompanyData, ValuationResult, ScenarioResult } from '../types';

export interface CalculationConfig {
  strategy: CalculationStrategy;
  includeScenarios: boolean;
  includeTaxSimulation: boolean;
}

export abstract class BaseCalculationEngine {
  protected config: CalculationConfig;

  constructor(config: CalculationConfig) {
    this.config = config;
  }

  abstract calculate(data: BaseCompanyData): ValuationResult;
  generateScenarios?(data: BaseCompanyData): ScenarioResult[];
}

export class SimpleCalculationEngine extends BaseCalculationEngine {
  calculate(data: BaseCompanyData): ValuationResult {
    const baseMultiple = this.getBaseMultiple(data.industry);
    const adjustedMultiple = this.applyAdjustments(baseMultiple, data);
    const finalValuation = data.ebitda * adjustedMultiple;

    return {
      ebitdaMultiple: adjustedMultiple,
      finalValuation,
      valuationRange: {
        min: finalValuation * 0.8,
        max: finalValuation * 1.2,
      },
      multiples: {
        ebitdaMultipleUsed: adjustedMultiple,
      },
    };
  }

  private getBaseMultiple(industry: string): number {
    const multipliers: Record<string, number> = {
      'tecnologia': 8.5,
      'healthcare': 7.2,
      'manufacturing': 5.8,
      'retail': 4.5,
      'services': 6.0,
      'default': 6.0,
    };

    return multipliers[industry] || multipliers.default;
  }

  private applyAdjustments(baseMultiple: number, data: BaseCompanyData): number {
    let adjustedMultiple = baseMultiple;

    // Revenue size adjustment
    if (data.revenue > 10000000) {
      adjustedMultiple *= 1.1;
    } else if (data.revenue < 1000000) {
      adjustedMultiple *= 0.9;
    }

    // EBITDA margin adjustment
    const ebitdaMargin = data.ebitda / data.revenue;
    if (ebitdaMargin > 0.2) {
      adjustedMultiple *= 1.05;
    } else if (ebitdaMargin < 0.1) {
      adjustedMultiple *= 0.95;
    }

    return Math.round(adjustedMultiple * 100) / 100;
  }
}

export class CompactCalculationEngine extends BaseCalculationEngine {
  calculate(data: BaseCompanyData): ValuationResult {
    // Ultra-fast calculation for V4 style
    const quickMultiple = this.getQuickMultiple(data.industry);
    const finalValuation = data.ebitda * quickMultiple;

    return {
      ebitdaMultiple: quickMultiple,
      finalValuation,
      valuationRange: {
        min: finalValuation * 0.85,
        max: finalValuation * 1.15,
      },
      multiples: {
        ebitdaMultipleUsed: quickMultiple,
      },
    };
  }

  generateScenarios(data: BaseCompanyData): ScenarioResult[] {
    const baseValuation = this.calculate(data).finalValuation;
    
    return [
      {
        id: 'conservative',
        name: 'Conservador',
        multiplier: 0.8,
        valuation: baseValuation * 0.8,
        totalTax: 0,
        netReturn: baseValuation * 0.8,
        roi: 0,
        effectiveTaxRate: 0,
        color: '#ef4444',
      },
      {
        id: 'base',
        name: 'Base',
        multiplier: 1.0,
        valuation: baseValuation,
        totalTax: 0,
        netReturn: baseValuation,
        roi: 0,
        effectiveTaxRate: 0,
        color: '#3b82f6',
      },
      {
        id: 'optimistic',
        name: 'Optimista',
        multiplier: 1.2,
        valuation: baseValuation * 1.2,
        totalTax: 0,
        netReturn: baseValuation * 1.2,
        roi: 0,
        effectiveTaxRate: 0,
        color: '#10b981',
      },
    ];
  }

  private getQuickMultiple(industry: string): number {
    // Simplified industry multipliers for quick calculation
    const quickMultipliers: Record<string, number> = {
      'tecnologia': 8.0,
      'healthcare': 7.0,
      'manufacturing': 5.5,
      'retail': 4.0,
      'services': 5.5,
      'default': 5.5,
    };

    return quickMultipliers[industry] || quickMultipliers.default;
  }
}

export class CalculationEngineFactory {
  static create(strategy: CalculationStrategy, config: Partial<CalculationConfig> = {}): BaseCalculationEngine {
    const fullConfig: CalculationConfig = {
      strategy,
      includeScenarios: false,
      includeTaxSimulation: false,
      ...config,
    };

    switch (strategy) {
      case 'simple':
      case 'extended':
      case 'master':
        return new SimpleCalculationEngine(fullConfig);
      case 'compact':
        return new CompactCalculationEngine(fullConfig);
      default:
        return new SimpleCalculationEngine(fullConfig);
    }
  }
}