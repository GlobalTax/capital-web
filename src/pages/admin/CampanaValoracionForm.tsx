import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, ChevronLeft } from 'lucide-react';
import { useCampaign, useCampaigns, ValuationCampaign } from '@/hooks/useCampaigns';
import { useCampaignCompanies } from '@/hooks/useCampaignCompanies';
import { Skeleton } from '@/components/ui/skeleton';
import { CampaignConfigStep } from '@/components/admin/campanas-valoracion/steps/CampaignConfigStep';
import { CompaniesStep } from '@/components/admin/campanas-valoracion/steps/CompaniesStep';
import { ReviewCalculateStep } from '@/components/admin/campanas-valoracion/steps/ReviewCalculateStep';
import { ProcessSendStep } from '@/components/admin/campanas-valoracion/steps/ProcessSendStep';
import { CampaignSummaryStep } from '@/components/admin/campanas-valoracion/steps/CampaignSummaryStep';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Configuración', description: 'Nombre, sector y plantilla' },
  { id: 2, title: 'Empresas', description: 'Excel o entrada manual' },
  { id: 3, title: 'Revisión', description: 'Cálculo y enriquecimiento IA' },
  { id: 4, title: 'Procesamiento', description: 'Crear y enviar valoraciones' },
  { id: 5, title: 'Resumen', description: 'KPIs y resultados' },
];

export default function CampanaValoracionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'nueva';

  const { data: existingCampaign, isLoading: loadingCampaign } = useCampaign(isNew ? undefined : id);
  const { createCampaign, updateCampaign, isCreating, isUpdating } = useCampaigns();
  const { companies, stats, refetch: refetchCompanies } = useCampaignCompanies(isNew ? undefined : id);

  const [currentStep, setCurrentStep] = useState(1);
  const [campaignId, setCampaignId] = useState<string | undefined>(isNew ? undefined : id);
  const [campaignData, setCampaignData] = useState<Partial<ValuationCampaign>>({
    name: '',
    sector: '',
    status: 'draft',
    include_comparables: false,
    ai_personalize: false,
    use_custom_advisor: false,
    lead_source: 'Outbound',
    service_type: 'vender',
    financial_years: [new Date().getFullYear() - 1, new Date().getFullYear() - 2, new Date().getFullYear() - 3],
  });

  useEffect(() => {
    if (existingCampaign) {
      setCampaignData(existingCampaign);
      setCampaignId(existingCampaign.id);
    }
  }, [existingCampaign]);

  const updateField = <K extends keyof ValuationCampaign>(key: K, value: ValuationCampaign[K]) => {
    setCampaignData(prev => ({ ...prev, [key]: value }));
  };

  const saveCampaign = async (): Promise<string | undefined> => {
    try {
      if (campaignId) {
        await updateCampaign({ id: campaignId, data: campaignData });
        return campaignId;
      } else {
        const result = await createCampaign(campaignData);
        setCampaignId(result.id);
        // Update URL without full navigation
        window.history.replaceState(null, '', `/admin/campanas-valoracion/${result.id}`);
        return result.id;
      }
    } catch {
      return undefined;
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const savedId = await saveCampaign();
      if (!savedId) return;
    }
    if (currentStep < 5) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  if (!isNew && loadingCampaign) {
    return <div className="p-6 space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96" /></div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/campanas-valoracion')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{isNew ? 'Nueva Campaña' : (campaignData.name || 'Editar Campaña')}</h1>
          <p className="text-sm text-muted-foreground">{campaignData.sector || 'Configura los detalles de la campaña'}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((step, i) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => {
                  if (step.id <= currentStep || campaignId) setCurrentStep(step.id);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "bg-primary/10 text-primary",
                  !isActive && !isCompleted && "text-muted-foreground hover:bg-muted"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                  isActive && "bg-primary-foreground text-primary",
                  isCompleted && "bg-primary text-primary-foreground",
                  !isActive && !isCompleted && "bg-muted-foreground/20"
                )}>
                  {isCompleted ? '✓' : step.id}
                </span>
                <span className="hidden md:inline">{step.title}</span>
              </button>
              {i < STEPS.length - 1 && <div className="w-4 h-px bg-border mx-1" />}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[60vh]">
        {currentStep === 1 && (
          <CampaignConfigStep data={campaignData} updateField={updateField} />
        )}
        {currentStep === 2 && campaignId && (
          <CompaniesStep campaignId={campaignId} financialYears={campaignData.financial_years || [new Date().getFullYear() - 1, new Date().getFullYear() - 2, new Date().getFullYear() - 3]} />
        )}
        {currentStep === 3 && campaignId && (
          <ReviewCalculateStep campaignId={campaignId} campaign={campaignData as ValuationCampaign} />
        )}
        {currentStep === 4 && campaignId && (
          <ProcessSendStep campaignId={campaignId} campaign={campaignData as ValuationCampaign} />
        )}
        {currentStep === 5 && campaignId && (
          <CampaignSummaryStep campaignId={campaignId} campaign={campaignData as ValuationCampaign} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1}>
          <ArrowLeft className="h-4 w-4 mr-2" />Anterior
        </Button>
        <div className="flex items-center gap-2">
          {currentStep === 1 && (
            <Button variant="outline" onClick={saveCampaign} disabled={isCreating || isUpdating || !campaignData.name || !campaignData.sector}>
              <Save className="h-4 w-4 mr-2" />{campaignId ? 'Guardar' : 'Crear'}
            </Button>
          )}
          {currentStep < 5 && (
            <Button onClick={handleNext} disabled={
              (currentStep === 1 && (!campaignData.name || !campaignData.sector)) ||
              (currentStep === 2 && companies.length === 0)
            }>
              Siguiente<ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
