
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { SectorReportRequest } from '@/types/sectorReports';
import WizardStep1Basic from './WizardStep1Basic';
import WizardStep2Data from './WizardStep2Data';
import WizardStep3Customization from './WizardStep3Customization';
import WizardStep4Preview from './WizardStep4Preview';

interface ReportWizardProps {
  onGenerate: (request: SectorReportRequest) => void;
  isGenerating: boolean;
  onClose: () => void;
}

const ReportWizard: React.FC<ReportWizardProps> = ({ onGenerate, isGenerating, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SectorReportRequest>>({
    reportType: 'market-analysis',
    depth: 'intermediate',
    period: 'year',
    targetAudience: 'entrepreneurs',
    includeData: {
      multiples: true,
      caseStudies: true,
      statistics: true
    }
  });

  const steps = [
    { id: 1, title: 'Información Básica', description: 'Sector y tipo de reporte' },
    { id: 2, title: 'Configuración de Datos', description: 'Período y fuentes de información' },
    { id: 3, title: 'Personalización', description: 'Audiencia y enfoque específico' },
    { id: 4, title: 'Vista Previa', description: 'Revisión antes de generar' }
  ];

  const progress = (currentStep / steps.length) * 100;

  const updateFormData = (updates: Partial<SectorReportRequest>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.sector && formData.reportType;
      case 2:
        return formData.period && formData.depth;
      case 3:
        return formData.targetAudience;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = () => {
    onGenerate(formData as SectorReportRequest);
  };

  const getEstimatedTime = () => {
    if (!formData.depth) return '2-3 min';
    return formData.depth === 'advanced' ? '4-6 min' : 
           formData.depth === 'intermediate' ? '2-4 min' : '1-2 min';
  };

  const getEstimatedWords = () => {
    if (!formData.depth) return '2,000-3,000';
    return formData.depth === 'advanced' ? '5,000-6,000' : 
           formData.depth === 'intermediate' ? '3,000-4,000' : '1,500-2,500';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generador de Reportes - Paso {currentStep} de {steps.length}
            </CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </div>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>
        
        <div className="space-y-4">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-xs text-gray-500">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`text-center ${
                  step.id === currentStep ? 'text-blue-600 font-medium' : 
                  step.id < currentStep ? 'text-green-600' : ''
                }`}
              >
                <div className="mb-1">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        {(formData.depth || formData.period) && (
          <div className="flex gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <div>📊 Palabras estimadas: <span className="font-medium">{getEstimatedWords()}</span></div>
            <div>⏱️ Tiempo estimado: <span className="font-medium">{getEstimatedTime()}</span></div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <div className="h-full">
          {currentStep === 1 && (
            <WizardStep1Basic
              data={formData}
              onChange={updateFormData}
            />
          )}
          {currentStep === 2 && (
            <WizardStep2Data
              data={formData}
              onChange={updateFormData}
            />
          )}
          {currentStep === 3 && (
            <WizardStep3Customization
              data={formData}
              onChange={updateFormData}
            />
          )}
          {currentStep === 4 && (
            <WizardStep4Preview
              data={formData as SectorReportRequest}
            />
          )}
        </div>

        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !canProceed()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generar Reporte
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportWizard;
