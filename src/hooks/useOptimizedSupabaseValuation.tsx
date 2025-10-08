import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateValuationPDFWithReactPDF } from '@/utils/reactPdfGenerator';
import { getPreferredLang } from '@/shared/i18n/locale';
import { CompanyData, ValuationResult } from '@/types/valuation';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  initialDelay: 1000,
  maxDelay: 3000
};

export const useOptimizedSupabaseValuation = () => {
  const { handleError, handleAsyncError } = useErrorHandler();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreatingInitial, setIsCreatingInitial] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);

  // Debug logging on initialization
  useEffect(() => {
    console.log('🔧 useOptimizedSupabaseValuation hook initialized (simplified post-Exchange)');
  }, []);

  // Helper function for IP address
  const getIPAddress = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  };

  // Simplified retry mechanism
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
            setTimeout(() => reject(new Error('Operation timeout')), 12000)
          )
        ]);
        
        if (attempt > 0) {
          console.log(`✅ ${context} succeeded on attempt ${attempt + 1}`);
        }
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < config.maxRetries) {
          const delay = Math.min(
            config.initialDelay * Math.pow(2, attempt),
            config.maxDelay
          );
          console.log(`⏳ ${context} failed, retrying in ${delay}ms (attempt ${attempt + 1}/${config.maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`❌ ${context} failed after ${config.maxRetries + 1} attempts:`, lastError);
    return null;
  };

  // SIMPLIFIED createInitialValuation without debouncing or useAsyncOperation
  const createInitialValuation = useCallback(async (stepOneData: Partial<CompanyData>) => {
    // Protección crítica contra ejecuciones concurrentes
    if (isCreatingInitial) {
      console.warn('🚫 BLOCKED: createInitialValuation already in progress');
      throw new Error('Ya se está creando una valoración. Por favor, espere.');
    }

    console.log('=== CREATING INITIAL VALUATION (SIMPLIFIED POST-EXCHANGE) ===');
    console.log('📝 Step one data:', stepOneData);
    console.log('🔒 Setting protection lock...');
    
    // Validación previa
    if (!stepOneData.contactName || !stepOneData.email || !stepOneData.companyName) {
      throw new Error('Campos obligatorios faltantes: contactName, email o companyName');
    }
    
    if (!stepOneData.email.includes('@') || stepOneData.email.length < 5) {
      throw new Error('Formato de email inválido');
    }

    setIsCreatingInitial(true);
    setCurrentOperation('creating_initial_valuation');
    
    try {
      // MÉTODO PRINCIPAL: Inserción directa (más confiable post-migración Exchange)
      const fallbackData = {
        contact_name: stepOneData.contactName,
        company_name: stepOneData.companyName,
        email: stepOneData.email,
        phone: stepOneData.phone || '',
        phone_e164: stepOneData.phone_e164 || '',
        whatsapp_opt_in: stepOneData.whatsapp_opt_in || false,
        cif: stepOneData.cif || '',
        industry: stepOneData.industry || '',
        activity_description: stepOneData.activityDescription || '',
        employee_range: stepOneData.employeeRange || '',
        valuation_status: 'in_progress',
        completion_percentage: 25,
        current_step: 1,
        ip_address: await getIPAddress(),
        user_agent: navigator.userAgent
      };
      
      console.log('🎯 TRYING PRIMARY METHOD: Direct database insertion');
      console.log('📤 Data to insert:', fallbackData);
      
      const { data: insertData, error: insertError } = await supabase
        .from('company_valuations')
        .insert(fallbackData)
        .select('unique_token, id')
        .single();
      
      if (insertError) {
        console.error('❌ Direct insertion failed:', insertError);
        console.error('❌ Error code:', insertError.code);
        console.error('❌ Error details:', insertError.details);
        console.error('❌ Error hint:', insertError.hint);
        
        // MÉTODO SECUNDARIO: Edge function como fallback
        console.log('🔄 TRYING FALLBACK: Edge function submit-valuation');
        
        const edgeFunctionData = {
          contact_name: stepOneData.contactName || '',
          company_name: stepOneData.companyName || '',
          cif: stepOneData.cif || '',
          email: stepOneData.email || '',
          phone: stepOneData.phone || '',
          phone_e164: stepOneData.phone_e164 || '',
          whatsapp_opt_in: stepOneData.whatsapp_opt_in || false,
          industry: stepOneData.industry || '',
          activity_description: stepOneData.activityDescription || '',
          employee_range: stepOneData.employeeRange || '',
          valuation_status: 'in_progress',
          completion_percentage: 25,
          current_step: 1
        };

        console.log('🚀 Invoking submit-valuation edge function:', edgeFunctionData);

        const response = await supabase.functions.invoke('submit-valuation', {
          body: edgeFunctionData
        });

        console.log('📥 Edge function response:', { data: response.data, error: response.error });

        if (response.error || !response.data?.success) {
          console.error('❌ Edge function also failed:', response.error);
          throw new Error(
            `Ambos métodos fallaron.\n` +
            `Inserción directa: ${insertError.message}\n` +
            `Edge function: ${response.error?.message || 'respuesta inválida'}\n` +
            `Esto puede deberse a la configuración post-migración Exchange.`
          );
        }

        console.log('✅ Valoración inicial creada via edge function (fallback):', response.data.uniqueToken);
        return { success: true, uniqueToken: response.data.uniqueToken };
      }
      
      if (insertData?.unique_token) {
        console.log('✅ Valoración inicial creada via inserción directa (método principal):', insertData.unique_token);
        return { success: true, uniqueToken: insertData.unique_token, insertedId: insertData.id };
      } else {
        throw new Error('Inserción directa completada pero no se obtuvo unique_token');
      }
    } catch (error) {
      console.error('💥 createInitialValuation failed completely:', error);
      handleError(error instanceof Error ? error : new Error('Unknown error'), { 
        component: 'OptimizedSupabaseValuation', 
        action: 'createInitialValuation'
      });
      throw error;
    } finally {
      console.log('🔓 Releasing protection lock...');
      setIsCreatingInitial(false);
      setCurrentOperation(null);
    }
  }, [isCreatingInitial, handleError]);

  // Optimized update valuation
  const updateValuation = useCallback(async (uniqueToken: string, partialData: Partial<CompanyData>) => {
    console.log('=== UPDATING VALUATION (POST-EXCHANGE) ===');
    console.log('📝 Partial data:', partialData);
    console.log('🎫 Token:', uniqueToken);
    
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

    const result = await withRetry(async () => {
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
    }, 'Valuation update');

    return result?.success || false;
  }, [withRetry]);

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
    setCurrentOperation('saving_final_valuation');

    try {
      console.log('=== SAVING FINAL VALUATION (POST-EXCHANGE) ===');
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
          console.log('🔄 Starting background operations (post-Exchange)...');

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

            console.log('📧 Sending valuation email (post-Exchange)...');
            const emailResponse = await supabase.functions.invoke('send-valuation-email', {
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

            console.log('📧 Email response:', emailResponse);
            if (emailResponse.error) {
              console.warn('⚠️ Email sending failed (possibly Exchange-related):', emailResponse.error);
            } else {
              console.log('✅ Background email sent successfully');
            }
          }, { component: 'OptimizedSupabaseValuation', action: 'backgroundEmail' });

          // Background: Meta Pixel Advanced Matching
          await handleAsyncError(async () => {
            if (typeof (window as any).fbq === 'function') {
              const fbq = (window as any).fbq;
              
              // Extraer ciudad de location (formato: "Ciudad, Provincia")
              const city = companyData.location?.split(',')[0]?.trim().toLowerCase() || '';
              
              // Preparar datos de Advanced Matching
              const advancedMatchingData = {
                em: companyData.email?.toLowerCase().trim(),
                ph: companyData.phone?.replace(/\s+/g, ''),
                fn: companyData.contactName?.split(' ')[0]?.toLowerCase().trim(),
                ln: companyData.contactName?.split(' ').slice(1).join(' ')?.toLowerCase().trim(),
                ct: city,
                country: 'es'
              };
              
              // Enviar evento Lead con Advanced Matching
              fbq('track', 'Lead', {
                content_name: 'Valoración de Empresa',
                content_category: companyData.industry || 'General',
                value: result.finalValuation || 0,
                currency: 'EUR'
              }, advancedMatchingData);
              
              console.log('✅ [Tracking] Meta Pixel Lead event sent with Advanced Matching:', {
                hasEmail: !!advancedMatchingData.em,
                hasPhone: !!advancedMatchingData.ph,
                hasName: !!advancedMatchingData.fn,
                hasCity: !!advancedMatchingData.ct
              });
            } else {
              console.warn('⚠️ [Tracking] Meta Pixel not loaded, skipping Lead event');
            }
          }, { component: 'OptimizedSupabaseValuation', action: 'metaPixelTracking' });

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

            const syncResponse = await supabase.functions.invoke('sync-leads', {
              body: {
                type: 'company_valuation',
                data: syncData
              }
            });

            console.log('🔄 Sync response:', syncResponse);
            if (syncResponse.error) {
              console.warn('⚠️ Sync failed (possibly Exchange-related):', syncResponse.error);
            } else {
              console.log('✅ Background sync completed successfully');
            }
          }, { component: 'OptimizedSupabaseValuation', action: 'backgroundSync' });

        } catch (bgError) {
          console.error('💥 Background operations error (post-Exchange):', bgError);
        }
      }, 100); // Start background operations after 100ms

      return { success: true };
      
    } catch (error) {
      console.error('💥 saveValuation failed:', error);
      handleError(error instanceof Error ? error : new Error('Unknown error'), { 
        component: 'OptimizedSupabaseValuation', 
        action: 'saveValuation'
      });
      return { success: false };
    } finally {
      setIsProcessing(false);
      setCurrentOperation(null);
    }
  }, [isProcessing, createInitialValuation, withRetry, handleError, handleAsyncError]);

  // Utility to save a rating
  const saveToolRating = useCallback(async (ratingData: any) => {
    console.log('💯 Saving tool rating:', ratingData);
    
    try {
      const fullRatingData = {
        ...ratingData,
        ip_address: await getIPAddress(),
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tool_ratings')
        .insert(fullRatingData);

      if (error) {
        console.error('❌ Failed to save rating:', error);
        throw error;
      }

      console.log('✅ Rating saved successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 saveToolRating failed:', error);
      handleError(error instanceof Error ? error : new Error('Unknown error'), { 
        component: 'OptimizedSupabaseValuation', 
        action: 'saveToolRating' 
      });
      throw error;
    }
  }, [handleError]);

  return {
    createInitialValuation,
    updateValuation,
    saveValuation,
    saveToolRating,
    isProcessing: isProcessing || isCreatingInitial,
    currentOperation,
    // Debug info for troubleshooting
    debugInfo: {
      isProcessing,
      isCreatingInitial,
      currentOperation
    }
  };
};