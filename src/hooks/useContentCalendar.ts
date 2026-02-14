import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ContentChannel = 'linkedin_company' | 'linkedin_personal' | 'blog' | 'newsletter' | 'crm_internal';
export type LinkedInFormat = 'carousel' | 'long_text' | 'infographic' | 'opinion' | 'storytelling' | 'data_highlight';
export type TargetAudience = 'sellers' | 'buyers' | 'advisors' | 'internal';

export interface ContentCalendarItem {
  id: string;
  title: string;
  slug: string | null;
  status: 'idea' | 'draft' | 'review' | 'scheduled' | 'published' | 'archived';
  scheduled_date: string | null;
  published_date: string | null;
  category: string | null;
  tags: string[];
  target_keywords: string[];
  meta_title: string | null;
  meta_description: string | null;
  notes: string | null;
  assigned_to: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  pe_sector_id: string | null;
  blog_post_id: string | null;
  estimated_reading_time: number | null;
  content_type: 'article' | 'guide' | 'case_study' | 'report' | 'infographic' | 'newsletter' | 'linkedin_post' | 'carousel' | 'newsletter_edition' | 'sector_brief' | 'crm_sheet';
  channel: ContentChannel;
  linkedin_format: LinkedInFormat | null;
  ai_generated_content: string | null;
  ai_generation_metadata: Record<string, any> | null;
  target_audience: TargetAudience;
  key_data: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PESectorIntelligence {
  id: string;
  sector: string;
  subsector: string;
  vertical: string | null;
  pe_thesis: string | null;
  quantitative_data: string | null;
  active_pe_firms: string | null;
  platforms_operations: string | null;
  multiples_valuations: string | null;
  consolidation_phase: string | null;
  geography: string | null;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useContentCalendar = () => {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['content-calendar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_calendar')
        .select('*')
        .order('scheduled_date', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as ContentCalendarItem[];
    },
  });

  const createItem = useMutation({
    mutationFn: async (item: Partial<ContentCalendarItem>) => {
      const { data, error } = await supabase
        .from('content_calendar')
        .insert(item as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-calendar'] });
      toast.success('Elemento creado');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContentCalendarItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('content_calendar')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-calendar'] });
      toast.success('Elemento actualizado');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('content_calendar').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-calendar'] });
      toast.success('Elemento eliminado');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { items, isLoading, createItem, updateItem, deleteItem };
};

export const usePESectorIntelligence = () => {
  const { data: sectors = [], isLoading } = useQuery({
    queryKey: ['pe-sector-intelligence'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pe_sector_intelligence')
        .select('*')
        .eq('is_active', true)
        .order('sector', { ascending: true });
      if (error) throw error;
      return data as PESectorIntelligence[];
    },
  });

  return { sectors, isLoading };
};
