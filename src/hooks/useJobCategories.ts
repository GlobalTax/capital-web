import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { JobCategory } from '@/types/jobs';

export const useJobCategories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['job-categories'],
    queryFn: async (): Promise<JobCategory[]> => {
      const { data, error } = await supabase
        .from('job_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const createCategory = useMutation({
    mutationFn: async (category: Omit<JobCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('job_categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-categories'] });
      toast({
        title: "Categoría creada",
        description: "La categoría se ha creado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear categoría",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<JobCategory> }) => {
      const { data, error } = await supabase
        .from('job_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-categories'] });
      toast({
        title: "Categoría actualizada",
        description: "La categoría se ha actualizado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar categoría",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-categories'] });
      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar categoría",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    categories,
    isLoading,
    error,
    createCategory: createCategory.mutate,
    updateCategory: updateCategory.mutate,
    deleteCategory: deleteCategory.mutate,
    isCreating: createCategory.isPending,
    isUpdating: updateCategory.isPending,
    isDeleting: deleteCategory.isPending,
  };
};
