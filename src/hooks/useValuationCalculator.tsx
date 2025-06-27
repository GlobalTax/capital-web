
import { useState, useCallback, useEffect, useMemo } from 'react';
import { validateEmail, validateCompanyName, validateContactName, validateSpanishPhone } from '@/utils/validationUtils';
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
  ebitdaMultiple: number;
  finalValuation: number;
  valuationRange: {
    min: number;
    max: number;
  };
  multiples: {
    ebitdaMultipleUsed: number;
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

  // Memoizar la validación de datos para evitar recálculos innecesarios
  const validationState = useMemo(() => {
    return {
      contactName: validateContactName(companyData.contactName),
      companyName: validateCompanyName(companyData.companyName),
      email: validateEmail(companyData.email),
      phone: validateSpanishPhone(companyData.phone),
      cif: companyData.cif ? { isValid: validateCIF(companyData.cif), message: validateCIF(companyData.cif) ? undefined : 'El CIF no es válido' } : { isValid: true },
      industry: { isValid: Boolean(companyData.industry), message: companyData.industry ? undefined : 'El sector es obligatorio' },
      employeeRange: { isValid: Boolean(companyData.employeeRange), message: companyData.employeeRange ? undefined : 'El rango de empleados es obligatorio' },
      revenue: { isValid: companyData.revenue > 0, message: companyData.revenue > 0 ? undefined : 'Los ingresos deben ser mayores a 0' },
      ebitda: { isValid: companyData.ebitda > 0, message: companyData.ebitda > 0 ? undefined : 'El EBITDA debe ser mayor a 0' },
      location: { isValid: Boolean(companyData.location), message: companyData.location ? undefined : 'La ubicación es obligatoria' },
      ownershipParticipation: { isValid: Boolean(companyData.ownershipParticipation), message: companyData.ownershipParticipation ? undefined : 'El porcentaje de participación es obligatorio' },
      competitiveAdvantage: { isValid: Boolean(companyData.competitiveAdvantage), message: companyData.competitiveAdvantage ? undefined : 'La ventaja competitiva es obligatoria' }
    };
  }, [companyData]);

  // Memoizar si el paso actual es válido
  const isCurrentStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return validationState.contactName.isValid && 
               validationState.companyName.isValid && 
               validationState.email.isValid &&
               validationState.phone.isValid &&
               validationState.industry.isValid &&
               validationState.employeeRange.isValid;
      case 2:
        return validationState.revenue.isValid && 
               validationState.ebitda.isValid;
      case 3:
        return validationState.location.isValid && 
               validationState.ownershipParticipation.isValid && 
               validationState.competitiveAdvantage.isValid;
      default:
        return true;
    }
  }, [currentStep, validationState]);

  const updateField = useCallback((field: keyof CompanyData, value: string | number) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const nextStep = useCallback(() => {
    console.log('nextStep called, currentStep:', currentStep);
    
    // Validar el paso actual antes de avanzar
    if (!isCurrentStepValid) {
      setShowValidation(true);
      return;
    }
    
    setShowValidation(false);
    setCurrentStep(prev => {
      const newStep = Math.min(prev + 1, 4);
      console.log('Moving from step', prev, 'to step', newStep);
      return newStep;
    });
  }, [currentStep, isCurrentStepValid]);

  const prevStep = useCallback(() => {
    console.log('prevStep called');
    setShowValidation(false);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    console.log('goToStep called with step:', step);
    setShowValidation(false);
    setCurrentStep(step);
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return validationState.contactName.isValid && 
               validationState.companyName.isValid && 
               validationState.email.isValid &&
               validationState.phone.isValid &&
               validationState.industry.isValid &&
               validationState.employeeRange.isValid;
      case 2:
        return validationState.revenue.isValid && 
               validationState.ebitda.isValid;
      case 3:
        return validationState.location.isValid && 
               validationState.ownershipParticipation.isValid && 
               validationState.competitiveAdvantage.isValid;
      default:
        return true;
    }
  }, [validationState]);

  const calculateValuation = useCallback(async () => {
    console.log('calculateValuation called');
    setIsCalculating(true);
    
    // Simular tiempo de cálculo
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Usar valores por defecto si no hay datos suficientes
    const industryToUse = companyData.industry || 'servicios';
    const employeeRangeToUse = companyData.employeeRange || '2-5';
    const ebitdaToUse = companyData.ebitda || 100000; // EBITDA por defecto de 100k

    // Buscar múltiplos del sector y rango de empleados seleccionados
    let sectorData = sectorMultiples.find(s => 
      s.sector_name === industryToUse && 
      s.employee_range === employeeRangeToUse
    );
    
    // Si no se encuentra, usar un múltiplo por defecto
    if (!sectorData) {
      console.log('No se encontraron múltiplos específicos, usando valores por defecto');
      sectorData = {
        sector_name: industryToUse,
        employee_range: employeeRangeToUse,
        ebitda_multiple: 3.5, // Múltiplo por defecto
        revenue_multiple: 1.0,
        description: 'Valores estimados'
      };
    }

    // Calcular valoración usando solo múltiplo EBITDA
    const ebitdaValuation = ebitdaToUse * sectorData.ebitda_multiple;

    // Valoración final basada únicamente en EBITDA
    const finalValuation = Math.round(ebitdaValuation);
    
    const valuationResult: ValuationResult = {
      ebitdaMultiple: Math.round(ebitdaValuation),
      finalValuation,
      valuationRange: {
        min: Math.round(finalValuation * 0.8),
        max: Math.round(finalValuation * 1.2)
      },
      multiples: {
        ebitdaMultipleUsed: sectorData.ebitda_multiple
      }
    };

    setResult(valuationResult);
    setIsCalculating(false);
    setCurrentStep(4); // Ir al paso de resultados
    console.log('Valuation calculated, moved to step 4');
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
    validationState,
    isCurrentStepValid,
    updateField,
    nextStep,
    prevStep,
    goToStep,
    validateStep,
    calculateValuation,
    resetCalculator
  };
};
