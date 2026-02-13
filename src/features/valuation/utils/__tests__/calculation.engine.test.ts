import { describe, it, expect, vi } from 'vitest';

// We need to test the calculation engine's internal logic
// Since calculateUnifiedValuation is async with a delay, we'll test it directly
import { calculateUnifiedValuation } from '../calculation.engine';
import type { ExtendedCompanyData, TaxData, ValuationResult, ComprehensiveResult } from '../../types/unified.types';

// Speed up tests by mocking setTimeout
vi.useFakeTimers();

const makeCompanyData = (overrides: Partial<ExtendedCompanyData> = {}): ExtendedCompanyData => ({
  contactName: 'Test User',
  companyName: 'Test Corp',
  email: 'test@test.com',
  phone: '612345678',
  industry: 'Tecnología',
  revenue: 1000000,
  ebitda: 200000,
  whatsapp_opt_in: false,
  ...overrides,
});

const defaultTaxData: TaxData = {
  acquisitionValue: 100000,
  acquisitionDate: '2020-01-01',
  taxpayerType: 'individual',
  salePercentage: 100,
  reinvestmentPlan: false,
  reinvestmentAmount: 0,
  vitaliciaPlan: false,
  vitaliciaAmount: 0,
};

async function runCalc(
  companyData: ExtendedCompanyData,
  options: { includeScenarios?: boolean; taxData?: TaxData } = {}
) {
  const promise = calculateUnifiedValuation(companyData, [], {
    version: 'v4',
    includeScenarios: options.includeScenarios,
    taxData: options.taxData,
    includeTaxCalculation: !!options.taxData,
  });
  vi.advanceTimersByTime(2000);
  return promise;
}

describe('Calculation Engine', () => {
  describe('Base Valuation (fixed 5.75x EBITDA)', () => {
    it('calculates finalValuation = EBITDA * 5.75', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }))) as ValuationResult;
      expect(result.finalValuation).toBe(Math.round(200000 * 5.75));
    });

    it('uses 5.5x for range min and 6.0x for range max', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }))) as ValuationResult;
      expect(result.valuationRange.min).toBe(Math.round(200000 * 5.5));
      expect(result.valuationRange.max).toBe(Math.round(200000 * 6.0));
    });

    it('returns ebitdaMultipleUsed = 5.75', async () => {
      const result = (await runCalc(makeCompanyData())) as ValuationResult;
      expect(result.multiples.ebitdaMultipleUsed).toBe(5.75);
    });

    it('handles EBITDA = 0 (defaults to 100000)', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 0 }))) as ValuationResult;
      // Engine uses ebitda || 100000
      expect(result.finalValuation).toBe(Math.round(100000 * 5.75));
    });

    it('handles large EBITDA values', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 5000000 }))) as ValuationResult;
      expect(result.finalValuation).toBe(Math.round(5000000 * 5.75));
    });
  });

  describe('Scenarios', () => {
    it('returns ComprehensiveResult with scenarios when requested', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }), {
        includeScenarios: true,
        taxData: defaultTaxData,
      })) as ComprehensiveResult;

      expect(result.baseResult).toBeDefined();
      expect(result.scenarios).toBeDefined();
      expect(result.scenarios.length).toBe(4); // conservative, base, optimistic, custom
      expect(result.bestScenario).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('conservative scenario uses 0.8x multiplier', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }), {
        includeScenarios: true,
        taxData: defaultTaxData,
      })) as ComprehensiveResult;

      const conservative = result.scenarios.find(s => s.scenario.type === 'conservative');
      expect(conservative).toBeDefined();
      expect(conservative!.valuation).toBe(Math.round(200000 * 5.75 * 0.8));
    });

    it('base scenario uses 1.0x multiplier', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }), {
        includeScenarios: true,
        taxData: defaultTaxData,
      })) as ComprehensiveResult;

      const base = result.scenarios.find(s => s.scenario.type === 'base');
      expect(base!.valuation).toBe(Math.round(200000 * 5.75 * 1.0));
    });

    it('optimistic scenario uses 1.2x multiplier', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }), {
        includeScenarios: true,
        taxData: defaultTaxData,
      })) as ComprehensiveResult;

      const optimistic = result.scenarios.find(s => s.scenario.type === 'optimistic');
      expect(optimistic!.valuation).toBe(Math.round(200000 * 5.75 * 1.2));
    });

    it('bestScenario has highest netReturn', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }), {
        includeScenarios: true,
        taxData: defaultTaxData,
      })) as ComprehensiveResult;

      const maxNet = Math.max(...result.scenarios.map(s => s.netReturn));
      expect(result.bestScenario.netReturn).toBe(maxNet);
    });
  });

  describe('Tax Calculation', () => {
    it('calculates capital gain correctly', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }), {
        includeScenarios: true,
        taxData: { ...defaultTaxData, acquisitionValue: 100000 },
      })) as ComprehensiveResult;

      const base = result.scenarios.find(s => s.scenario.type === 'base');
      expect(base!.taxCalculation).toBeDefined();
      const expectedSalePrice = Math.round(200000 * 5.75);
      expect(base!.taxCalculation!.capitalGain).toBe(expectedSalePrice - 100000);
    });

    it('uses 23% rate for individuals', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }), {
        includeScenarios: true,
        taxData: { ...defaultTaxData, taxpayerType: 'individual' },
      })) as ComprehensiveResult;

      const base = result.scenarios.find(s => s.scenario.type === 'base');
      const taxBreakdown = base!.taxCalculation!.taxBreakdown;
      const baseTaxItem = taxBreakdown.find(t => t.description === 'Impuesto base');
      expect(baseTaxItem!.rate).toBe(23);
    });

    it('uses 25% rate for companies', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }), {
        includeScenarios: true,
        taxData: { ...defaultTaxData, taxpayerType: 'company' },
      })) as ComprehensiveResult;

      const base = result.scenarios.find(s => s.scenario.type === 'base');
      const baseTaxItem = base!.taxCalculation!.taxBreakdown.find(t => t.description === 'Impuesto base');
      expect(baseTaxItem!.rate).toBe(25);
    });

    it('applies reinvestment benefit', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }), {
        includeScenarios: true,
        taxData: { ...defaultTaxData, reinvestmentPlan: true, reinvestmentAmount: 500000 },
      })) as ComprehensiveResult;

      const base = result.scenarios.find(s => s.scenario.type === 'base');
      expect(base!.taxCalculation!.reinvestmentBenefit).toBeGreaterThan(0);
    });

    it('applies vitalicia benefit', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }), {
        includeScenarios: true,
        taxData: { ...defaultTaxData, vitaliciaPlan: true, vitaliciaAmount: 300000 },
      })) as ComprehensiveResult;

      const base = result.scenarios.find(s => s.scenario.type === 'base');
      expect(base!.taxCalculation!.vitaliciaBenefit).toBeGreaterThan(0);
    });

    it('applies age abatement for individuals', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }), {
        includeScenarios: true,
        taxData: { ...defaultTaxData, taxpayerType: 'individual' },
      })) as ComprehensiveResult;

      const base = result.scenarios.find(s => s.scenario.type === 'base');
      expect(base!.taxCalculation!.abatementBenefit).toBeGreaterThan(0);
    });

    it('no abatement for companies', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }), {
        includeScenarios: true,
        taxData: { ...defaultTaxData, taxpayerType: 'company' },
      })) as ComprehensiveResult;

      const base = result.scenarios.find(s => s.scenario.type === 'base');
      expect(base!.taxCalculation!.abatementBenefit).toBe(0);
    });
  });

  describe('Recommendations', () => {
    it('generates at least one recommendation', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }), {
        includeScenarios: true,
        taxData: defaultTaxData,
      })) as ComprehensiveResult;

      expect(result.recommendations.length).toBeGreaterThanOrEqual(1);
    });

    it('recommends reinvestment when not active and acquisition value exists', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }), {
        includeScenarios: true,
        taxData: { ...defaultTaxData, reinvestmentPlan: false, acquisitionValue: 50000 },
      })) as ComprehensiveResult;

      const hasReinvestmentRec = result.recommendations.some(r => r.includes('reinversión'));
      expect(hasReinvestmentRec).toBe(true);
    });
  });

  describe('Without scenarios (simple result)', () => {
    it('returns ValuationResult directly', async () => {
      const result = (await runCalc(makeCompanyData({ ebitda: 200000 }))) as ValuationResult;
      expect(result.finalValuation).toBeDefined();
      expect((result as any).scenarios).toBeUndefined();
    });
  });
});
