
import { useState, useCallback, useEffect } from 'react';
import { validateEmail, validateCompanyName, validateContactName } from '@/utils/validationUtils';
import { supabase } from '@/integrations/supabase/client';

interface CompanyData {
  // Paso 1: Información básica
  contactName: string;
  companyName: string;
  cif: string;
  email: string;
  phone: string;
  industry: string;
  yearsOfOperation: number;
  employeeRange: string;
  
  // Paso 2: Datos financieros
  revenue: number;
  ebitda: number;
  netProfitMargin: number;
  growthRate: number;
  
  // Paso 3: Características
  location: string;
  ownershipParticipation: string;
  competitiveAdvantage: string;
}

interface ValuationResult {
  revenueMultiple: number;
  ebitdaMultiple: number;
  finalValuation: number;
  valuationRange: {
    min: number;
    max: number;
  };
  multiples: {
    ebitdaMultipleUsed: number;
    revenueMultipleUsed: number;
  };
}

interface SectorMultiple {
  sector_name: string;
  employee_range: string;
  ebitda_multiple: number;
  revenue_multiple: number;
  description: string;
}

// Función para validar CIF español
const validateCIF = (cif: string): boolean => {
  if (!cif || cif.length !== 9) return false;
  
  const cifRegex = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/;
  if (!cifRegex.test(cif.toUpperCase())) return false;
  
  const letter = cif.charAt(0).toUpperCase();
  const numbers = cif.substring(1, 8);
  const control = cif.charAt(8).toUpperCase();
  
  // Calcular dígito de control
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    let digit = parseInt(numbers.charAt(i));
    if (i % 2 === 1) { // posiciones pares (índice impar)
      sum += digit;
    } else { // posiciones impares (índice par)
      digit *= 2;
      sum += digit > 9 ? digit - 9 : digit;
    }
  }
  
  const controlNumber = (10 - (sum % 10)) % 10;
  const controlLetter = 'JABCDEFGHI'.charAt(controlNumber);
  
  // Verificar según el tipo de organización
  const numberControl = ['A', 'B', 'E', 'H'].includes(letter);
  const letterControl = ['K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'W'].includes(letter);
  
  if (numberControl) {
    return control === controlNumber.toString();
  } else if (letterControl) {
    return control === controlLetter;
  } else {
    return control === controlNumber.toString() || control === controlLetter;
  }
};

export const useValuationCalculator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showValidation, setShowValidation] = useState(false);
  const [sectorMultiples, setSectorMultiples] = useState<SectorMultiple[]>([]);
  const [companyData, setCompanyData] = useState<CompanyData>({
    // Paso 1
    contactName: '',
    companyName: '',
    cif: '',
    email: '',
    phone: '',
    industry: '',
    yearsOfOperation: 0,
    employeeRange: '',
    
    // Paso 2
    revenue: 0,
    ebitda: 0,
    netProfitMargin: 0,
    growthRate: 0,
    
    // Paso 3
    location: '',
    ownershipParticipation: '',
    competitiveAdvantage: ''
  });

  const [result, setResult] = useState<ValuationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Cargar múltiplos por sector desde Supabase
  useEffect(() => {
    const fetchSectorMultiples = async () => {
      try {
        const { data, error } = await supabase
          .from('sector_multiples')
          .select('*')
          .eq('is_active', true)
          .order('sector_name');
        
        if (error) {
          console.error('Error fetching sector multiples:', error);
          return;
        }
        
        setSectorMultiples(data || []);
      } catch (error) {
        console.error('Error fetching sector multiples:', error);
      }
    };

    fetchSectorMultiples();
  }, []);

  const updateField = useCallback((field: keyof CompanyData, value: string | number) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const nextStep = useCallback(() => {
    const isValid = validateStep(currentStep);
    console.log('Validation result for step', currentStep, ':', isValid);
    if (!isValid) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    setCurrentStep(prev => Math.min(prev + 1, 4));
  }, [currentStep]);

  const prevStep = useCallback(() => {
    setShowValidation(false);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setShowValidation(false);
    setCurrentStep(step);
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    console.log('Validating step', step);
    console.log('Company data:', companyData);
    
    switch (step) {
      case 1:
        const contactNameValidation = validateContactName(companyData.contactName);
        const companyNameValidation = validateCompanyName(companyData.companyName);
        const emailValidation = validateEmail(companyData.email);
        const cifValid = Boolean(companyData.cif) && validateCIF(companyData.cif);
        const phoneValid = Boolean(companyData.phone);
        const industryValid = Boolean(companyData.industry);
        const yearsValid = Boolean(companyData.yearsOfOperation > 0);
        const employeeRangeValid = Boolean(companyData.employeeRange);
        
        console.log('Step 1 validation breakdown:');
        console.log('- contactName:', companyData.contactName, '-> valid:', contactNameValidation.isValid);
        console.log('- companyName:', companyData.companyName, '-> valid:', companyNameValidation.isValid);
        console.log('- cif:', companyData.cif, '-> valid:', cifValid);
        console.log('- email:', companyData.email, '-> valid:', emailValidation.isValid);
        console.log('- phone:', companyData.phone, '-> valid:', phoneValid);
        console.log('- industry:', companyData.industry, '-> valid:', industryValid);
        console.log('- yearsOfOperation:', companyData.yearsOfOperation, '-> valid:', yearsValid);
        console.log('- employeeRange:', companyData.employeeRange, '-> valid:', employeeRangeValid);
        
        return contactNameValidation.isValid && companyNameValidation.isValid && cifValid && emailValidation.isValid && phoneValid && industryValid && yearsValid && employeeRangeValid;
      case 2:
        const revenueValid = Boolean(companyData.revenue > 0);
        const ebitdaValid = Boolean(companyData.ebitda > 0);
        const netProfitMarginValid = Boolean(companyData.netProfitMargin >= 0 && companyData.netProfitMargin <= 100);
        
        console.log('Step 2 validation breakdown:');
        console.log('- revenue:', companyData.revenue, '-> valid:', revenueValid);
        console.log('- ebitda:', companyData.ebitda, '-> valid:', ebitdaValid);
        console.log('- netProfitMargin:', companyData.netProfitMargin, '-> valid:', netProfitMarginValid);
        
        return revenueValid && ebitdaValid && netProfitMarginValid;
      case 3:
        const locationValid = Boolean(companyData.location && companyData.location.trim().length > 0);
        const ownershipValid = Boolean(companyData.ownershipParticipation && companyData.ownershipParticipation.trim().length > 0);
        const competitiveAdvantageValid = Boolean(companyData.competitiveAdvantage && companyData.competitiveAdvantage.trim().length > 0);
        
        console.log('Step 3 validation breakdown:');
        console.log('- location:', companyData.location, '-> valid:', locationValid);
        console.log('- ownershipParticipation:', companyData.ownershipParticipation, '-> valid:', ownershipValid);
        console.log('- competitiveAdvantage:', companyData.competitiveAdvantage, '-> valid:', competitiveAdvantageValid);
        
        const step3Valid = locationValid && ownershipValid && competitiveAdvantageValid;
        console.log('Step 3 overall valid:', step3Valid);
        
        return step3Valid;
      default:
        return true;
    }
  }, [companyData]);

  const calculateValuation = useCallback(async () => {
    setIsCalculating(true);
    
    // Simular tiempo de cálculo
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Buscar múltiplos del sector y rango de empleados seleccionados
    const sectorData = sectorMultiples.find(s => 
      s.sector_name === companyData.industry && 
      s.employee_range === companyData.employeeRange
    );
    
    if (!sectorData) {
      console.error('No se encontraron múltiplos para el sector:', companyData.industry, 'y rango:', companyData.employeeRange);
      setIsCalculating(false);
      return;
    }

    // Calcular valoraciones usando múltiplos específicos de la base de datos
    const revenueValuation = companyData.revenue * sectorData.revenue_multiple;
    const ebitdaValuation = companyData.ebitda * sectorData.ebitda_multiple;

    // Valoración final ponderada (70% EBITDA, 30% Facturación)
    const finalValuation = Math.round(
      (ebitdaValuation * 0.7 + revenueValuation * 0.3)
    );
    
    const valuationResult: ValuationResult = {
      revenueMultiple: Math.round(revenueValuation),
      ebitdaMultiple: Math.round(ebitdaValuation),
      finalValuation,
      valuationRange: {
        min: Math.round(finalValuation * 0.8),
        max: Math.round(finalValuation * 1.2)
      },
      multiples: {
        ebitdaMultipleUsed: sectorData.ebitda_multiple,
        revenueMultipleUsed: sectorData.revenue_multiple
      }
    };

    setResult(valuationResult);
    setIsCalculating(false);
    setCurrentStep(4); // Ir al paso de resultados
  }, [companyData, sectorMultiples]);

  const resetCalculator = useCallback(() => {
    setCompanyData({
      contactName: '',
      companyName: '',
      cif: '',
      email: '',
      phone: '',
      industry: '',
      yearsOfOperation: 0,
      employeeRange: '',
      revenue: 0,
      ebitda: 0,
      netProfitMargin: 0,
      growthRate: 0,
      location: '',
      ownershipParticipation: '',
      competitiveAdvantage: ''
    });
    setResult(null);
    setCurrentStep(1);
    setShowValidation(false);
  }, []);

  return {
    currentStep,
    companyData,
    result,
    isCalculating,
    showValidation,
    sectorMultiples,
    updateField,
    nextStep,
    prevStep,
    goToStep,
    validateStep,
    calculateValuation,
    resetCalculator
  };
};
