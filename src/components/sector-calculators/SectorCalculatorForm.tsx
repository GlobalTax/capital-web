import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Calculator, FileText, Download } from 'lucide-react';
import { SectorCalculator, useSubmitCalculatorResult } from '@/hooks/useSectorCalculators';
import { useSectorReportGenerator } from '@/hooks/useSectorReportGenerator';
import { SectorReportRequest } from '@/types/sectorReports';

interface SectorCalculatorFormProps {
  calculator: SectorCalculator;
  onBack: () => void;
}

interface FormData {
  [key: string]: any;
  company_name: string;
  contact_email: string;
  accept_lead_capture: boolean;
}

export const SectorCalculatorForm: React.FC<SectorCalculatorFormProps> = ({
  calculator,
  onBack,
}) => {
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    contact_email: '',
    accept_lead_capture: false,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const submitResult = useSubmitCalculatorResult();
  const { generateSectorReport, isGenerating } = useSectorReportGenerator();
  
  const fieldsConfig = calculator.fields_config || [];
  const totalSteps = Math.ceil(fieldsConfig.length / 3) + 2; // Fields + Basic Info + Results
  
  useEffect(() => {
    // Initialize form data with field defaults
    const initialData: FormData = {
      company_name: '',
      contact_email: '',
      accept_lead_capture: false,
    };
    
    fieldsConfig.forEach((field: any) => {
      if (field.type === 'multiselect') {
        initialData[field.name] = [];
      } else {
        initialData[field.name] = field.type === 'number' ? 0 : '';
      }
    });
    
    setFormData(initialData);
  }, [fieldsConfig]);

  const getCurrentStepFields = () => {
    if (currentStep === 1) {
      return [
        { name: 'company_name', label: 'Nombre de la Empresa', type: 'text', required: true },
        { name: 'contact_email', label: 'Email de Contacto', type: 'email', required: true },
      ];
    }
    
    if (currentStep === totalSteps) {
      return []; // Results step
    }
    
    const fieldsPerStep = 3;
    const startIndex = (currentStep - 2) * fieldsPerStep;
    const endIndex = startIndex + fieldsPerStep;
    
    return fieldsConfig.slice(startIndex, endIndex);
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleMultiSelectChange = (fieldName: string, option: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: checked 
        ? [...(prev[fieldName] || []), option]
        : (prev[fieldName] || []).filter((item: string) => item !== option)
    }));
  };

  const isStepValid = () => {
    const currentFields = getCurrentStepFields();
    return currentFields.every((field: any) => {
      if (!field.required) return true;
      const value = formData[field.name];
      if (field.type === 'multiselect') {
        return Array.isArray(value) && value.length > 0;
      }
      return value !== '' && value !== 0 && value !== null && value !== undefined;
    });
  };

  const calculateValuation = () => {
    setIsCalculating(true);
    
    // Simulate calculation based on calculator configuration
    setTimeout(() => {
      const baseMultiplier = calculator.results_config?.base_multiplier || 5;
      const adjustments = calculator.results_config?.adjustments || {};
      
      // Calculate base valuation from financial fields
      let baseValue = 0;
      const financialFields = fieldsConfig.filter((f: any) => f.category === 'financials');
      
      financialFields.forEach((field: any) => {
        const value = Number(formData[field.name]) || 0;
        if (field.name.includes('revenue') || field.name.includes('arr')) {
          baseValue = Math.max(baseValue, value);
        }
      });
      
      let finalMultiplier = baseMultiplier;
      
      // Apply adjustments based on form data
      Object.entries(adjustments).forEach(([key, multiplier]) => {
        if (shouldApplyAdjustment(key, formData)) {
          finalMultiplier *= Number(multiplier);
        }
      });
      
      const valuation = Math.round(baseValue * finalMultiplier);
      const range = {
        min: Math.round(valuation * 0.8),
        max: Math.round(valuation * 1.2),
      };
      
      const result = {
        valuation,
        range,
        multiplier: finalMultiplier,
        baseValue,
        insights: generateInsights(formData, calculator),
      };
      
      setCalculationResult(result);
      setCurrentStep(totalSteps);
      setIsCalculating(false);
    }, 2000);
  };

  const shouldApplyAdjustment = (adjustmentKey: string, data: FormData): boolean => {
    switch (adjustmentKey) {
      case 'high_growth':
        return Number(data.growth_rate) > 30;
      case 'low_churn':
        return Number(data.churn_rate) < 5;
      case 'good_ltv_cac':
        return Number(data.lifetime_value) / Number(data.customer_acquisition_cost) > 3;
      case 'certified':
        return Array.isArray(data.regulatory_certifications) && data.regulatory_certifications.length > 0;
      case 'high_patient_volume':
        return Number(data.patient_volume) > 1000;
      case 'telemedicine':
        return data.service_type === 'Telemedicina';
      case 'high_margin':
        return Number(data.gross_margin) > 40;
      case 'omnichannel':
        return Array.isArray(data.channel_mix) && data.channel_mix.length > 2;
      case 'high_turnover':
        return Number(data.inventory_turnover) > 6;
      default:
        return false;
    }
  };

  const generateInsights = (data: FormData, calc: SectorCalculator): string[] => {
    const insights = [];
    
    if (calc.sector === 'Tecnología') {
      if (Number(data.churn_rate) < 5) {
        insights.push('Excelente retención de clientes con churn muy bajo');
      }
      if (Number(data.growth_rate) > 50) {
        insights.push('Crecimiento excepcional que justifica múltiplos superiores');
      }
    }
    
    if (calc.sector === 'Salud') {
      if (Array.isArray(data.regulatory_certifications) && data.regulatory_certifications?.length > 2) {
        insights.push('Sólido marco regulatorio que reduce riesgos');
      }
    }
    
    if (calc.sector === 'Retail') {
      if (Number(data.gross_margin) > 50) {
        insights.push('Márgenes excepcionales que indican ventaja competitiva');
      }
    }
    
    return insights;
  };

  const handleSubmitAndGenerateReport = async () => {
    if (!calculationResult || !formData.accept_lead_capture) return;
    
    // Submit calculator result
    const resultData = {
      calculator_id: calculator.id,
      input_data: formData,
      calculation_results: calculationResult,
      valuation_amount: calculationResult.valuation,
      sector: calculator.sector,
      company_name: formData.company_name,
      contact_email: formData.contact_email,
      lead_captured: formData.accept_lead_capture,
      report_generated: true,
    };
    
    try {
      await submitResult.mutateAsync(resultData);
      
      // Generate AI report
      const reportRequest: SectorReportRequest = {
        sector: calculator.sector,
        reportType: 'market-analysis',
        period: 'year',
        depth: 'intermediate',
        includeData: {
          multiples: true,
          caseStudies: true,
          statistics: true,
        },
        targetAudience: 'entrepreneurs',
        customFocus: `Valoración específica para empresa ${formData.company_name} del sector ${calculator.sector}`,
      };
      
      await generateSectorReport(reportRequest);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.name];
    
    switch (field.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Introduce ${field.label.toLowerCase()}`}
            min={0}
            max={field.max}
          />
        );
        
      case 'select':
        return (
          <Select value={value} onValueChange={(v) => handleFieldChange(field.name, v)}>
            <SelectTrigger>
              <SelectValue placeholder={`Selecciona ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.name}-${option}`}
                  checked={Array.isArray(value) && value.includes(option)}
                  onCheckedChange={(checked) => 
                    handleMultiSelectChange(field.name, option, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`${field.name}-${option}`}
                  className="text-sm font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
        
      case 'email':
        return (
          <Input
            type="email"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Introduce ${field.label.toLowerCase()}`}
          />
        );
        
      default:
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Introduce ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  if (isCalculating) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Calculator className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
          <h3 className="text-lg font-semibold mb-2">Calculando valoración...</h3>
          <p className="text-muted-foreground mb-4">
            Analizando los datos con métricas específicas del sector {calculator.sector}
          </p>
          <Progress value={66} className="w-full" />
        </CardContent>
      </Card>
    );
  }

  if (currentStep === totalSteps && calculationResult) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-2xl">Resultados de Valoración</CardTitle>
              <CardDescription>
                {calculator.name} - {formData.company_name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Valoración Estimada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">
                  {calculationResult.valuation.toLocaleString('es-ES')}€
                </div>
                <div className="text-sm text-muted-foreground">
                  Rango: {calculationResult.range.min.toLocaleString('es-ES')}€ - {calculationResult.range.max.toLocaleString('es-ES')}€
                </div>
                <div className="mt-4 text-sm">
                  <span className="text-muted-foreground">Múltiplo aplicado: </span>
                  <span className="font-medium">{calculationResult.multiplier.toFixed(2)}x</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Insights Clave</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {calculationResult.insights.map((insight: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reporte Personalizado con IA
              </CardTitle>
              <CardDescription>
                Obtén un análisis detallado del sector y recomendaciones específicas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accept_lead_capture"
                  checked={formData.accept_lead_capture}
                  onCheckedChange={(checked) => 
                    handleFieldChange('accept_lead_capture', checked)
                  }
                />
                <Label htmlFor="accept_lead_capture" className="text-sm">
                  Acepto recibir el reporte personalizado y comunicaciones de Capittal
                </Label>
              </div>
              
              <Button
                onClick={handleSubmitAndGenerateReport}
                disabled={!formData.accept_lead_capture || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Calculator className="h-4 w-4 mr-2 animate-spin" />
                    Generando reporte...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generar Reporte Personalizado
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  const currentFields = getCurrentStepFields();
  const progress = (currentStep / totalSteps) * 100;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <CardTitle>{calculator.name}</CardTitle>
            <CardDescription>
              Paso {currentStep} de {totalSteps}
            </CardDescription>
          </div>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {currentFields.map((field: any) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            {renderField(field)}
          </div>
        ))}
      </CardContent>
      
      <div className="flex justify-between p-6 border-t">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Anterior
        </Button>
        
        {currentStep === totalSteps - 1 ? (
          <Button
            onClick={calculateValuation}
            disabled={!isStepValid()}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calcular Valoración
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!isStepValid()}
          >
            Siguiente
          </Button>
        )}
      </div>
    </Card>
  );
};