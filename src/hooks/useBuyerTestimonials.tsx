import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BuyerTestimonial {
  id: string;
  buyer_name: string;
  buyer_position: string;
  buyer_company: string;
  buyer_sector: string;
  avatar_initials: string;
  rating: number;
  testimonial_text: string;
  operation_type?: string;
  investment_range?: string;
  time_to_close?: string;
  satisfaction_score?: string;
  is_active: boolean;
  display_order: number;
}

export const useBuyerTestimonials = () => {
  return useQuery({
    queryKey: ['buyer-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buyer_testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as BuyerTestimonial[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
