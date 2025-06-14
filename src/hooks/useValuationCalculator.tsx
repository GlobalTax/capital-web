
import { useState, useCallback } from 'react';

interface CompanyData {
  companyName: string;
  industry: string;
  revenue: number;
  ebitda: number;
  employees: number;
  yearFounded: number;
  location: string;
  growthRate: number;
  marketShare: number;
  competitiveAdvantage: string;
}

interface ValuationResult {
  revenueMultiple: number;
  ebitdaMultiple: number;
  dcfValue: number;
  assetValue: number;
  finalValuation: number;
  valuationRange: {
    min: number;
    max: number;
  };
  multiples: {
    industry: number;
    size: number;
    growth: number;
    profitability: number;
  };
}

const industryMultiples: Record<string, number> = {
  'technology': 6.5,
  'healthcare': 4.2,
  'manufacturing': 2.8,
  'retail': 1.8,
  'services': 3.2,
  'finance': 3.8,
  'real-estate': 2.4,
  'energy': 3.5,
  'other': 3.0
};

export const useValuationCalculator = () => {
  const [companyData, setCompanyData] = useState<CompanyData>({
    companyName: '',
    industry: '',
    revenue: 0,
    ebitda: 0,
    employees: 0,
    yearFounded: new Date().getFullYear(),
    location: '',
    growthRate: 0,
    marketShare: 0,
    competitiveAdvantage: ''
  });

  const [result, setResult] = useState<ValuationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const updateField = useCallback((field: keyof CompanyData, value: string | number) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const calculateValuation = useCallback(async () => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const baseMultiple = industryMultiples[companyData.industry] || 3.0;
    
    // Adjustments based on company characteristics
    const sizeAdjustment = companyData.revenue > 10000000 ? 1.2 : 
                          companyData.revenue > 5000000 ? 1.1 : 
                          companyData.revenue > 1000000 ? 1.0 : 0.8;
    
    const growthAdjustment = companyData.growthRate > 20 ? 1.3 :
                            companyData.growthRate > 10 ? 1.2 :
                            companyData.growthRate > 5 ? 1.1 : 1.0;
    
    const profitabilityAdjustment = (companyData.ebitda / companyData.revenue) > 0.2 ? 1.2 :
                                   (companyData.ebitda / companyData.revenue) > 0.1 ? 1.1 : 1.0;

    const adjustedMultiple = baseMultiple * sizeAdjustment * growthAdjustment * profitabilityAdjustment;

    const revenueMultiple = companyData.revenue * (adjustedMultiple * 0.8);
    const ebitdaMultiple = companyData.ebitda * adjustedMultiple * 4;
    const dcfValue = companyData.ebitda * 8 * (1 + companyData.growthRate / 100);
    const assetValue = companyData.revenue * 0.6;

    const finalValuation = Math.round((revenueMultiple + ebitdaMultiple + dcfValue) / 3);
    
    const valuationResult: ValuationResult = {
      revenueMultiple: Math.round(revenueMultiple),
      ebitdaMultiple: Math.round(ebitdaMultiple),
      dcfValue: Math.round(dcfValue),
      assetValue: Math.round(assetValue),
      finalValuation,
      valuationRange: {
        min: Math.round(finalValuation * 0.8),
        max: Math.round(finalValuation * 1.2)
      },
      multiples: {
        industry: baseMultiple,
        size: sizeAdjustment,
        growth: growthAdjustment,
        profitability: profitabilityAdjustment
      }
    };

    setResult(valuationResult);
    setIsCalculating(false);
  }, [companyData]);

  const resetCalculator = useCallback(() => {
    setCompanyData({
      companyName: '',
      industry: '',
      revenue: 0,
      ebitda: 0,
      employees: 0,
      yearFounded: new Date().getFullYear(),
      location: '',
      growthRate: 0,
      marketShare: 0,
      competitiveAdvantage: ''
    });
    setResult(null);
  }, []);

  return {
    companyData,
    result,
    isCalculating,
    updateField,
    calculateValuation,
    resetCalculator
  };
};
