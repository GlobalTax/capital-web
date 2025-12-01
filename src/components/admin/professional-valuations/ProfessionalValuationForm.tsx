// =============================================
// COMPONENTE: Formulario de Valoración Profesional
// Formulario multi-paso para crear valoraciones
// =============================================

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  FileText,
  Send,
  Building2,
  Calculator,
  Settings2,
  BarChart3,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ProfessionalValuationData,
  FinancialYear,
  NormalizationAdjustment,
  ValuationSector,
} from '@/types/professionalValuation';
import {
  calculateProfessionalValuation,
  getLatestEbitda,
} from '@/utils/professionalValuationCalculation';
import { ClientDataStep } from './steps/ClientDataStep';
import { FinancialDataStep } from './steps/FinancialDataStep';
import { NormalizationStep } from './steps/NormalizationStep';
import { MultiplesStep } from './steps/MultiplesStep';
import { PreviewStep } from './steps/PreviewStep';

interface ProfessionalValuationFormProps {
  initialData?: Partial<ProfessionalValuationData>;
  onSave: (data: ProfessionalValuationData, isDraft: boolean) => Promise<void>;
  onGeneratePdf?: (data: ProfessionalValuationData) => Promise<void>;
  onSendEmail?: (data: ProfessionalValuationData, email: string) => Promise<void>;
  isLoading?: boolean;
}

const STEPS = [
  { id: 1, title: 'Cliente', icon: Building2, description: 'Datos del cliente' },
  { id: 2, title: 'Financieros', icon: Calculator, description: 'Datos económicos' },
  { id: 3, title: 'Normalización', icon: Settings2, description: 'Ajustes EBITDA' },
  { id: 4, title: 'Múltiplos', icon: BarChart3, description: 'Valoración' },
  { id: 5, title: 'Resumen', icon: Eye, description: 'Vista previa' },
];

const currentYear = new Date().getFullYear();

const DEFAULT_DATA: ProfessionalValuationData = {
  clientName: '',
  clientCompany: '',
  clientCif: '',
  clientEmail: '',
  clientPhone: '',
  clientLogoUrl: '',
  sector: 'Otro',
  sectorDescription: '',
  financialYears: [
    { year: currentYear - 2, revenue: 0, ebitda: 0, netProfit: 0 },
    { year: currentYear - 1, revenue: 0, ebitda: 0, netProfit: 0 },
    { year: currentYear, revenue: 0, ebitda: 0, netProfit: 0 },
  ],
  normalizationAdjustments: [],
  reportedEbitda: 0,
  normalizedEbitda: 0,
  ebitdaMultipleLow: 5,
  ebitdaMultipleHigh: 7,
  ebitdaMultipleUsed: 6,
  multipleJustification: '',
  valuationLow: 0,
  valuationHigh: 0,
  valuationCentral: 0,
  valuationContext: '',
  strengths: '',
  weaknesses: '',
  internalNotes: '',
  status: 'draft',
};

export function ProfessionalValuationForm({
  initialData,
  onSave,
  onGeneratePdf,
  onSendEmail,
  isLoading = false,
}: ProfessionalValuationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ProfessionalValuationData>(() => ({
    ...DEFAULT_DATA,
    ...initialData,
    financialYears: initialData?.financialYears?.length 
      ? initialData.financialYears 
      : DEFAULT_DATA.financialYears,
  }));
  const [isSaving, setIsSaving] = useState(false);

  // Calcular valores derivados
  const calculatedValues = useMemo(() => {
    if (!data.financialYears?.length || !data.sector) return null;
    
    const reportedEbitda = getLatestEbitda(data.financialYears);
    if (reportedEbitda <= 0) return null;

    return calculateProfessionalValuation(
      data.financialYears,
      data.normalizationAdjustments || [],
      data.sector,
      data.ebitdaMultipleUsed
    );
  }, [data.financialYears, data.normalizationAdjustments, data.sector, data.ebitdaMultipleUsed]);

  // Actualizar datos cuando cambian los cálculos
  const dataWithCalculations = useMemo((): ProfessionalValuationData => {
    if (!calculatedValues) return data;
    
    return {
      ...data,
      reportedEbitda: getLatestEbitda(data.financialYears),
      normalizedEbitda: calculatedValues.normalizedEbitda,
      ebitdaMultipleLow: calculatedValues.multipleLow,
      ebitdaMultipleHigh: calculatedValues.multipleHigh,
      valuationLow: calculatedValues.valuationLow,
      valuationHigh: calculatedValues.valuationHigh,
      valuationCentral: calculatedValues.valuationCentral,
      sensitivityMatrix: calculatedValues.sensitivityMatrix,
    };
  }, [data, calculatedValues]);

  // Actualizar un campo
  const updateField = useCallback(<K extends keyof ProfessionalValuationData>(
    field: K,
    value: ProfessionalValuationData[K]
  ) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Actualizar datos financieros
  const updateFinancialYear = useCallback((index: number, updates: Partial<FinancialYear>) => {
    setData(prev => ({
      ...prev,
      financialYears: prev.financialYears.map((fy, i) => 
        i === index ? { ...fy, ...updates } : fy
      ),
    }));
  }, []);

  // Añadir ajuste de normalización
  const addAdjustment = useCallback((adjustment: NormalizationAdjustment) => {
    setData(prev => ({
      ...prev,
      normalizationAdjustments: [...(prev.normalizationAdjustments || []), adjustment],
    }));
  }, []);

  // Eliminar ajuste de normalización
  const removeAdjustment = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      normalizationAdjustments: (prev.normalizationAdjustments || []).filter(a => a.id !== id),
    }));
  }, []);

  // Actualizar ajuste de normalización
  const updateAdjustment = useCallback((id: string, updates: Partial<NormalizationAdjustment>) => {
    setData(prev => ({
      ...prev,
      normalizationAdjustments: (prev.normalizationAdjustments || []).map(a =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
  }, []);

  // Validar paso actual
  const isStepValid = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!(data.clientName?.trim() && data.clientCompany?.trim());
      case 2:
        return data.financialYears.some(fy => fy.ebitda > 0);
      case 3:
        return true; // Ajustes son opcionales
      case 4:
        return !!(data.sector && data.ebitdaMultipleUsed && data.ebitdaMultipleUsed > 0);
      case 5:
        return true;
      default:
        return true;
    }
  }, [data]);

  // Navegación
  const goNext = () => {
    if (currentStep < STEPS.length && isStepValid(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step);
    }
  };

  // Guardar
  const handleSave = async (isDraft: boolean = true) => {
    setIsSaving(true);
    try {
      await onSave(dataWithCalculations, isDraft);
    } finally {
      setIsSaving(false);
    }
  };

  // Generar PDF
  const handleGeneratePdf = async () => {
    if (onGeneratePdf) {
      await onGeneratePdf(dataWithCalculations);
    }
  };

  // Enviar email
  const handleSendEmail = async () => {
    if (onSendEmail && data.clientEmail) {
      await onSendEmail(dataWithCalculations, data.clientEmail);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isClickable = step.id <= currentStep || isStepValid(step.id - 1);

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => isClickable && goToStep(step.id)}
                    disabled={!isClickable}
                    className={cn(
                      'flex flex-col items-center gap-1 transition-all',
                      isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                        isActive && 'bg-primary text-primary-foreground',
                        isCompleted && 'bg-green-500 text-white',
                        !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={cn(
                      'text-xs font-medium',
                      isActive && 'text-primary',
                      !isActive && 'text-muted-foreground'
                    )}>
                      {step.title}
                    </span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      'w-12 h-0.5 mx-2',
                      isCompleted ? 'bg-green-500' : 'bg-muted'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Contenido del paso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const Icon = STEPS[currentStep - 1].icon;
              return <Icon className="w-5 h-5" />;
            })()}
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <ClientDataStep
              data={data}
              updateField={updateField}
            />
          )}
          {currentStep === 2 && (
            <FinancialDataStep
              financialYears={data.financialYears}
              updateFinancialYear={updateFinancialYear}
            />
          )}
          {currentStep === 3 && (
            <NormalizationStep
              reportedEbitda={getLatestEbitda(data.financialYears)}
              adjustments={data.normalizationAdjustments || []}
              onAddAdjustment={addAdjustment}
              onRemoveAdjustment={removeAdjustment}
              onUpdateAdjustment={updateAdjustment}
              normalizedEbitda={calculatedValues?.normalizedEbitda || 0}
            />
          )}
          {currentStep === 4 && (
            <MultiplesStep
              data={data}
              calculatedValues={calculatedValues}
              updateField={updateField}
            />
          )}
          {currentStep === 5 && (
            <PreviewStep
              data={dataWithCalculations}
              calculatedValues={calculatedValues}
              updateField={updateField}
            />
          )}
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentStep === 1 || isLoading}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={isSaving || isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar borrador'}
          </Button>

          {currentStep === STEPS.length ? (
            <>
              {onGeneratePdf && (
                <Button
                  variant="secondary"
                  onClick={handleGeneratePdf}
                  disabled={isLoading}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generar PDF
                </Button>
              )}
              {onSendEmail && data.clientEmail && (
                <Button
                  onClick={handleSendEmail}
                  disabled={isLoading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar por email
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={goNext}
              disabled={!isStepValid(currentStep) || isLoading}
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
