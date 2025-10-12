import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import { ArrowLeft, Save, Plus, X, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useJobCategories } from '@/hooks/useJobCategories';
import { useJobTemplates } from '@/hooks/useJobTemplates';
import { useJobOfferAI } from '@/hooks/useJobOfferAI';
import { useToast } from '@/hooks/use-toast';
import {
  JobBasicInfo,
  JobTemplateSelector,
  useJobForm,
  useJobListManagement,
} from '@/features/jobs';
import { JobPasteParser } from '@/features/jobs/components/JobPasteParser';
import type { ContractType, EmploymentType, ExperienceLevel, ApplicationMethod } from '@/types/jobs';

export const JobPostEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { categories } = useJobCategories();
  const { templates } = useJobTemplates();
  const { generateField, generateList, generateFullOffer, isGenerating } = useJobOfferAI();

  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiContext, setAiContext] = useState({
    title: '',
    level: 'mid',
    sector: '',
    keywords: '',
  });

  const {
    form,
    isEditMode,
    isLoading,
    isSaving,
    onSubmit,
  } = useJobForm(id);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const listManagement = useJobListManagement(watch, setValue);
  
  const requirements = watch('requirements');
  const responsibilities = watch('responsibilities');
  const benefits = watch('benefits');
  const languages = watch('required_languages');
  const applicationMethod = watch('application_method');

  const handleLoadTemplate = (templateId: string) => {
    if (templateId === 'blank') return;
    
    const template = templates?.find(t => t.id === templateId);
    if (!template) return;

    if (template.title_template) setValue('title', template.title_template);
    if (template.short_description_template) setValue('short_description', template.short_description_template);
    if (template.description_template) setValue('description', template.description_template);
    if (template.requirements_template) setValue('requirements', template.requirements_template);
    if (template.responsibilities_template) setValue('responsibilities', template.responsibilities_template);
    if (template.benefits_template) setValue('benefits', template.benefits_template);
    if (template.default_location) setValue('location', template.default_location);
    if (template.default_contract_type) setValue('contract_type', template.default_contract_type as ContractType);
    if (template.default_employment_type) setValue('employment_type', template.default_employment_type as EmploymentType);
    if (template.default_is_remote !== null) setValue('is_remote', template.default_is_remote);
    if (template.default_is_hybrid !== null) setValue('is_hybrid', template.default_is_hybrid);
    if (template.default_experience_level) setValue('experience_level', template.default_experience_level as ExperienceLevel);
    if (template.default_sector) setValue('sector', template.default_sector);

    toast({
      title: 'Plantilla cargada',
      description: 'Los datos de la plantilla se han aplicado correctamente',
    });
  };

  const handleGenerateField = async (field: 'title' | 'short_description' | 'description') => {
    try {
      const context = {
        title: watch('title') || aiContext.title,
        level: watch('experience_level') || aiContext.level,
        sector: watch('sector') || aiContext.sector,
        keywords: aiContext.keywords,
      };
      
      const content = await generateField(field, context);
      setValue(field, content);
    } catch (error) {
      console.error('Error generating field:', error);
    }
  };

  const handleGenerateList = async (type: 'requirements' | 'responsibilities' | 'benefits') => {
    try {
      const context = {
        title: watch('title') || aiContext.title,
        level: watch('experience_level') || aiContext.level,
        sector: watch('sector') || aiContext.sector,
      };
      
      const items = await generateList(type, context);
      setValue(type, items);
    } catch (error) {
      console.error('Error generating list:', error);
    }
  };

  const handleGenerateFull = async () => {
    try {
      const result = await generateFullOffer(aiContext);
      
      if (result.title) setValue('title', result.title);
      if (result.short_description) setValue('short_description', result.short_description);
      if (result.description) setValue('description', result.description);
      if (result.requirements) setValue('requirements', result.requirements);
      if (result.responsibilities) setValue('responsibilities', result.responsibilities);
      if (result.benefits) setValue('benefits', result.benefits);
      
      setIsAIDialogOpen(false);
      toast({
        title: '¡Oferta generada!',
        description: 'La oferta completa se ha generado con IA. Revisa y ajusta según necesites.',
      });
    } catch (error) {
      console.error('Error generating full offer:', error);
    }
  };

  if (isLoading) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/jobs')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Editar Oferta de Trabajo' : 'Nueva Oferta de Trabajo'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Modifica los datos de la oferta' : 'Completa los datos de la nueva oferta'}
          </p>
        </div>
        
        {!isEditMode && <JobPasteParser setValue={setValue} />}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Selector de Plantilla - Solo en modo creación */}
        {!isEditMode && (
          <JobTemplateSelector
            onSelectTemplate={handleLoadTemplate}
            onOpenAI={() => setIsAIDialogOpen(true)}
            isGenerating={isGenerating}
          />
        )}

        {/* Información Básica */}
        <JobBasicInfo
          control={control}
          categories={categories || []}
          errors={errors}
          onGenerateField={handleGenerateField}
          isGenerating={isGenerating}
        />

        {/* Requisitos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Requisitos *</CardTitle>
                <CardDescription>Requisitos necesarios para el puesto</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleGenerateList('requirements')}
                disabled={isGenerating}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Sugerir con IA
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={listManagement.newRequirement}
                onChange={(e) => listManagement.setNewRequirement(e.target.value)}
                placeholder="Ej: 3+ años de experiencia en React"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), listManagement.addItem('requirement', listManagement.newRequirement))}
              />
              <Button type="button" onClick={() => listManagement.addItem('requirement', listManagement.newRequirement)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {requirements?.map((req, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                  <span className="flex-1">{req}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => listManagement.removeItem('requirements', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {errors.requirements && <p className="text-sm text-red-500">{errors.requirements.message}</p>}
          </CardContent>
        </Card>

        {/* Responsabilidades */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Responsabilidades *</CardTitle>
                <CardDescription>Principales responsabilidades del puesto</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleGenerateList('responsibilities')}
                disabled={isGenerating}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Sugerir con IA
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={listManagement.newResponsibility}
                onChange={(e) => listManagement.setNewResponsibility(e.target.value)}
                placeholder="Ej: Desarrollar nuevas funcionalidades"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), listManagement.addItem('responsibility', listManagement.newResponsibility))}
              />
              <Button type="button" onClick={() => listManagement.addItem('responsibility', listManagement.newResponsibility)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {responsibilities?.map((resp, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                  <span className="flex-1">{resp}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => listManagement.removeItem('responsibilities', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {errors.responsibilities && <p className="text-sm text-red-500">{errors.responsibilities.message}</p>}
          </CardContent>
        </Card>

        {/* Beneficios */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Beneficios</CardTitle>
                <CardDescription>Beneficios que ofrece el puesto</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleGenerateList('benefits')}
                disabled={isGenerating}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Sugerir con IA
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={listManagement.newBenefit}
                onChange={(e) => listManagement.setNewBenefit(e.target.value)}
                placeholder="Ej: Teletrabajo flexible"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), listManagement.addItem('benefit', listManagement.newBenefit))}
              />
              <Button type="button" onClick={() => listManagement.addItem('benefit', listManagement.newBenefit)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {benefits?.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                  <span className="flex-1">{benefit}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => listManagement.removeItem('benefits', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ubicación y Modalidad */}
        <Card>
          <CardHeader>
            <CardTitle>Ubicación y Modalidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="location">Ubicación *</Label>
              <Controller
                name="location"
                control={control}
                render={({ field }) => <Input {...field} id="location" placeholder="Ej: Madrid, España" />}
              />
              {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="is_remote"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} id="is_remote" />
                  )}
                />
                <Label htmlFor="is_remote">Trabajo remoto</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="is_hybrid"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} id="is_hybrid" />
                  )}
                />
                <Label htmlFor="is_hybrid">Trabajo híbrido</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipo de Contrato */}
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Contrato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contract_type">Tipo de contrato *</Label>
                <Controller
                  name="contract_type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indefinido">Indefinido</SelectItem>
                        <SelectItem value="temporal">Temporal</SelectItem>
                        <SelectItem value="practicas">Prácticas</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <Label htmlFor="employment_type">Jornada *</Label>
                <Controller
                  name="employment_type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Tiempo completo</SelectItem>
                        <SelectItem value="part_time">Tiempo parcial</SelectItem>
                        <SelectItem value="contract">Por contrato</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="experience_level">Nivel de experiencia</Label>
              <Controller
                name="experience_level"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid-level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="sector">Sector</Label>
              <Controller
                name="sector"
                control={control}
                render={({ field }) => <Input {...field} id="sector" placeholder="Ej: Tecnología" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Salario */}
        <Card>
          <CardHeader>
            <CardTitle>Salario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salary_min">Salario mínimo (€)</Label>
                <Controller
                  name="salary_min"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      id="salary_min"
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      value={field.value || ''}
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="salary_max">Salario máximo (€)</Label>
                <Controller
                  name="salary_max"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      id="salary_max"
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      value={field.value || ''}
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="is_salary_visible"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} id="is_salary_visible" />
                )}
              />
              <Label htmlFor="is_salary_visible">Mostrar salario públicamente</Label>
            </div>
          </CardContent>
        </Card>

        {/* Idiomas */}
        <Card>
          <CardHeader>
            <CardTitle>Idiomas Requeridos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={listManagement.newLanguage}
                onChange={(e) => listManagement.setNewLanguage(e.target.value)}
                placeholder="Ej: Español nativo"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), listManagement.addItem('language', listManagement.newLanguage))}
              />
              <Button type="button" onClick={() => listManagement.addItem('language', listManagement.newLanguage)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {languages?.map((lang, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                  <span className="flex-1">{lang}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => listManagement.removeItem('required_languages', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Método de Aplicación */}
        <Card>
          <CardHeader>
            <CardTitle>Método de Aplicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="application_method">Método *</Label>
              <Controller
                name="application_method"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Formulario interno</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="external_url">URL externa</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {applicationMethod === 'email' && (
              <div>
                <Label htmlFor="application_email">Email de contacto</Label>
                <Controller
                  name="application_email"
                  control={control}
                  render={({ field }) => <Input {...field} type="email" id="application_email" />}
                />
                {errors.application_email && <p className="text-sm text-red-500 mt-1">{errors.application_email.message}</p>}
              </div>
            )}

            {applicationMethod === 'external_url' && (
              <div>
                <Label htmlFor="application_url">URL de aplicación</Label>
                <Controller
                  name="application_url"
                  control={control}
                  render={({ field }) => <Input {...field} type="url" id="application_url" />}
                />
                {errors.application_url && <p className="text-sm text-red-500 mt-1">{errors.application_url.message}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opciones Adicionales */}
        <Card>
          <CardHeader>
            <CardTitle>Opciones Adicionales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="is_featured"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} id="is_featured" />
                )}
              />
              <Label htmlFor="is_featured">Oferta destacada</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="is_urgent"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} id="is_urgent" />
                )}
              />
              <Label htmlFor="is_urgent">Oferta urgente</Label>
            </div>

            <div>
              <Label htmlFor="closes_at">Fecha de cierre</Label>
              <Controller
                name="closes_at"
                control={control}
                render={({ field }) => <Input {...field} type="date" id="closes_at" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/jobs')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isEditMode ? 'Actualizar Oferta' : 'Crear Oferta'}
          </Button>
        </div>
      </form>

      {/* Diálogo de Generación con IA */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generar Oferta con IA
            </DialogTitle>
            <DialogDescription>
              Completa los datos básicos para generar una oferta completa con inteligencia artificial
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="ai-title">Título del puesto *</Label>
              <Input
                id="ai-title"
                value={aiContext.title}
                onChange={(e) => setAiContext({ ...aiContext, title: e.target.value })}
                placeholder="Ej: Desarrollador Full Stack Senior"
              />
            </div>
            <div>
              <Label htmlFor="ai-level">Nivel del puesto *</Label>
              <Select value={aiContext.level} onValueChange={(val) => setAiContext({ ...aiContext, level: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid-level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead/Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ai-sector">Sector *</Label>
              <Input
                id="ai-sector"
                value={aiContext.sector}
                onChange={(e) => setAiContext({ ...aiContext, sector: e.target.value })}
                placeholder="Ej: Tecnología"
              />
            </div>
            <div>
              <Label htmlFor="ai-keywords">Keywords opcionales</Label>
              <Input
                id="ai-keywords"
                value={aiContext.keywords}
                onChange={(e) => setAiContext({ ...aiContext, keywords: e.target.value })}
                placeholder="Ej: React, TypeScript, Agile..."
              />
            </div>
            <Button
              className="w-full"
              onClick={handleGenerateFull}
              disabled={isGenerating || !aiContext.title || !aiContext.sector}
            >
              {isGenerating ? (
                <>Generando oferta completa...</>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generar Oferta Completa
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};