import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface ProcessStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  duration: string;
  icon_name: string;
  is_active: boolean;
  display_order: number;
}

export interface Comparison {
  id: string;
  aspect: string;
  with_capittal: string;
  without_capittal: string;
  is_critical: boolean;
  is_active: boolean;
  display_order: number;
}

export interface VentaTestimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  sector: string;
  avatar_initials: string;
  rating: number;
  quote: string;
  price_increase: string;
  time_to_sale: string;
  valuation: string;
  is_active: boolean;
  display_order: number;
}

// Hook for Process Steps
export const useProcessSteps = () => {
  return useQuery({
    queryKey: ['venta-empresas-process-steps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venta_empresas_process_steps')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as ProcessStep[];
    },
  });
};

// Hook for Comparisons
export const useComparisons = () => {
  return useQuery({
    queryKey: ['venta-empresas-comparisons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venta_empresas_comparisons')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Comparison[];
    },
  });
};

// Hook for Testimonials
export const useVentaTestimonials = () => {
  return useQuery({
    queryKey: ['venta-empresas-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venta_empresas_testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as VentaTestimonial[];
    },
  });
};

// Mutations for admin panel
export const useUpdateProcessStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProcessStep> }) => {
      const { error } = await supabase
        .from('venta_empresas_process_steps')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venta-empresas-process-steps'] });
      toast.success('Paso actualizado correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar el paso');
    },
  });
};

export const useUpdateComparison = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Comparison> }) => {
      const { error } = await supabase
        .from('venta_empresas_comparisons')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venta-empresas-comparisons'] });
      toast.success('Comparación actualizada correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar la comparación');
    },
  });
};

export const useUpdateVentaTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VentaTestimonial> }) => {
      const { error } = await supabase
        .from('venta_empresas_testimonials')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venta-empresas-testimonials'] });
      toast.success('Testimonio actualizado correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar el testimonio');
    },
  });
};
