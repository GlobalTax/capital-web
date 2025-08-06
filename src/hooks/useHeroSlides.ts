import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  cta_primary_text?: string;
  cta_primary_url?: string;
  cta_secondary_text?: string;
  cta_secondary_url?: string;
  image_url?: string;
  background_color?: string;
  text_color?: string;
  display_order: number;
  is_active: boolean;
  autoplay_duration?: number;
}

export const useHeroSlides = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching slides');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  return { slides, isLoading, error, refetch: fetchSlides };
};

export const useHeroSlidesAdmin = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllSlides = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (err) {
      console.error('Error fetching slides:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createSlide = async (slide: Omit<HeroSlide, 'id'>) => {
    const { data, error } = await supabase
      .from('hero_slides')
      .insert([slide])
      .select()
      .single();

    if (error) throw error;
    await fetchAllSlides();
    return data;
  };

  const updateSlide = async (id: string, updates: Partial<HeroSlide>) => {
    const { data, error } = await supabase
      .from('hero_slides')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchAllSlides();
    return data;
  };

  const deleteSlide = async (id: string) => {
    const { error } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchAllSlides();
  };

  const reorderSlides = async (slides: { id: string; display_order: number }[]) => {
    const updates = slides.map(({ id, display_order }) => 
      supabase
        .from('hero_slides')
        .update({ display_order })
        .eq('id', id)
    );

    await Promise.all(updates);
    await fetchAllSlides();
  };

  useEffect(() => {
    fetchAllSlides();
  }, []);

  return {
    slides,
    isLoading,
    createSlide,
    updateSlide,
    deleteSlide,
    reorderSlides,
    refetch: fetchAllSlides
  };
};