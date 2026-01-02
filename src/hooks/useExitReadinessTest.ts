import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExitReadinessResponse, ExitReadinessLeadData, ReadinessLevel } from '@/components/exit-readiness/types';

interface SaveTestParams {
  leadData: ExitReadinessLeadData;
  responses: ExitReadinessResponse[];
  totalScore: number;
  readinessLevel: ReadinessLevel;
  recommendations: string[];
}

export const useExitReadinessTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveTestResults = async ({
    leadData,
    responses,
    totalScore,
    readinessLevel,
    recommendations
  }: SaveTestParams) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get UTM params from URL
      const urlParams = new URLSearchParams(window.location.search);
      
      const { data, error: supabaseError } = await supabase
        .from('exit_readiness_tests')
        .insert({
          email: leadData.email,
          name: leadData.name || null,
          phone: leadData.phone || null,
          company_name: leadData.company_name || null,
          responses: responses.map(r => ({
            question_id: r.questionId,
            answer: r.answer,
            points: r.points
          })),
          total_score: totalScore,
          readiness_level: readinessLevel,
          recommendations: recommendations,
          utm_source: urlParams.get('utm_source'),
          utm_medium: urlParams.get('utm_medium'),
          utm_campaign: urlParams.get('utm_campaign'),
          utm_content: urlParams.get('utm_content'),
          referrer: document.referrer || null,
          user_agent: navigator.userAgent
        })
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar el test';
      setError(errorMessage);
      console.error('Error saving exit readiness test:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveTestResults,
    isLoading,
    error
  };
};
