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
  Eye,
  CheckCircle2,
  Zap
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
import { QuickEditSheet } from './QuickEditSheet';
import { PdfPreviewPanel } from './PdfPreviewPanel';

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
    { year: 2023, revenue: 0, ebitda: 0 },
    { year: 2024, revenue: 0, ebitda: 0 },
    { year: 2025, revenue: 0, ebitda: 0 },
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
  const [quickEditOpen, setQuickEditOpen] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

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

  // Actualizar datos cuando cambian los cálculos
  const dataWithCalculations = useMemo((): ProfessionalValuationData => {
    const baseData = { ...data };
    
    if (!baseData.ebitdaMultipleUsed || baseData.ebitdaMultipleUsed <= 0) {
      baseData.ebitdaMultipleUsed = 6;
    }
    
    if (!calculatedValues) {
      return baseData;
    }
    
    return {
      ...baseData,
      reportedEbitda: getLatestEbitda(data.financialYears),
      normalizedEbitda: calculatedValues.normalizedEbitda,
      ebitdaMultipleLow: baseData.ebitdaMultipleLow ?? calculatedValues.multipleLow,
      ebitdaMultipleHigh: baseData.ebitdaMultipleHigh ?? calculatedValues.multipleHigh,
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

  // Validar paso actual
  const isStepValid = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!(data.clientName?.trim() && data.clientCompany?.trim());
      case 2:
        return data.financialYears.some(fy => fy.ebitda > 0);
      case 3:
        return true;
      case 4: {
        const hasMultiple = data.ebitdaMultipleUsed && data.ebitdaMultipleUsed > 0;
        const hasCalculatedMultiple = calculatedValues?.multipleUsed && calculatedValues.multipleUsed > 0;
        const hasValidMultiple = !!(data.sector && (hasMultiple || hasCalculatedMultiple));
        
        if (hasValidMultiple && calculatedValues) {
          const multipleUsed = data.ebitdaMultipleUsed || 0;
          const effectiveLow = data.ebitdaMultipleLow ?? calculatedValues.multipleLow;
          const effectiveHigh = data.ebitdaMultipleHigh ?? calculatedValues.multipleHigh;
          
          const isOutOfRange = isMultipleOutOfRange(multipleUsed, effectiveLow, effectiveHigh);
          
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
      try {
        await onSave(dataWithCalculations, true);
      } catch (error) {
        console.error('[ProfessionalValuationForm] Auto-save error on next:', error);
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const goPrev = async () => {
    if (currentStep > 1) {
      try {
        await onSave(dataWithCalculations, true);
      } catch (error) {
        console.error('[ProfessionalValuationForm] Auto-save error on prev:', error);
      }
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = async (step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      try {
        await onSave(dataWithCalculations, true);
      } catch (error) {
        console.error('[ProfessionalValuationForm] Auto-save error on goToStep:', error);
      }
      setCurrentStep(step);
    }
  };

  // Guardar
  const handleSave = async (isDraft: boolean = true) => {
    setIsSaving(true);
    try {
      await onSave(dataWithCalculations, isDraft);
    } catch (error) {
      console.error('[ProfessionalValuationForm] Save error:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Generar PDF
  const handleGeneratePdf = async () => {
    if (!onGeneratePdf) return;
    setIsGenerating(true);
    try {
      await onGeneratePdf(dataWithCalculations);
    } catch (error) {
      console.error('[ProfessionalValuationForm] PDF error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Enviar email
  const handleSendEmail = async () => {
    if (!onSendEmail || !data.clientEmail) return;
    setIsSending(true);
    try {
      await onSendEmail(dataWithCalculations, data.clientEmail);
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
              const isValid = isStepValid(step.id);

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
                    <div className="relative">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                          isActive && 'bg-primary text-primary-foreground',
                          isCompleted && 'bg-green-500 text-white',
                          !isActive && !isCompleted && isValid && 'bg-muted text-muted-foreground border-2 border-dashed border-green-400',
                          !isActive && !isCompleted && !isValid && 'bg-muted text-muted-foreground'
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      {/* Green dot for valid pending steps */}
                      {!isActive && !isCompleted && isValid && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <span className={cn(
                      'text-xs font-medium',
                      isActive && 'text-primary',
                      !isActive && 'text-muted-foreground'
                    )}>
                      {step.title}
                    </span>
                    {/* Status text for non-active steps */}
                    {!isActive && (
                      <span className={cn(
                        'text-[10px]',
                        (isCompleted || isValid) ? 'text-green-600' : 'text-muted-foreground'
                      )}>
                        {(isCompleted || isValid) ? 'Completo' : 'Pendiente'}
                      </span>
                    )}
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

          {/* Selector de destinatarios */}
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
          {/* Vista previa PDF - siempre visible */}
          <Button
            variant="outline"
            onClick={() => setPdfPreviewOpen(true)}
            disabled={isLoading}
          >
            <Eye className="w-4 h-4 mr-2" />
            Vista previa PDF
          </Button>

          {/* Edición rápida - solo para valoraciones existentes */}
          {initialData?.id && (
            <Button
              variant="outline"
              onClick={() => setQuickEditOpen(true)}
              disabled={isLoading}
            >
              <Zap className="w-4 h-4 mr-2" />
              Edición rápida
            </Button>
          )}

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

      {/* Sheets */}
      <QuickEditSheet
        open={quickEditOpen}
        onOpenChange={setQuickEditOpen}
        data={dataWithCalculations}
        calculatedValues={calculatedValues}
        updateField={updateField}
        onSave={handleSave}
        onGeneratePdf={onGeneratePdf ? handleGeneratePdf : undefined}
        isSaving={isSaving}
        isGenerating={isGenerating}
      />
      <PdfPreviewPanel
        open={pdfPreviewOpen}
        onOpenChange={setPdfPreviewOpen}
        data={dataWithCalculations}
      />
    </div>
  );
}