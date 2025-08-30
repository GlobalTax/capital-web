import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SectorCalculator {
  id: string;
  name: string;
  sector: string;
  slug: string;
  description?: string;
  is_active: boolean;
  configuration: any;
  fields_config: any[];
  results_config: any;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CalculatorResult {
  id: string;
  calculator_id: string;
  input_data: any;
  calculation_results: any;
  valuation_amount?: number;
  sector: string;
  company_name?: string;
  contact_email?: string;
  lead_captured: boolean;
  report_generated: boolean;
  created_at: string;
}

export const useSectorCalculators = () => {
  return useQuery({
    queryKey: ['sectorCalculators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sector_calculators')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as SectorCalculator[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSectorCalculatorBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['sectorCalculator', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sector_calculators')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as SectorCalculator;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCalculatorResults = () => {
  return useQuery({
    queryKey: ['calculatorResults'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calculator_results')
        .select(`
          *,
          calculator:sector_calculators(name, sector)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useSubmitCalculatorResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (resultData: any) => {
      const { data, error } = await supabase
        .from('calculator_results')
        .insert([resultData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculatorResults'] });
      toast.success('Resultado guardado correctamente');
    },
    onError: (error) => {
      console.error('Error submitting calculator result:', error);
      toast.error('Error al guardar el resultado');
    },
  });
};

// Admin hooks
export const useAdminSectorCalculators = () => {
  return useQuery({
    queryKey: ['adminSectorCalculators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sector_calculators')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as SectorCalculator[];
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateSectorCalculator = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (calculatorData: any) => {
      const { data, error } = await supabase
        .from('sector_calculators')
        .insert([calculatorData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSectorCalculators'] });
      queryClient.invalidateQueries({ queryKey: ['sectorCalculators'] });
      toast.success('Calculadora creada correctamente');
    },
    onError: (error) => {
      console.error('Error creating calculator:', error);
      toast.error('Error al crear la calculadora');
    },
  });
};

export const useUpdateSectorCalculator = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('sector_calculators')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSectorCalculators'] });
      queryClient.invalidateQueries({ queryKey: ['sectorCalculators'] });
      toast.success('Calculadora actualizada correctamente');
    },
    onError: (error) => {
      console.error('Error updating calculator:', error);
      toast.error('Error al actualizar la calculadora');
    },
  });
};

export const useDeleteSectorCalculator = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sector_calculators')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSectorCalculators'] });
      queryClient.invalidateQueries({ queryKey: ['sectorCalculators'] });
      toast.success('Calculadora eliminada correctamente');
    },
    onError: (error) => {
      console.error('Error deleting calculator:', error);
      toast.error('Error al eliminar la calculadora');
    },
  });
};