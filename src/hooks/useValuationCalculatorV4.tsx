import { useState, useCallback, useMemo } from 'react';
import { CompanyDataV4, TaxDataV4, ScenarioResultV4, DistributionData } from '@/types/valuationV4';
import { calculateSpanishTaxImpact } from '@/utils/taxCalculation';

const initialTaxData: TaxDataV4 = {
  acquisitionValue: 0,
  acquisitionDate: '2020-01-01',
  taxpayerType: 'individual',
  salePercentage: 100,
  reinvestmentPlan: false,
  reinvestmentAmount: 0,
  vitaliciaPlan: false,
  vitaliciaAmount: 0
};

export const useValuationCalculatorV4 = (initialCompanyData: CompanyDataV4) => {
  const [companyData] = useState<CompanyDataV4>(initialCompanyData);
  const [taxData, setTaxData] = useState<TaxDataV4>(initialTaxData);
  const [customMultiplier, setCustomMultiplier] = useState<number>(1.0);
  const [acquisitionValue, setAcquisitionValue] = useState<number>(0);

  // Escenarios predefinidos
  const scenarios = useMemo(() => [
    {
      id: 'conservative',
      name: 'Conservador',
      multiplier: 0.85,
      color: '#ef4444'
    },
    {
      id: 'base',
      name: 'Base',
      multiplier: 1.0,
      color: '#3b82f6'
    },
    {
      id: 'optimistic',
      name: 'Optimista',
      multiplier: 1.15,
      color: '#10b981'
    },
    {
      id: 'custom',
      name: 'Personalizado',
      multiplier: customMultiplier,
      color: '#8b5cf6'
    }
  ], [customMultiplier]);

  // Calcular resultados en tiempo real
  const scenarioResults = useMemo((): ScenarioResultV4[] => {
    return scenarios.map(scenario => {
      const valuation = Math.round(companyData.baseValuation * scenario.multiplier);
      
      const taxCalculation = calculateSpanishTaxImpact(
        {
          ...taxData,
          acquisitionValue,
          yearsHeld: 0,
          reinvestmentQualifies: taxData.reinvestmentPlan
        },
        valuation
      );

      const initialInvestment = acquisitionValue || 1;
      const roi = ((taxCalculation.netAfterTax - initialInvestment) / initialInvestment) * 100;

      return {
        id: scenario.id,
        name: scenario.name,
        multiplier: scenario.multiplier,
        valuation,
        totalTax: taxCalculation.totalTax,
        netReturn: taxCalculation.netAfterTax,
        roi: Math.round(roi * 100) / 100,
        effectiveTaxRate: taxCalculation.effectiveTaxRate,
        color: scenario.color
      };
    });
  }, [scenarios, companyData.baseValuation, taxData, acquisitionValue]);

  // Mejor escenario
  const bestScenario = useMemo(() => {
    return scenarioResults.reduce((best, current) => 
      current.netReturn > best.netReturn ? current : best
    );
  }, [scenarioResults]);

  // Datos para gráfico de distribución fiscal
  const distributionData = useMemo((): DistributionData[] => {
    const bestResult = bestScenario;
    if (!bestResult) return [];

    return [
      {
        name: 'Neto',
        value: bestResult.netReturn,
        color: '#10b981'
      },
      {
        name: 'Impuestos',
        value: bestResult.totalTax,
        color: '#ef4444'
      }
    ];
  }, [bestScenario]);

  // Actualizar valor de adquisición
  const updateAcquisitionValue = useCallback((value: number) => {
    setAcquisitionValue(value);
    setTaxData(prev => ({ ...prev, acquisitionValue: value }));
  }, []);

  // Actualizar multiplier personalizado
  const updateCustomMultiplier = useCallback((value: number) => {
    setCustomMultiplier(value);
  }, []);

  // Actualizar tipo de contribuyente
  const updateTaxpayerType = useCallback((type: 'individual' | 'company') => {
    setTaxData(prev => ({ ...prev, taxpayerType: type }));
  }, []);

  // Actualizar porcentaje de venta
  const updateSalePercentage = useCallback((percentage: number) => {
    setTaxData(prev => ({ ...prev, salePercentage: percentage }));
  }, []);

  // Toggle reinversión
  const toggleReinvestment = useCallback((enabled: boolean) => {
    setTaxData(prev => ({ 
      ...prev, 
      reinvestmentPlan: enabled,
      reinvestmentAmount: enabled ? prev.reinvestmentAmount : 0
    }));
  }, []);

  // Toggle renta vitalicia
  const toggleVitalicia = useCallback((enabled: boolean) => {
    setTaxData(prev => ({ 
      ...prev, 
      vitaliciaPlan: enabled,
      vitaliciaAmount: enabled ? prev.vitaliciaAmount : 0
    }));
  }, []);

  return {
    companyData,
    taxData,
    scenarioResults,
    bestScenario,
    distributionData,
    acquisitionValue,
    customMultiplier,
    updateAcquisitionValue,
    updateCustomMultiplier,
    updateTaxpayerType,
    updateSalePercentage,
    toggleReinvestment,
    toggleVitalicia
  };
};