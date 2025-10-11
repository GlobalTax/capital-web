import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useJobPost, useJobPosts } from '@/hooks/useJobPosts';
import type { JobPostFormData, ContractType, EmploymentType, ExperienceLevel, ApplicationMethod } from '@/types/jobs';

const jobPostSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200),
  category_id: z.string().optional(),
  short_description: z.string().min(10).max(300),
  description: z.string().min(50),
  requirements: z.array(z.string()).min(1),
  responsibilities: z.array(z.string()).min(1),
  benefits: z.array(z.string()),
  location: z.string().min(2),
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

export const useJobForm = (jobId?: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!jobId;

  const { data: jobPost, isLoading: isLoadingPost } = useJobPost(jobId || '');
  const { createJobPost, updateJobPost, isCreating, isUpdating } = useJobPosts({});

  const form = useForm<JobPostFormData>({
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

  useEffect(() => {
    if (isEditMode && jobPost) {
      form.setValue('title', jobPost.title);
      form.setValue('category_id', jobPost.category_id);
      form.setValue('short_description', jobPost.short_description);
      form.setValue('description', jobPost.description);
      form.setValue('requirements', jobPost.requirements || []);
      form.setValue('responsibilities', jobPost.responsibilities || []);
      form.setValue('benefits', jobPost.benefits || []);
      form.setValue('location', jobPost.location);
      form.setValue('is_remote', jobPost.is_remote);
      form.setValue('is_hybrid', jobPost.is_hybrid);
      form.setValue('contract_type', jobPost.contract_type as ContractType);
      form.setValue('employment_type', jobPost.employment_type as EmploymentType);
      form.setValue('salary_min', jobPost.salary_min);
      form.setValue('salary_max', jobPost.salary_max);
      form.setValue('is_salary_visible', jobPost.is_salary_visible);
      form.setValue('experience_level', jobPost.experience_level as ExperienceLevel);
      form.setValue('sector', jobPost.sector);
      form.setValue('required_languages', jobPost.required_languages || []);
      form.setValue('is_featured', jobPost.is_featured);
      form.setValue('is_urgent', jobPost.is_urgent);
      form.setValue('closes_at', jobPost.closes_at);
      form.setValue('application_method', jobPost.application_method as ApplicationMethod);
      form.setValue('application_email', jobPost.application_email);
      form.setValue('application_url', jobPost.application_url);
    }
  }, [jobPost, isEditMode, form]);

  const onSubmit = async (data: JobPostFormData) => {
    try {
      if (isEditMode && jobId) {
        await updateJobPost({ id: jobId, updates: data });
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

  return {
    form,
    isEditMode,
    isLoading: isLoadingPost,
    isSaving: isCreating || isUpdating,
    onSubmit,
  };
};
