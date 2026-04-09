import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FullSlideTemplate } from '../types/slideTemplate';
import { DEFAULT_FULL_TEMPLATE } from '../types/slideTemplate';

interface SlideTemplateRow {
  id: string;
  name: string;
  template_data: FullSlideTemplate;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const useSlideTemplates = () => {
  const [savedTemplate, setSavedTemplate] = useState<SlideTemplateRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadDefault = useCallback(async (): Promise<FullSlideTemplate> => {
    setIsLoading(true);
    try {
      // Try default first, then any template
      let { data } = await supabase
        .from('slide_templates')
        .select('*')
        .eq('is_default', true)
        .limit(1)
        .maybeSingle();

      if (!data) {
        const res = await supabase
          .from('slide_templates')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        data = res.data;
      }

      if (data) {
        const row = data as unknown as SlideTemplateRow;
        setSavedTemplate(row);
        return row.template_data;
      }
      return { ...DEFAULT_FULL_TEMPLATE };
    } catch (e) {
      console.error('Error loading slide template:', e);
      return { ...DEFAULT_FULL_TEMPLATE };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const save = useCallback(async (template: FullSlideTemplate, name?: string) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (savedTemplate) {
        // Update existing
        const { data, error } = await supabase
          .from('slide_templates')
          .update({
            template_data: template as any,
            updated_at: new Date().toISOString(),
            ...(name ? { name } : {}),
          })
          .eq('id', savedTemplate.id)
          .select()
          .single();

        if (error) throw error;
        setSavedTemplate(data as unknown as SlideTemplateRow);
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('slide_templates')
          .insert({
            name: name || 'Default',
            template_data: template as any,
            is_default: true,
            created_by: user?.id || null,
          })
          .select()
          .single();

        if (error) throw error;
        setSavedTemplate(data as unknown as SlideTemplateRow);
      }
      return true;
    } catch (e) {
      console.error('Error saving slide template:', e);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [savedTemplate]);

  return { loadDefault, save, savedTemplate, isLoading, isSaving };
};
