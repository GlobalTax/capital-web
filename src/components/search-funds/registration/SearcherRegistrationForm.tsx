import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { searcherRegistrationSchema, type SearcherRegistrationData } from '@/schemas/searcherSchema';
import { useSearcherRegistration } from '@/hooks/useSearcherRegistration';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { BackgroundStep } from './steps/BackgroundStep';
import { InvestmentStructureStep } from './steps/InvestmentStructureStep';
import { SearchCriteriaStep } from './steps/SearchCriteriaStep';
import { AdditionalInfoStep } from './steps/AdditionalInfoStep';

const STEPS = [
  { id: 1, title: 'Datos personales', description: 'Información de contacto' },
  { id: 2, title: 'Background', description: 'Tu experiencia profesional' },
  { id: 3, title: 'Inversión', description: 'Estructura y capital' },
  { id: 4, title: 'Criterios', description: 'Qué tipo de empresa buscas' },
  { id: 5, title: 'Finalizar', description: 'Información adicional' }
];

export function SearcherRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const { submitRegistration, isSubmitting } = useSearcherRegistration();

  const form = useForm<SearcherRegistrationData>({
    resolver: zodResolver(searcherRegistrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      linkedinUrl: '',
      jobTitle: '',
      background: '',
      investorBacking: undefined,
      investorNames: '',
      fundRaised: undefined,
      searchPhase: undefined,
      preferredSectors: [],
      preferredLocations: [],
      minRevenue: undefined,
      maxRevenue: undefined,
      minEbitda: undefined,
      maxEbitda: undefined,
      dealTypePreferences: [],
      additionalCriteria: '',
      howFoundUs: '',
      gdprConsent: undefined,
      marketingConsent: false
    },
    mode: 'onChange'
  });

  const progress = (currentStep / STEPS.length) * 100;

  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof SearcherRegistrationData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['fullName', 'email', 'phone'];
        break;
      case 2:
        fieldsToValidate = ['background'];
        break;
      case 3:
        fieldsToValidate = ['investorBacking', 'fundRaised', 'searchPhase'];
        break;
      case 4:
        fieldsToValidate = ['preferredSectors', 'preferredLocations'];
        break;
      case 5:
        fieldsToValidate = ['gdprConsent'];
        break;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: SearcherRegistrationData) => {
    await submitRegistration(data);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep form={form} />;
      case 2:
        return <BackgroundStep form={form} />;
      case 3:
        return <InvestmentStructureStep form={form} />;
      case 4:
        return <SearchCriteriaStep form={form} />;
      case 5:
        return <AdditionalInfoStep form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Paso {currentStep} de {STEPS.length}</span>
          <span>{STEPS[currentStep - 1].title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step indicators */}
      <div className="hidden md:flex justify-between mb-8">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={`flex flex-col items-center text-center ${
              step.id === currentStep
                ? 'text-primary'
                : step.id < currentStep
                ? 'text-muted-foreground'
                : 'text-muted-foreground/50'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1 ${
                step.id === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : step.id < currentStep
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.id}
            </div>
            <span className="text-xs">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {STEPS[currentStep - 1].description}
            </p>

            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>

            {currentStep < STEPS.length ? (
              <Button type="button" onClick={handleNext}>
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Completar registro'
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
