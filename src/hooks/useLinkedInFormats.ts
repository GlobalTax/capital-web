import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LinkedInFormatOption {
  id: string;
  value: string;
  label: string;
  created_at: string;
}

const FALLBACK_FORMATS: LinkedInFormatOption[] = [
  { id: '1', value: 'carousel', label: 'Carrusel', created_at: '' },
  { id: '2', value: 'long_text', label: 'Texto largo', created_at: '' },
  { id: '3', value: 'infographic', label: 'Infografía', created_at: '' },
  { id: '4', value: 'opinion', label: 'Opinión', created_at: '' },
  { id: '5', value: 'storytelling', label: 'Storytelling', created_at: '' },
  { id: '6', value: 'data_highlight', label: 'Dato destacado', created_at: '' },
];

export const useLinkedInFormats = () => {
  const queryClient = useQueryClient();

  const { data: formats = FALLBACK_FORMATS, isLoading } = useQuery({
    queryKey: ['linkedin-format-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('linkedin_format_options')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data as LinkedInFormatOption[]).length > 0 ? data as LinkedInFormatOption[] : FALLBACK_FORMATS;
    },
  });

  const addFormat = useMutation({
    mutationFn: async ({ value, label }: { value: string; label: string }) => {
      const { data, error } = await supabase
        .from('linkedin_format_options')
        .insert({ value, label })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedin-format-options'] });
      toast.success('Formato añadido');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeFormat = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('linkedin_format_options')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedin-format-options'] });
      toast.success('Formato eliminado');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { formats, isLoading, addFormat, removeFormat };
};
