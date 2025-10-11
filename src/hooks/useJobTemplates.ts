/**
 * useJobTemplates Hook
 * Refactored to use JobTemplatesService
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { jobTemplatesService } from '@/services/jobs/JobTemplatesService';
import type { JobTemplate as ServiceJobTemplate, JobTemplateInsert } from '@/services/jobs/JobTemplatesService';

// Re-export JobTemplate type for backward compatibility
export type { JobTemplate } from '@/services/jobs/JobTemplatesService';

interface UseJobTemplatesFilters {
  category?: string;
}

export const useJobTemplates = (filters?: UseJobTemplatesFilters) => {
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['job-templates', filters],
    queryFn: async () => {
      if (filters?.category) {
        const result = await jobTemplatesService.getByCategory(filters.category);
        if (!result.success) throw new Error(result.error);
        return result.data;
      }
      
      const result = await jobTemplatesService.getActiveTemplates();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create template mutation
  const createTemplate = useMutation({
    mutationFn: async (template: JobTemplateInsert) => {
      const result = await jobTemplatesService.create(template);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-templates'] });
      toast.success('Plantilla creada correctamente');
    },
    onError: (error: Error) => {
      console.error('Error creating template:', error);
      toast.error('Error al crear la plantilla');
    }
  });

  // Update template mutation
  const updateTemplate = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ServiceJobTemplate> }) => {
      const result = await jobTemplatesService.update(id, data);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-templates'] });
      toast.success('Plantilla actualizada correctamente');
    },
    onError: (error: Error) => {
      console.error('Error updating template:', error);
      toast.error('Error al actualizar la plantilla');
    }
  });

  // Delete template mutation (soft delete)
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const result = await jobTemplatesService.update(id, { is_active: false });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-templates'] });
      toast.success('Plantilla eliminada correctamente');
    },
    onError: (error: Error) => {
      console.error('Error deleting template:', error);
      toast.error('Error al eliminar la plantilla');
    }
  });

  // Increment usage mutation
  const incrementUsage = useMutation({
    mutationFn: async (id: string) => {
      const result = await jobTemplatesService.incrementUsage(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-templates'] });
    },
    onError: (error: Error) => {
      console.error('Error incrementing usage:', error);
    }
  });

  // Duplicate template mutation
  const duplicateTemplate = useMutation({
    mutationFn: async ({ id, newName }: { id: string; newName: string }) => {
      const result = await jobTemplatesService.duplicateTemplate(id, newName);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-templates'] });
      toast.success('Plantilla duplicada correctamente');
    },
    onError: (error: Error) => {
      console.error('Error duplicating template:', error);
      toast.error('Error al duplicar la plantilla');
    }
  });

  return {
    templates: templates || [],
    isLoading,
    createTemplate: createTemplate.mutate,
    updateTemplate: updateTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
    incrementUsage: incrementUsage.mutate,
    duplicateTemplate: duplicateTemplate.mutate,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending
  };
};
