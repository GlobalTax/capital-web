import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, ArrowLeft, User, Briefcase, FileText, Send } from 'lucide-react';
import { LoadingButton } from '@/components/LoadingButton';
import { useCollaboratorApplications } from '@/hooks/useCollaboratorApplications';

interface FormData {
  // Personal Info
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  
  // Professional Info
  currentRole: string;
  company: string;
  experience: string;
  sector: string;
  availability: string;
  
  // Additional Info
  motivation: string;
  skills: string;
  portfolio: string;
}

const INITIAL_FORM_DATA: FormData = {
  fullName: '',
  email: '',
  phone: '',
  linkedin: '',
  currentRole: '',
  company: '',
  experience: '',
  sector: '',
  availability: '',
  motivation: '',
  skills: '',
  portfolio: ''
};

const STEPS = [
  { id: 1, title: 'Personal', icon: User, description: 'Información básica' },
  { id: 2, title: 'Profesional', icon: Briefcase, description: 'Experiencia y rol' },
  { id: 3, title: 'Detalles', icon: FileText, description: 'Motivación y skills' },
  { id: 4, title: 'Envío', icon: Send, description: 'Revisar y enviar' }
];

export const EnhancedCollaboratorForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const { submitApplication, isSubmitting } = useCollaboratorApplications();

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.fullName && formData.email && formData.phone);
      case 2:
        return !!(formData.currentRole && formData.company && formData.experience);
      case 3:
        return !!(formData.motivation && formData.skills);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      const applicationData = {
        ...formData,
        profession: formData.currentRole // Map currentRole to profession
      };
      await submitApplication(applicationData);
      setFormData(INITIAL_FORM_DATA);
      setCurrentStep(1);
      setCompletedSteps([]);
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                  Nombre completo *
                </label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateFormData('fullName', e.target.value)}
                  placeholder="Tu nombre completo"
                  className="admin-input"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email profesional *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="tu@empresa.com"
                  className="admin-input"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  Teléfono *
                </label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="+34 600 000 000"
                  className="admin-input"
                />
              </div>
              
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-foreground mb-2">
                  LinkedIn
                </label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => updateFormData('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/tu-perfil"
                  className="admin-input"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="currentRole" className="block text-sm font-medium text-foreground mb-2">
                  Rol actual *
                </label>
                <Input
                  id="currentRole"
                  value={formData.currentRole}
                  onChange={(e) => updateFormData('currentRole', e.target.value)}
                  placeholder="Ej: Senior M&A Analyst"
                  className="admin-input"
                />
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                  Empresa actual *
                </label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => updateFormData('company', e.target.value)}
                  placeholder="Nombre de tu empresa"
                  className="admin-input"
                />
              </div>
              
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-foreground mb-2">
                  Años de experiencia *
                </label>
                <Select onValueChange={(value) => updateFormData('experience', value)}>
                  <SelectTrigger className="admin-input">
                    <SelectValue placeholder="Selecciona experiencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3">1-3 años</SelectItem>
                    <SelectItem value="3-5">3-5 años</SelectItem>
                    <SelectItem value="5-10">5-10 años</SelectItem>
                    <SelectItem value="10+">Más de 10 años</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="sector" className="block text-sm font-medium text-foreground mb-2">
                  Sector de especialización
                </label>
                <Select onValueChange={(value) => updateFormData('sector', value)}>
                  <SelectTrigger className="admin-input">
                    <SelectValue placeholder="Selecciona sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnologia">Tecnología</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="energia">Energía</SelectItem>
                    <SelectItem value="retail">Retail & Consumer</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="financial">Financial Services</SelectItem>
                    <SelectItem value="inmobiliario">Inmobiliario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-foreground mb-2">
                  Disponibilidad
                </label>
                <Select onValueChange={(value) => updateFormData('availability', value)}>
                  <SelectTrigger className="admin-input">
                    <SelectValue placeholder="Selecciona disponibilidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Tiempo completo</SelectItem>
                    <SelectItem value="part-time">Tiempo parcial</SelectItem>
                    <SelectItem value="project-based">Por proyectos</SelectItem>
                    <SelectItem value="consulting">Consultoría</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="motivation" className="block text-sm font-medium text-foreground mb-2">
                  ¿Por qué quieres ser colaborador de Capittal? *
                </label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => updateFormData('motivation', e.target.value)}
                  placeholder="Describe tu motivación para unirte al programa..."
                  className="admin-input min-h-[120px]"
                />
              </div>
              
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-foreground mb-2">
                  Competencias y habilidades clave *
                </label>
                <Textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => updateFormData('skills', e.target.value)}
                  placeholder="Describe tus principales competencias técnicas y habilidades..."
                  className="admin-input min-h-[120px]"
                />
              </div>
              
              <div>
                <label htmlFor="portfolio" className="block text-sm font-medium text-foreground mb-2">
                  Portfolio o trabajos relevantes
                </label>
                <Textarea
                  id="portfolio"
                  value={formData.portfolio}
                  onChange={(e) => updateFormData('portfolio', e.target.value)}
                  placeholder="Enlaces o descripción de proyectos relevantes..."
                  className="admin-input min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Revisa tu solicitud
              </h3>
              <p className="text-muted-foreground">
                Verifica que toda la información sea correcta antes de enviar.
              </p>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p><strong>Nombre:</strong> {formData.fullName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Teléfono:</strong> {formData.phone}</p>
                  {formData.linkedin && <p><strong>LinkedIn:</strong> {formData.linkedin}</p>}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Información Profesional</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p><strong>Rol:</strong> {formData.currentRole}</p>
                  <p><strong>Empresa:</strong> {formData.company}</p>
                  <p><strong>Experiencia:</strong> {formData.experience}</p>
                  {formData.sector && <p><strong>Sector:</strong> {formData.sector}</p>}
                  {formData.availability && <p><strong>Disponibilidad:</strong> {formData.availability}</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Solicitud de Colaboración</h2>
          <Badge variant="outline" className="text-sm">
            Paso {currentStep} de {STEPS.length}
          </Badge>
        </div>
        
        <Progress value={progress} className="mb-6" />
        
        {/* Steps indicator */}
        <div className="flex justify-between">
          {STEPS.map((step) => {
            const StepIcon = step.icon;
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center text-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors
                  ${isCompleted ? 'bg-primary text-primary-foreground' : 
                    isCurrent ? 'bg-primary/20 text-primary border-2 border-primary' : 
                    'bg-muted text-muted-foreground'}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>
                <div className="text-xs">
                  <div className={`font-medium ${isCurrent || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </div>
                  <div className="text-muted-foreground">{step.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <Card className="admin-card">
        <CardContent className="p-8">
          {renderStepContent()}
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>
            
            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="admin-button-primary flex items-center gap-2"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <LoadingButton
                loading={isSubmitting}
                loadingText="Enviando..."
                onClick={handleSubmit}
                className="admin-button-primary"
              >
                Enviar Solicitud
              </LoadingButton>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCollaboratorForm;