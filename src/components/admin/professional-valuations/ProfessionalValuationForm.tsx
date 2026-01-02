// =============================================
// COMPONENTE: Formulario de Valoración Profesional
// Formulario multi-paso para crear valoraciones
// =============================================

import { useState, useCallback, useMemo, useEffect } from 'react';
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
  TrendingUp,
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
import { MultiplesStep, isMultipleOutOfRange, isMultipleJustificationValid } from './steps/MultiplesStep';
import { ComparableOperationsStep } from './steps/ComparableOperationsStep';
import { PreviewStep } from './steps/PreviewStep';

import { EmailRecipientSelector } from './EmailRecipientSelector';

interface ProfessionalValuationFormProps {
  initialData?: Partial<ProfessionalValuationData>;
  onSave: (data: ProfessionalValuationData, isDraft: boolean) => Promise<void>;
  onGeneratePdf?: (data: ProfessionalValuationData) => Promise<void>;
  onSendEmail?: (data: ProfessionalValuationData, email: string) => Promise<void>;
  isLoading?: boolean;
  selectedRecipients?: string[];
  onRecipientsChange?: (recipients: string[]) => void;
}

const STEPS = [
  { id: 1, title: 'Cliente', icon: Building2, description: 'Datos del cliente' },
  { id: 2, title: 'Financieros', icon: Calculator, description: 'Datos económicos' },
  { id: 3, title: 'Normalización', icon: Settings2, description: 'Ajustes EBITDA' },
  { id: 4, title: 'Múltiplos', icon: BarChart3, description: 'Valoración' },
  { id: 5, title: 'Comparables', icon: TrendingUp, description: 'Transacciones' },
  { id: 6, title: 'Resumen', icon: Eye, description: 'Vista previa' },
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
    { year: currentYear - 2, revenue: 0, ebitda: 0 },
    { year: currentYear - 1, revenue: 0, ebitda: 0 },
    { year: currentYear, revenue: 0, ebitda: 0 },
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
  valuationContext: 'La valoración que presentamos se ha elaborado a partir de la información que usted ha proporcionado a través del formulario, así como de los datos públicos disponibles en el Registro Mercantil. Esta combinación nos permite ofrecerle una primera estimación orientativa del valor de su compañía. No debe interpretarse este informe como un informe de valoración formal ni como asesoramiento profesional.',
  strengths: `Crecimiento sólido y márgenes estables, que demuestran capacidad de generación de beneficios.
Flujo de caja recurrente, indicando una operación sana y predecible.
Cartera de clientes diversificada, reduciendo riesgos de dependencia.
Equipo directivo experimentado y estable, que aporta credibilidad al plan de negocio.
Ventajas competitivas claras (tecnología, procesos, marca o barreras de entrada).`,
  weaknesses: `Concentración elevada en pocos clientes o proveedores, lo que incrementa el riesgo.
Márgenes reducidos o muy volátiles, que generan incertidumbre sobre la rentabilidad futura.
Dependencia de personas clave, especialmente si no hay sucesión clara.
Endeudamiento elevado, que limita la capacidad de inversión y resta flexibilidad.
Procesos poco eficientes o falta de digitalización, que reducen competitividad y escalabilidad.`,
  internalNotes: '',
  status: 'draft',
};

export function ProfessionalValuationForm({
  initialData,
  onSave,
  onGeneratePdf,
  onSendEmail,
  isLoading = false,
  selectedRecipients = [],
  onRecipientsChange,
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

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

  // Auto-inicializar ebitdaMultipleUsed cuando hay valores calculados
  useEffect(() => {
    if (calculatedValues && (!data.ebitdaMultipleUsed || data.ebitdaMultipleUsed <= 0)) {
      const defaultMultiple = (calculatedValues.multipleLow + calculatedValues.multipleHigh) / 2;
      setData(prev => ({ 
        ...prev, 
        ebitdaMultipleUsed: Math.round(defaultMultiple * 10) / 10 
      }));
    }
  }, [calculatedValues, data.ebitdaMultipleUsed]);

  // Actualizar datos cuando cambian los cálculos - garantizar valores por defecto y preservar datos de DB
  const dataWithCalculations = useMemo((): ProfessionalValuationData => {
    const baseData = { ...data };
    
    // Asegurar valores por defecto para campos críticos
    if (!baseData.ebitdaMultipleUsed || baseData.ebitdaMultipleUsed <= 0) {
      baseData.ebitdaMultipleUsed = 6; // Valor por defecto
    }
    
    // Si no hay cálculos, retornar los datos existentes (pueden venir de la DB)
    if (!calculatedValues) {
      console.log('[ProfessionalValuationForm] No calculatedValues, usando baseData existente');
      return baseData;
    }
    
    return {
      ...baseData,
      reportedEbitda: getLatestEbitda(data.financialYears),
      normalizedEbitda: calculatedValues.normalizedEbitda,
      ebitdaMultipleLow: baseData.ebitdaMultipleLow ?? calculatedValues.multipleLow,
      ebitdaMultipleHigh: baseData.ebitdaMultipleHigh ?? calculatedValues.multipleHigh,
      // Usar valores calculados, pero mantener los existentes de DB si los calculados son 0
      valuationLow: calculatedValues.valuationLow || baseData.valuationLow,
      valuationHigh: calculatedValues.valuationHigh || baseData.valuationHigh,
      valuationCentral: calculatedValues.valuationCentral || baseData.valuationCentral,
      sensitivityMatrix: calculatedValues.sensitivityMatrix || baseData.sensitivityMatrix,
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

  // Validar paso actual - con fallback a calculatedValues
  const isStepValid = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!(data.clientName?.trim() && data.clientCompany?.trim());
      case 2:
        return data.financialYears.some(fy => fy.ebitda > 0);
      case 3:
        return true; // Ajustes son opcionales
      case 4: {
        // Validar con múltiple del usuario o del cálculo automático
        const hasMultiple = data.ebitdaMultipleUsed && data.ebitdaMultipleUsed > 0;
        const hasCalculatedMultiple = calculatedValues?.multipleUsed && calculatedValues.multipleUsed > 0;
        const hasValidMultiple = !!(data.sector && (hasMultiple || hasCalculatedMultiple));
        
        // Si hay valores calculados, verificar si el múltiplo está fuera de rango
        if (hasValidMultiple && calculatedValues) {
          const multipleUsed = data.ebitdaMultipleUsed || 0;
          
          // CORRECCION: Usar valores efectivos (personalizados si existen, sino del sector)
          const effectiveLow = data.ebitdaMultipleLow ?? calculatedValues.multipleLow;
          const effectiveHigh = data.ebitdaMultipleHigh ?? calculatedValues.multipleHigh;
          
          const isOutOfRange = isMultipleOutOfRange(
            multipleUsed, 
            effectiveLow, 
            effectiveHigh
          );
          
          // Si está fuera de rango del efectivo, exigir justificación de al menos 20 caracteres
          if (isOutOfRange) {
            return isMultipleJustificationValid(data.multipleJustification);
          }
        }
        
        return hasValidMultiple;
      }
      case 5:
        return true;
      default:
        return true;
    }
  }, [data, calculatedValues]);

  // Navegación con auto-guardado
  const goNext = async () => {
    if (currentStep < STEPS.length && isStepValid(currentStep)) {
      // Auto-guardar como borrador antes de cambiar de paso
      try {
        await onSave(dataWithCalculations, true);
      } catch (error) {
        console.error('[ProfessionalValuationForm] Auto-save error on next:', error);
        // Continuar aunque falle el guardado
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const goPrev = async () => {
    if (currentStep > 1) {
      // Auto-guardar como borrador antes de cambiar de paso
      try {
        await onSave(dataWithCalculations, true);
      } catch (error) {
        console.error('[ProfessionalValuationForm] Auto-save error on prev:', error);
        // Continuar aunque falle el guardado
      }
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = async (step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      // Auto-guardar como borrador antes de cambiar de paso
      try {
        await onSave(dataWithCalculations, true);
      } catch (error) {
        console.error('[ProfessionalValuationForm] Auto-save error on goToStep:', error);
      }
      setCurrentStep(step);
    }
  };

  // Guardar con try-catch y logging
  const handleSave = async (isDraft: boolean = true) => {
    console.log('[ProfessionalValuationForm] handleSave called, isDraft:', isDraft);
    console.log('[ProfessionalValuationForm] dataWithCalculations:', {
      clientCompany: dataWithCalculations.clientCompany,
      valuationCentral: dataWithCalculations.valuationCentral,
      ebitdaMultipleUsed: dataWithCalculations.ebitdaMultipleUsed,
    });
    setIsSaving(true);
    try {
      await onSave(dataWithCalculations, isDraft);
      console.log('[ProfessionalValuationForm] Save completed successfully');
    } catch (error) {
      console.error('[ProfessionalValuationForm] Save error:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Generar PDF con try-catch y logging
  const handleGeneratePdf = async () => {
    console.log('[ProfessionalValuationForm] handleGeneratePdf called');
    console.log('[ProfessionalValuationForm] valuationCentral:', dataWithCalculations.valuationCentral);
    if (!onGeneratePdf) {
      console.warn('[ProfessionalValuationForm] onGeneratePdf is not defined');
      return;
    }
    setIsGenerating(true);
    try {
      await onGeneratePdf(dataWithCalculations);
      console.log('[ProfessionalValuationForm] PDF generated successfully');
    } catch (error) {
      console.error('[ProfessionalValuationForm] PDF error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Enviar email con try-catch y logging
  const handleSendEmail = async () => {
    console.log('[ProfessionalValuationForm] handleSendEmail called');
    console.log('[ProfessionalValuationForm] clientEmail:', data.clientEmail);
    if (!onSendEmail) {
      console.warn('[ProfessionalValuationForm] onSendEmail is not defined');
      return;
    }
    if (!data.clientEmail) {
      console.warn('[ProfessionalValuationForm] No clientEmail provided');
      return;
    }
    setIsSending(true);
    try {
      await onSendEmail(dataWithCalculations, data.clientEmail);
      console.log('[ProfessionalValuationForm] Email sent successfully');
    } catch (error) {
      console.error('[ProfessionalValuationForm] Email error:', error);
    } finally {
      setIsSending(false);
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
            <ComparableOperationsStep
              data={data}
              updateField={updateField}
            />
          )}
          {currentStep === 6 && (
            <PreviewStep
              data={dataWithCalculations}
              calculatedValues={calculatedValues}
              updateField={updateField}
            />
          )}

          {/* Selector de destinatarios - Solo visible en el último paso */}
          {currentStep === 6 && onSendEmail && data.clientEmail && onRecipientsChange && (
            <div className="mt-6 pt-6 border-t">
              <EmailRecipientSelector
                selectedRecipients={selectedRecipients}
                onSelectionChange={onRecipientsChange}
              />
            </div>
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
            disabled={isSaving || isLoading || isGenerating || isSending}
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
                  disabled={isLoading || isGenerating || isSaving || isSending}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generando...' : 'Generar PDF'}
                </Button>
              )}
              {onSendEmail && data.clientEmail && (
                <Button
                  onClick={handleSendEmail}
                  disabled={isLoading || isSending || isSaving || isGenerating}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSending ? 'Enviando...' : 'Enviar por email'}
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={goNext}
              disabled={!isStepValid(currentStep) || isLoading || isSaving}
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
