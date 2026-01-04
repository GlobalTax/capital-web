import { useState, useCallback, useMemo } from 'react';
import { calculateSpanishTaxImpact, TaxCalculationResult } from '@/utils/taxCalculation';

export type TaxCalculatorStep = 'form' | 'capture' | 'results';

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
  // Art. 21 LIS - Exención participaciones significativas (solo sociedades)
  applyArticle21: boolean;
  participationPercentage: number;
  meetsSubjectToTaxRequirement: boolean;
  meetsEconomicActivityRequirement: boolean;
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
  // Art. 21 LIS - valores por defecto (requisitos marcados por defecto)
  applyArticle21: false,
  participationPercentage: 100,
  meetsSubjectToTaxRequirement: true,
  meetsEconomicActivityRequirement: true,
};

export const useTaxCalculator = () => {
  const [formData, setFormData] = useState<TaxFormData>(initialFormData);
  const [step, setStep] = useState<TaxCalculatorStep>('form');

  const updateField = useCallback(<K extends keyof TaxFormData>(
    field: K,
    value: TaxFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setStep('form');
  }, []);

  const isFormValid = useMemo(() => {
    return (
      formData.salePrice > 0 &&
      formData.acquisitionValue >= 0 &&
      formData.salePercentage > 0 &&
      formData.salePercentage <= 100
    );
  }, [formData]);

  // Verificar elegibilidad Art. 21 LIS
  const article21Eligibility = useMemo(() => {
    if (formData.taxpayerType !== 'company' || !formData.applyArticle21) {
      return { eligible: false, reason: '' };
    }

    const yearsHeld = formData.acquisitionDate
      ? Math.floor((Date.now() - new Date(formData.acquisitionDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 0;

    const meetsParticipation = formData.participationPercentage >= 5 || formData.acquisitionValue >= 20000000;
    const meetsHolding = yearsHeld >= 1;

    if (!meetsParticipation) return { eligible: false, reason: 'Participación < 5% y valor < 20M€' };
    if (!meetsHolding) return { eligible: false, reason: 'Tenencia < 1 año' };
    if (!formData.meetsSubjectToTaxRequirement) return { eligible: false, reason: 'Filial no tributa ≥10%' };
    if (!formData.meetsEconomicActivityRequirement) return { eligible: false, reason: 'Filial sin actividad económica' };

    return { eligible: true, reason: '' };
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
        applyArticle21: formData.applyArticle21,
        participationPercentage: formData.participationPercentage,
        meetsSubjectToTaxRequirement: formData.meetsSubjectToTaxRequirement,
        meetsEconomicActivityRequirement: formData.meetsEconomicActivityRequirement,
      },
      formData.salePrice
    );
  }, [formData, isFormValid]);

  const calculateTax = useCallback(() => {
    if (isFormValid) {
      setStep('capture');
    }
  }, [isFormValid]);

  const onLeadCaptured = useCallback(() => {
    setStep('results');
  }, []);

  const goBackToForm = useCallback(() => {
    setStep('form');
  }, []);

  return {
    formData,
    updateField,
    resetForm,
    isFormValid,
    taxResult,
    step,
    setStep,
    calculateTax,
    onLeadCaptured,
    goBackToForm,
    article21Eligibility,
  };
};
