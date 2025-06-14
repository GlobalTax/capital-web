
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
  'technology': 5.2,
  'healthcare': 3.8,
  'manufacturing': 2.1,
  'retail': 1.4,
  'services': 2.8,
  'finance': 3.2,
  'real-estate': 2.0,
  'energy': 2.9,
  'other': 2.5
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
    
    // Simular tiempo de cálculo
    await new Promise(resolve => setTimeout(resolve, 2000));

    const baseMultiple = industryMultiples[companyData.industry] || 2.5;
    
    // Ajuste por tamaño
    const sizeAdjustment = companyData.revenue > 50000000 ? 1.4 : 
                          companyData.revenue > 10000000 ? 1.2 : 
                          companyData.revenue > 5000000 ? 1.1 : 
                          companyData.revenue > 1000000 ? 1.0 : 0.8;
    
    // Ajuste por crecimiento
    const growthAdjustment = companyData.growthRate > 25 ? 1.3 :
                            companyData.growthRate > 15 ? 1.2 :
                            companyData.growthRate > 10 ? 1.15 :
                            companyData.growthRate > 5 ? 1.1 : 1.0;
    
    // Ajuste por rentabilidad
    const profitMargin = companyData.ebitda / companyData.revenue;
    const profitabilityAdjustment = profitMargin > 0.25 ? 1.25 :
                                   profitMargin > 0.15 ? 1.15 :
                                   profitMargin > 0.10 ? 1.1 : 
                                   profitMargin > 0.05 ? 1.0 : 0.9;

    const adjustedMultiple = baseMultiple * sizeAdjustment * growthAdjustment * profitabilityAdjustment;

    // Diferentes métodos de valoración
    const revenueMultiple = companyData.revenue * adjustedMultiple;
    const ebitdaMultiple = companyData.ebitda * (adjustedMultiple * 3.5);
    const dcfValue = companyData.ebitda * 7 * (1 + companyData.growthRate / 100);
    const assetValue = companyData.revenue * 0.5;

    // Valoración final ponderada
    const finalValuation = Math.round(
      (revenueMultiple * 0.3 + ebitdaMultiple * 0.4 + dcfValue * 0.3)
    );
    
    const valuationResult: ValuationResult = {
      revenueMultiple: Math.round(revenueMultiple),
      ebitdaMultiple: Math.round(ebitdaMultiple),
      dcfValue: Math.round(dcfValue),
      assetValue: Math.round(assetValue),
      finalValuation,
      valuationRange: {
        min: Math.round(finalValuation * 0.75),
        max: Math.round(finalValuation * 1.25)
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
