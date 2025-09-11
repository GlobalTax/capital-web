import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateValuationPDFWithReactPDF } from '@/utils/reactPdfGenerator';
import { getPreferredLang } from '@/shared/i18n/locale';
import { CompanyData, ValuationResult } from '@/types/valuation';
import { useCentralizedErrorHandler } from '@/hooks/useCentralizedErrorHandler';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 5000
};

export const useOptimizedSupabaseValuation = () => {
  const { handleError, handleAsyncError } = useCentralizedErrorHandler();
  const [isProcessing, setIsProcessing] = useState(false);

  // Debug logging on initialization
  useEffect(() => {
    console.log('🔧 useOptimizedSupabaseValuation hook initialized');
  }, []);

  // Optimized retry mechanism
  const withRetry = async <T,> (
    operation: () => Promise<T>,
    context: string,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<T | null> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await Promise.race([
          operation(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Operation timeout')), 15000)
          )
        ]);
        
        if (attempt > 0) {
          console.log(`${context} succeeded on attempt ${attempt + 1}`);
        }
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < config.maxRetries) {
          const delay = Math.min(
            config.initialDelay * Math.pow(2, attempt),
            config.maxDelay
          );
          console.log(`${context} failed, retrying in ${delay}ms (attempt ${attempt + 1}/${config.maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`${context} failed after ${config.maxRetries + 1} attempts:`, lastError);
    handleError(lastError, { 
      component: 'OptimizedSupabaseValuation', 
      action: context 
    });
    return null;
  };

  // Optimized create initial valuation
  const { execute: executeCreateInitialValuation, loading: isCreating } = useAsyncOperation(
    async (stepOneData: Partial<CompanyData>) => {
      console.log('=== CREATING OPTIMIZED INITIAL VALUATION ===');
      console.log('📝 Step one data:', stepOneData);
      
      const insertData = {
        contact_name: stepOneData.contactName || '',
        company_name: stepOneData.companyName || '',
        cif: stepOneData.cif || null,
        email: stepOneData.email || '',
        phone: stepOneData.phone || null,
        phone_e164: stepOneData.phone_e164 || null,
        whatsapp_opt_in: stepOneData.whatsapp_opt_in || false,
        industry: stepOneData.industry || '',
        activity_description: stepOneData.activityDescription || null,
        employee_range: stepOneData.employeeRange || '',
        valuation_status: 'in_progress',
        completion_percentage: 25,
        current_step: 1
      };

      console.log('🚀 Invoking submit-valuation with data:', insertData);
      
      const response = await supabase.functions.invoke('submit-valuation', {
        body: insertData
      });

      console.log('📥 Submit valuation response:', response);

      if (response.error) {
        console.error('❌ Submit valuation error:', response.error);
        throw new Error(`Database error: ${response.error.message}`);
      }

      return response.data;
    },
    { 
      debounceMs: 500,
      retries: 2,
      timeout: 15000 
    }
  );

  const createInitialValuation = useCallback(async (stepOneData: Partial<CompanyData>) => {
    const result = await executeCreateInitialValuation(stepOneData);
    
    if (result?.success) {
      console.log('✅ Optimized initial valuation created:', result.uniqueToken);
      return { success: true, uniqueToken: result.uniqueToken };
    }
    
    return { success: false };
  }, [executeCreateInitialValuation]);

  // Optimized update valuation (with debouncing)
  const { execute: executeUpdateValuation, loading: isUpdating } = useAsyncOperation(
    async ({ uniqueToken, partialData }: { uniqueToken: string; partialData: Partial<CompanyData> }) => {
      console.log('=== UPDATING OPTIMIZED VALUATION ===');
      
      // Map data to database format efficiently
      const updateData: any = {};
      
      const fieldMap: { [K in keyof CompanyData]?: string } = {
        contactName: 'contact_name',
        companyName: 'company_name',
        cif: 'cif',
        email: 'email',
        phone: 'phone',
        phone_e164: 'phone_e164',
        whatsapp_opt_in: 'whatsapp_opt_in',
        industry: 'industry',
        activityDescription: 'activity_description',
        employeeRange: 'employee_range',
        revenue: 'revenue',
        ebitda: 'ebitda',
        hasAdjustments: 'has_adjustments',
        adjustmentAmount: 'adjustment_amount',
        location: 'location',
        ownershipParticipation: 'ownership_participation',
        competitiveAdvantage: 'competitive_advantage'
      };

      Object.entries(partialData).forEach(([key, value]) => {
        const dbField = fieldMap[key as keyof CompanyData];
        if (dbField && value !== undefined) {
          updateData[dbField] = value;
        }
      });

      // Calculate progress efficiently
      const completedFields = Object.values(partialData).filter(v => 
        v !== undefined && v !== null && v !== ''
      ).length;
      updateData.completion_percentage = Math.min(Math.max(completedFields * 8, 10), 75);
      updateData.valuation_status = 'in_progress';

      const response = await supabase.functions.invoke('update-valuation', {
        body: {
          uniqueToken,
          data: updateData
        }
      });

      if (response.error) {
        throw new Error(`Update error: ${response.error.message}`);
      }

      return response.data;
    },
    {
      debounceMs: 1000, // Debounce updates to avoid spam
      retries: 2,
      timeout: 10000
    }
  );

  const updateValuation = useCallback(async (uniqueToken: string, partialData: Partial<CompanyData>) => {
    const result = await executeUpdateValuation({ uniqueToken, partialData });
    return result?.success || false;
  }, [executeUpdateValuation]);

  // Optimized save valuation with background processing
  const saveValuation = useCallback(async (companyData: CompanyData, result: ValuationResult, uniqueToken?: string) => {
    console.log('🎯 saveValuation called with:', { 
      hasCompanyData: !!companyData, 
      hasResult: !!result, 
      uniqueToken,
      isProcessing 
    });

    if (isProcessing) {
      console.log('❌ Save already in progress, ignoring duplicate call');
      return { success: false };
    }

    setIsProcessing(true);

    try {
      console.log('=== SAVING OPTIMIZED FINAL VALUATION ===');
      console.log('📊 Company data:', companyData);
      console.log('📈 Result data:', result);

      // If no uniqueToken provided, create initial valuation first
      let finalUniqueToken = uniqueToken;
      if (!finalUniqueToken) {
        console.log('⚠️ No uniqueToken provided, creating initial valuation...');
        const initialResult = await createInitialValuation({
          contactName: companyData.contactName,
          companyName: companyData.companyName,
          email: companyData.email,
          cif: companyData.cif,
          phone: companyData.phone,
          industry: companyData.industry,
          employeeRange: companyData.employeeRange
        });
        
        if (initialResult.success && initialResult.uniqueToken) {
          finalUniqueToken = initialResult.uniqueToken;
          console.log('✅ Created initial valuation with token:', finalUniqueToken);
        } else {
          throw new Error('Failed to create initial valuation record');
        }
      }

      // Step 1: Save core valuation data (critical path)
      console.log('🔄 Starting core update with uniqueToken:', finalUniqueToken);
      
      const coreUpdateResult = await withRetry(async () => {
        if (finalUniqueToken) {
          const finalData = {
            // Core data
            contact_name: companyData.contactName || '',
            company_name: companyData.companyName || '',
            email: companyData.email || '',
            industry: companyData.industry || '',
            employee_range: companyData.employeeRange || '',
            revenue: companyData.revenue || null,
            ebitda: companyData.ebitda || null,
            // Results
            final_valuation: result.finalValuation || null,
            ebitda_multiple_used: result.multiples.ebitdaMultipleUsed || null,
            valuation_range_min: result.valuationRange.min || null,
            valuation_range_max: result.valuationRange.max || null,
            valuation_status: 'completed',
            completion_percentage: 100
          };

          console.log('🚀 Invoking update-valuation with:', { uniqueToken: finalUniqueToken, finalData });
          
          const response = await supabase.functions.invoke('update-valuation', {
            body: { uniqueToken: finalUniqueToken, data: finalData }
          });

          console.log('📥 Update valuation response:', response);

          if (response.error) {
            console.error('❌ Update valuation error:', response.error);
            throw new Error(`Failed to save valuation: ${response.error.message}`);
          }

          console.log('✅ Core valuation saved successfully');
          return response.data;
        } else {
          throw new Error('No unique token provided - this should not happen after fallback creation');
        }
      }, 'Core valuation save');

      if (!coreUpdateResult) {
        throw new Error('Failed to save core valuation data');
      }

      // Step 2: Background operations (non-blocking)
      // These will run asynchronously without blocking the user response
      setTimeout(async () => {
        try {
          console.log('Starting background operations...');

          // Background: Generate and send PDF
          await handleAsyncError(async () => {
            const lang = getPreferredLang();
            
            const pdfCompanyData = {
              contactName: companyData.contactName,
              companyName: companyData.companyName,
              cif: companyData.cif,
              email: companyData.email,
              phone: companyData.phone,
              industry: companyData.industry,
              yearsOfOperation: 5,
              employeeRange: companyData.employeeRange,
              revenue: companyData.revenue,
              ebitda: companyData.ebitda,
              netProfitMargin: 10,
              growthRate: 5,
              location: companyData.location,
              ownershipParticipation: companyData.ownershipParticipation,
              competitiveAdvantage: companyData.competitiveAdvantage
            };

            const blob = await generateValuationPDFWithReactPDF(pdfCompanyData, result, lang);
            const pdfBase64: string = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const dataUrl = reader.result as string;
                resolve((dataUrl.split(',')[1]) || '');
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });

            const pdfFilename = `Capittal-Valoracion-${(companyData.companyName || 'empresa').replace(/\s+/g, '-')}.pdf`;

            await supabase.functions.invoke('send-valuation-email', {
              body: {
                recipientEmail: companyData.email,
                companyData: companyData,
                result: result,
                pdfBase64,
                pdfFilename,
                enlaces: {
                  escenariosUrl: `${window.location.origin}/lp/calculadora`,
                  calculadoraFiscalUrl: `${window.location.origin}/lp/calculadora-fiscal`
                },
                sender: {
                  nombre: 'Equipo Capittal',
                  cargo: 'M&A',
                  firma: 'Capittal · Carrer Ausias March, 36 Principal · P.º de la Castellana, 11, B - A, Chamberí, 28046 Madrid'
                },
                subjectOverride: 'Valoración · PDF, escenarios y calculadora fiscal',
                lang
              }
            });

            console.log('Background email sent successfully');
          }, { component: 'OptimizedSupabaseValuation', action: 'backgroundEmail' });

          // Background: Sync with external systems
          await handleAsyncError(async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const syncData = {
              contact_name: companyData.contactName || '',
              company_name: companyData.companyName || '',
              email: companyData.email || '',
              industry: companyData.industry || '',
              final_valuation: result.finalValuation || null,
              utm_source: urlParams.get('utm_source') || undefined,
              utm_medium: urlParams.get('utm_medium') || undefined,
              utm_campaign: urlParams.get('utm_campaign') || undefined,
              referrer: document.referrer || undefined,
              source: 'lp-calculadora'
            };

            await supabase.functions.invoke('sync-leads', {
              body: {
                type: 'company_valuation',
                data: syncData
              }
            });

            console.log('Background sync completed successfully');
          }, { component: 'OptimizedSupabaseValuation', action: 'backgroundSync' });

        } catch (bgError) {
          console.error('Background operations error:', bgError);
        }
      }, 100); // Start background operations after 100ms

      return { success: true };
      
    } catch (error) {
      console.error('Save valuation error:', error);
      handleError(error as Error, { 
        component: 'OptimizedSupabaseValuation', 
        action: 'saveValuation' 
      });
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, handleError, handleAsyncError, withRetry]);

  // Tool rating (unchanged but optimized)
  const saveToolRating = useCallback(async (ratingData: any) => {
    return await handleAsyncError(async () => {
      const { data, error } = await supabase
        .from('tool_ratings')
        .insert({
          ease_of_use: ratingData.ease_of_use,
          result_accuracy: ratingData.result_accuracy,
          recommendation: ratingData.recommendation,
          feedback_comment: ratingData.feedback_comment,
          user_email: ratingData.user_email,
          company_sector: ratingData.company_sector,
          company_size: ratingData.company_size
        });

      if (error) throw error;
      return data;
    }, { component: 'OptimizedSupabaseValuation', action: 'saveToolRating' });
  }, [handleAsyncError]);

  return {
    createInitialValuation,
    updateValuation,
    saveValuation,
    saveToolRating,
    isCreating,
    isUpdating,
    isProcessing
  };
};
