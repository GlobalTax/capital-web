
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormABTest, ABTestResults } from '@/types/marketingAutomation';

export const useABTesting = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener A/B tests
  const { data: abTests, isLoading: isLoadingABTests } = useQuery({
    queryKey: ['formABTests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_ab_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FormABTest[];
    },
  });

  // Crear A/B test
  const createABTest = useMutation({
    mutationFn: async (testData: Omit<FormABTest, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('form_ab_tests')
        .insert(testData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formABTests'] });
      toast({
        title: "🧪 Test A/B creado",
        description: "El test A/B ha sido configurado exitosamente.",
      });
    },
  });

  // Obtener conversiones de A/B test
  const getABTestResults = useCallback(async (testId: string): Promise<ABTestResults> => {
    const { data, error } = await supabase
      .from('form_conversions')
      .select('*')
      .eq('test_id', testId);

    if (error) throw error;

    const variantA = data.filter(conv => conv.variant === 'A');
    const variantB = data.filter(conv => conv.variant === 'B');

    const aConversions = variantA.filter(conv => conv.converted).length;
    const bConversions = variantB.filter(conv => conv.converted).length;

    return {
      variantA: {
        views: variantA.length,
        conversions: aConversions,
        rate: variantA.length > 0 ? (aConversions / variantA.length) * 100 : 0
      },
      variantB: {
        views: variantB.length,
        conversions: bConversions,
        rate: variantB.length > 0 ? (bConversions / variantB.length) * 100 : 0
      }
    };
  }, []);

  return {
    abTests,
    isLoadingABTests,
    createABTest,
    getABTestResults,
  };
};
