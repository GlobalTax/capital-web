import { useState, useCallback, useMemo } from 'react';
import { CompanyDataV3, ScenarioConfig, ScenarioResult, TaxScenarioData, ScenarioComparison } from '@/types/valuationV3';
import { defaultScenarios, calculateScenarioResults, generateRecommendations } from '@/utils/valuationCalculationV3';

const initialTaxData: TaxScenarioData = {
  acquisitionValue: 0,
  acquisitionDate: '2020-01-01',
  taxpayerType: 'individual',
  salePercentage: 100,
  reinvestmentPlan: false,
  reinvestmentAmount: 0,
  vitaliciaPlan: false,
  vitaliciaAmount: 0
};

export const useValuationCalculatorV3 = (initialCompanyData: CompanyDataV3) => {
  const [companyData] = useState<CompanyDataV3>(initialCompanyData);
  const [taxData, setTaxData] = useState<TaxScenarioData>(initialTaxData);
  const [scenarios, setScenarios] = useState<ScenarioConfig[]>(defaultScenarios);
  const [customValue, setCustomValue] = useState<number>(initialCompanyData.baseValuation);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calcular resultados automáticamente cuando cambian los datos
  const scenarioResults = useMemo(() => {
    if (!companyData || !taxData) return [];
    
    try {
      return calculateScenarioResults(companyData, scenarios, taxData, customValue);
    } catch (error) {
      console.error('Error calculating scenarios:', error);
      return [];
    }
  }, [companyData, scenarios, taxData, customValue]);

  // Generar comparación y recomendaciones
  const comparison: ScenarioComparison = useMemo(() => {
    if (scenarioResults.length === 0) {
      return {
        scenarios: [],
        bestScenario: {} as ScenarioResult,
        recommendations: []
      };
    }

    const bestScenario = scenarioResults.reduce((best, current) => 
      current.netReturn > best.netReturn ? current : best
    );

    return {
      scenarios: scenarioResults,
      bestScenario,
      recommendations: generateRecommendations(scenarioResults)
    };
  }, [scenarioResults]);

  // Actualizar datos fiscales
  const updateTaxData = useCallback((field: keyof TaxScenarioData, value: any) => {
    setTaxData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Actualizar valor personalizado
  const updateCustomValue = useCallback((value: number) => {
    setCustomValue(value);
  }, []);

  // Actualizar multiplier de un escenario específico
  const updateScenarioMultiplier = useCallback((scenarioId: string, multiplier: number) => {
    setScenarios(prev => prev.map(scenario => 
      scenario.id === scenarioId 
        ? { ...scenario, multiplier }
        : scenario
    ));
  }, []);

  // Simular cálculo con loading
  const recalculateScenarios = useCallback(async () => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsCalculating(false);
  }, []);

  // Obtener datos de un escenario específico
  const getScenarioData = useCallback((scenarioId: string): ScenarioResult | undefined => {
    return scenarioResults.find(result => result.scenario.id === scenarioId);
  }, [scenarioResults]);

  return {
    companyData,
    taxData,
    scenarios,
    customValue,
    scenarioResults,
    comparison,
    isCalculating,
    updateTaxData,
    updateCustomValue,
    updateScenarioMultiplier,
    recalculateScenarios,
    getScenarioData
  };
};