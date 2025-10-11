import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
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
import { useJobPosts, useJobPost } from '@/hooks/useJobPosts';
import { useJobCategories } from '@/hooks/useJobCategories';
import { useToast } from '@/hooks/use-toast';
import type { JobPostFormData, ContractType, EmploymentType, ExperienceLevel, ApplicationMethod } from '@/types/jobs';

const jobPostSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200),
  category_id: z.string().optional(),
  short_description: z.string().min(10, 'La descripción corta debe tener al menos 10 caracteres').max(300),
  description: z.string().min(50, 'La descripción debe tener al menos 50 caracteres'),
  requirements: z.array(z.string()).min(1, 'Añade al menos un requisito'),
  responsibilities: z.array(z.string()).min(1, 'Añade al menos una responsabilidad'),
  benefits: z.array(z.string()),
  location: z.string().min(2, 'La ubicación es requerida'),
  is_remote: z.boolean(),
  is_hybrid: z.boolean(),
  contract_type: z.enum(['indefinido', 'temporal', 'practicas', 'freelance']),
  employment_type: z.enum(['full_time', 'part_time', 'contract']),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  is_salary_visible: z.boolean(),
  experience_level: z.enum(['junior', 'mid', 'senior', 'lead']).optional(),
  sector: z.string().optional(),
  required_languages: z.array(z.string()),
  is_featured: z.boolean(),
  is_urgent: z.boolean(),
  closes_at: z.string().optional(),
  application_method: z.enum(['internal', 'email', 'external_url']),
  application_email: z.string().email().optional().or(z.literal('')),
  application_url: z.string().url().optional().or(z.literal('')),
});

export const JobPostEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;

  const { data: jobPost, isLoading: isLoadingPost } = useJobPost(id || '');
  const { categories } = useJobCategories();
  const { createJobPost, updateJobPost, isCreating, isUpdating } = useJobPosts({});

  const [newRequirement, setNewRequirement] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobPostFormData>({
    resolver: zodResolver(jobPostSchema),
    defaultValues: {
      title: '',
      short_description: '',
      description: '',
      requirements: [],
      responsibilities: [],
      benefits: [],
      location: '',
      is_remote: false,
      is_hybrid: false,
      contract_type: 'indefinido',
      employment_type: 'full_time',
      is_salary_visible: true,
      required_languages: [],
      is_featured: false,
      is_urgent: false,
      application_method: 'internal',
    },
  });

  const requirements = watch('requirements');
  const responsibilities = watch('responsibilities');
  const benefits = watch('benefits');
  const languages = watch('required_languages');
  const applicationMethod = watch('application_method');

  useEffect(() => {
    if (isEditMode && jobPost) {
      setValue('title', jobPost.title);
      setValue('category_id', jobPost.category_id);
      setValue('short_description', jobPost.short_description);
      setValue('description', jobPost.description);
      setValue('requirements', jobPost.requirements || []);
      setValue('responsibilities', jobPost.responsibilities || []);
      setValue('benefits', jobPost.benefits || []);
      setValue('location', jobPost.location);
      setValue('is_remote', jobPost.is_remote);
      setValue('is_hybrid', jobPost.is_hybrid);
      setValue('contract_type', jobPost.contract_type as ContractType);
      setValue('employment_type', jobPost.employment_type as EmploymentType);
      setValue('salary_min', jobPost.salary_min);
      setValue('salary_max', jobPost.salary_max);
      setValue('is_salary_visible', jobPost.is_salary_visible);
      setValue('experience_level', jobPost.experience_level as ExperienceLevel);
      setValue('sector', jobPost.sector);
      setValue('required_languages', jobPost.required_languages || []);
      setValue('is_featured', jobPost.is_featured);
      setValue('is_urgent', jobPost.is_urgent);
      setValue('closes_at', jobPost.closes_at);
      setValue('application_method', jobPost.application_method as ApplicationMethod);
      setValue('application_email', jobPost.application_email);
      setValue('application_url', jobPost.application_url);
    }
  }, [jobPost, isEditMode, setValue]);

  const addItem = (type: 'requirement' | 'responsibility' | 'benefit' | 'language', value: string) => {
    if (!value.trim()) return;
    
    const fieldMap = {
      requirement: { field: 'requirements', setter: setNewRequirement },
      responsibility: { field: 'responsibilities', setter: setNewResponsibility },
      benefit: { field: 'benefits', setter: setNewBenefit },
      language: { field: 'required_languages', setter: setNewLanguage },
    };

    const { field, setter } = fieldMap[type];
    const currentValues = watch(field as keyof JobPostFormData) as string[];
    setValue(field as keyof JobPostFormData, [...currentValues, value.trim()] as any);
    setter('');
  };

  const removeItem = (type: 'requirements' | 'responsibilities' | 'benefits' | 'required_languages', index: number) => {
    const currentValues = watch(type) as string[];
    setValue(type, currentValues.filter((_, i) => i !== index) as any);
  };

  const onSubmit = async (data: JobPostFormData) => {
    try {
      if (isEditMode && id) {
        await updateJobPost({ id, updates: data });
        toast({
          title: 'Oferta actualizada',
          description: 'La oferta de trabajo se ha actualizado correctamente.',
        });
      } else {
        await createJobPost(data);
        toast({
          title: 'Oferta creada',
          description: 'La oferta de trabajo se ha creado correctamente.',
        });
      }
      navigate('/admin/jobs');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ha ocurrido un error al guardar la oferta.',
        variant: 'destructive',
      });
    }
  };

  if (isEditMode && isLoadingPost) {
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

      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {isEditMode ? 'Editar Oferta de Trabajo' : 'Nueva Oferta de Trabajo'}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode ? 'Modifica los datos de la oferta' : 'Completa los datos de la nueva oferta'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Datos principales de la oferta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título de la oferta *</Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => <Input {...field} id="title" placeholder="Ej: Desarrollador Full Stack Senior" />}
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="category_id">Categoría</Label>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="short_description">Descripción corta *</Label>
              <Controller
                name="short_description"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} id="short_description" rows={2} placeholder="Resumen breve de la oferta" />
                )}
              />
              {errors.short_description && <p className="text-sm text-red-500 mt-1">{errors.short_description.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Descripción completa *</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} id="description" rows={6} placeholder="Descripción detallada de la oferta" />
                )}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Requisitos */}
        <Card>
          <CardHeader>
            <CardTitle>Requisitos *</CardTitle>
            <CardDescription>Requisitos necesarios para el puesto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Ej: 3+ años de experiencia en React"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('requirement', newRequirement))}
              />
              <Button type="button" onClick={() => addItem('requirement', newRequirement)}>
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
                    onClick={() => removeItem('requirements', index)}
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
            <CardTitle>Responsabilidades *</CardTitle>
            <CardDescription>Principales responsabilidades del puesto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                placeholder="Ej: Desarrollar nuevas funcionalidades"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('responsibility', newResponsibility))}
              />
              <Button type="button" onClick={() => addItem('responsibility', newResponsibility)}>
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
                    onClick={() => removeItem('responsibilities', index)}
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
            <CardTitle>Beneficios</CardTitle>
            <CardDescription>Beneficios que ofrece el puesto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="Ej: Teletrabajo flexible"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('benefit', newBenefit))}
              />
              <Button type="button" onClick={() => addItem('benefit', newBenefit)}>
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
                    onClick={() => removeItem('benefits', index)}
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
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Ej: Español nativo"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('language', newLanguage))}
              />
              <Button type="button" onClick={() => addItem('language', newLanguage)}>
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
                    onClick={() => removeItem('required_languages', index)}
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
          <Button type="submit" disabled={isCreating || isUpdating}>
            <Save className="mr-2 h-4 w-4" />
            {isEditMode ? 'Actualizar Oferta' : 'Crear Oferta'}
          </Button>
        </div>
      </form>
    </div>
  );
};