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
          user_agent: navigator.userAgent,
          ai_report_status: 'pending'
        })
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      // Sync with contact_leads for unified CRM
      if (data?.id) {
        await syncToContactLeads(leadData, data.id, totalScore, readinessLevel, urlParams);
        
        // Trigger AI report generation in background
        triggerAIReportGeneration(data.id);
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

// Sync lead to contact_leads for unified CRM management
async function syncToContactLeads(
  leadData: ExitReadinessLeadData,
  testId: string,
  totalScore: number,
  readinessLevel: ReadinessLevel,
  urlParams: URLSearchParams
) {
  try {
    // Check for existing contact by email (deduplication)
    const { data: existingContact } = await supabase
      .from('contact_leads')
      .select('id')
      .eq('email', leadData.email)
      .eq('is_deleted', false)
      .maybeSingle();

    if (!existingContact) {
      // Insert new contact
      await supabase
        .from('contact_leads')
        .insert({
          full_name: leadData.name || leadData.email.split('@')[0],
          email: leadData.email,
          phone: leadData.phone || null,
          company: leadData.company_name || null,
          service_type: 'vender',
          source: 'exit_readiness_test',
          status: 'new',
          message: `Test Exit-Ready completado. Puntuación: ${totalScore}/80. Nivel: ${readinessLevel}`,
          utm_source: urlParams.get('utm_source'),
          utm_medium: urlParams.get('utm_medium'),
          utm_campaign: urlParams.get('utm_campaign'),
          utm_content: urlParams.get('utm_content'),
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          linked_lead_id: testId,
          linked_lead_type: 'exit_readiness_test'
        });
      
      console.log('[ExitReadiness] New contact synced to contact_leads');
    } else {
      console.log('[ExitReadiness] Contact already exists, skipping sync');
    }
  } catch (err) {
    console.error('[ExitReadiness] Error syncing to contact_leads:', err);
    // Don't throw - this is a secondary operation
  }
}

// Trigger AI report generation without waiting for response
async function triggerAIReportGeneration(testId: string) {
  try {
    console.log('[ExitReadiness] Triggering AI report generation for test:', testId);
    
    const response = await supabase.functions.invoke('generate-exit-readiness-report', {
      body: { testId }
    });
    
    if (response.error) {
      console.error('[ExitReadiness] AI report generation failed:', response.error);
    } else {
      console.log('[ExitReadiness] AI report generation triggered successfully');
    }
  } catch (err) {
    console.error('[ExitReadiness] Error triggering AI report:', err);
    // Don't throw - this is a background operation
  }
}
