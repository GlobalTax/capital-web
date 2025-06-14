import { useState, useCallback } from 'react';

interface CompanyData {
  // Paso 1: Información básica
  contactName: string;
  companyName: string;
  cif: string;
  email: string;
  industry: string;
  yearsOfOperation: number;
  employeeRange: string;
  
  // Paso 2: Datos financieros
  revenue: number;
  ebitda: number;
  growthRate: number;
  
  // Paso 3: Características
  location: string;
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
  'tecnologia': 5.2,
  'salud': 3.8,
  'manufactura': 2.1,
  'retail': 1.4,
  'servicios': 2.8,
  'finanzas': 3.2,
  'inmobiliario': 2.0,
  'energia': 2.9,
  'consultoria': 3.5,
  'educacion': 2.3,
  'turismo': 1.8,
  'agricultura': 1.6,
  'otro': 2.5
};

export const useValuationCalculator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyData, setCompanyData] = useState<CompanyData>({
    // Paso 1
    contactName: '',
    companyName: '',
    cif: '',
    email: '',
    industry: '',
    yearsOfOperation: 0,
    employeeRange: '',
    
    // Paso 2
    revenue: 0,
    ebitda: 0,
    growthRate: 0,
    
    // Paso 3
    location: '',
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

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(
          companyData.contactName && 
          companyData.companyName && 
          companyData.cif && 
          companyData.email && 
          companyData.industry && 
          companyData.yearsOfOperation > 0 && 
          companyData.employeeRange
        );
      case 2:
        return Boolean(companyData.revenue > 0 && companyData.ebitda > 0);
      case 3:
        return Boolean(companyData.location && companyData.competitiveAdvantage);
      default:
        return true;
    }
  }, [companyData]);

  const calculateValuation = useCallback(async () => {
    setIsCalculating(true);
    
    // Simular tiempo de cálculo
    await new Promise(resolve => setTimeout(resolve, 2000));

    const baseMultiple = industryMultiples[companyData.industry] || 2.5;
    
    // Ajuste por tamaño basado en empleados
    const getEmployeeSizeAdjustment = (range: string) => {
      switch (range) {
        case '1-10': return 0.8;
        case '11-50': return 1.0;
        case '51-200': return 1.2;
        case '201-500': return 1.4;
        case '500+': return 1.6;
        default: return 1.0;
      }
    };
    
    const sizeAdjustment = getEmployeeSizeAdjustment(companyData.employeeRange);
    
    // Ajuste por años de operación
    const experienceAdjustment = companyData.yearsOfOperation > 10 ? 1.2 :
                                companyData.yearsOfOperation > 5 ? 1.1 :
                                companyData.yearsOfOperation > 2 ? 1.0 : 0.9;
    
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

    const adjustedMultiple = baseMultiple * sizeAdjustment * experienceAdjustment * growthAdjustment * profitabilityAdjustment;

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
    setCurrentStep(4); // Ir al paso de resultados
  }, [companyData]);

  const resetCalculator = useCallback(() => {
    setCompanyData({
      contactName: '',
      companyName: '',
      cif: '',
      email: '',
      industry: '',
      yearsOfOperation: 0,
      employeeRange: '',
      revenue: 0,
      ebitda: 0,
      growthRate: 0,
      location: '',
      marketShare: 0,
      competitiveAdvantage: ''
    });
    setResult(null);
    setCurrentStep(1);
  }, []);

  return {
    currentStep,
    companyData,
    result,
    isCalculating,
    updateField,
    nextStep,
    prevStep,
    goToStep,
    validateStep,
    calculateValuation,
    resetCalculator
  };
};
