import { useState, useCallback, useMemo } from 'react';
import { calculateSpanishTaxImpact, TaxCalculationResult } from '@/utils/taxCalculation';

export interface TaxFormData {
  salePrice: number;
  taxpayerType: 'individual' | 'company';
  acquisitionValue: number;
  acquisitionDate: string;
  salePercentage: number;
  currentTaxBase: number;
  reinvestmentPlan: boolean;
  reinvestmentAmount: number;
  vitaliciaPlan: boolean;
  vitaliciaAmount: number;
}

const initialFormData: TaxFormData = {
  salePrice: 0,
  taxpayerType: 'individual',
  acquisitionValue: 0,
  acquisitionDate: '',
  salePercentage: 100,
  currentTaxBase: 0,
  reinvestmentPlan: false,
  reinvestmentAmount: 0,
  vitaliciaPlan: false,
  vitaliciaAmount: 0,
};

export const useTaxCalculator = () => {
  const [formData, setFormData] = useState<TaxFormData>(initialFormData);
  const [showResults, setShowResults] = useState(false);

  const updateField = useCallback(<K extends keyof TaxFormData>(
    field: K,
    value: TaxFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setShowResults(false);
  }, []);

  const isFormValid = useMemo(() => {
    return (
      formData.salePrice > 0 &&
      formData.acquisitionValue >= 0 &&
      formData.salePercentage > 0 &&
      formData.salePercentage <= 100
    );
  }, [formData]);

  const taxResult: TaxCalculationResult | null = useMemo(() => {
    if (!isFormValid || formData.salePrice <= 0) return null;

    const yearsHeld = formData.acquisitionDate
      ? Math.floor((Date.now() - new Date(formData.acquisitionDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 0;

    return calculateSpanishTaxImpact(
      {
        taxpayerType: formData.taxpayerType,
        acquisitionValue: formData.acquisitionValue,
        acquisitionDate: formData.acquisitionDate,
        yearsHeld,
        salePercentage: formData.salePercentage,
        currentTaxBase: formData.currentTaxBase,
        reinvestmentPlan: formData.reinvestmentPlan,
        reinvestmentAmount: formData.reinvestmentAmount,
        vitaliciaPlan: formData.vitaliciaPlan,
        vitaliciaAmount: formData.vitaliciaAmount,
      },
      formData.salePrice
    );
  }, [formData, isFormValid]);

  const calculateTax = useCallback(() => {
    if (isFormValid) {
      setShowResults(true);
    }
  }, [isFormValid]);

  return {
    formData,
    updateField,
    resetForm,
    isFormValid,
    taxResult,
    showResults,
    setShowResults,
    calculateTax,
  };
};
