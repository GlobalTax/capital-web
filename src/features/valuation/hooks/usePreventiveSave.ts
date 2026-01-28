// ============= PREVENTIVE SAVE HOOK =============
// Saves contact data early in the flow to prevent lead loss

import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedCompanyData } from '../types/unified.types';
import { useLocalStorageBackup } from './useLocalStorageBackup';
import { errorLoggingService } from '../services/error-logging.service';

interface PreventiveSaveResult {
  success: boolean;
  token?: string;
  error?: string;
}

interface PreventiveSaveOptions {
  sourceProject?: string;
  leadSource?: string;
}

export const usePreventiveSave = (options: PreventiveSaveOptions = {}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [savedToken, setSavedToken] = useState<string | null>(null);
  const hasSavedRef = useRef(false);
  const { saveBackup, markAsSynced, markWithError } = useLocalStorageBackup(options.sourceProject);

  /**
   * Generate a unique token for the valuation
   */
  const generateToken = useCallback(() => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }, []);

  /**
   * Get IP address (with fallback)
   */
  const getIPAddress = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json', { 
        signal: AbortSignal.timeout(3000) 
      });
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  }, []);

  /**
   * Save contact data as early lead (Step 1 → Step 2 transition)
   * This ensures we capture the contact even if calculation fails later
   */
  const saveEarlyLead = useCallback(async (
    companyData: Partial<ExtendedCompanyData>,
    currentStep: number
  ): Promise<PreventiveSaveResult> => {
    // Don't save if we already have a token
    if (hasSavedRef.current && savedToken) {
      return { success: true, token: savedToken };
    }

    // Must have at least email or phone to be a valid lead
    if (!companyData.email && !companyData.phone) {
      return { success: false, error: 'No contact info' };
    }

    setIsSaving(true);
    const token = generateToken();
    
    // First: Save to localStorage as backup
    const backupId = saveBackup(companyData, currentStep, token);
    
    console.log('[PREVENTIVE_SAVE] Saving early lead...', {
      email: companyData.email,
      step: currentStep
    });

    try {
      const ipAddress = await getIPAddress();
      
      const insertData = {
        unique_token: token,
        contact_name: companyData.contactName || '',
        company_name: companyData.companyName || '',
        email: companyData.email || '',
        phone: companyData.phone || '',
        phone_e164: companyData.phone_e164 || '',
        industry: companyData.industry || '',
        employee_range: companyData.employeeRange || '',
        revenue: companyData.revenue || 0,
        ebitda: companyData.ebitda || 0,
        location: companyData.location || '',
        whatsapp_opt_in: companyData.whatsapp_opt_in || false,
        valuation_status: 'early_capture',
        current_step: currentStep,
        completion_percentage: Math.round((currentStep / 4) * 100),
        source_project: options.sourceProject || 'capittal-main',
        lead_source: options.leadSource || null,
        ip_address: ipAddress,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        landing_url: window.location.href
      };

      const { error } = await supabase
        .from('company_valuations')
        .insert(insertData);

      if (error) {
        console.error('[PREVENTIVE_SAVE] DB error:', error);
        markWithError(backupId, error.message);
        
        // Log the error
        await errorLoggingService.logError({
          error_type: 'submission',
          error_message: `Preventive save failed: ${error.message}`,
          component: 'usePreventiveSave',
          action: 'saveEarlyLead',
          company_data: {
            email: companyData.email,
            contactName: companyData.contactName,
            companyName: companyData.companyName
          },
          current_step: currentStep,
          unique_token: token,
          source_project: options.sourceProject
        });

        return { success: false, error: error.message };
      }

      // Success: Mark backup as synced
      markAsSynced(backupId);
      setSavedToken(token);
      hasSavedRef.current = true;

      console.log('[PREVENTIVE_SAVE] Lead saved successfully:', token);
      
      return { success: true, token };
    } catch (err) {
      const error = err as Error;
      console.error('[PREVENTIVE_SAVE] Exception:', error);
      markWithError(backupId, error.message);
      
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
    }
  }, [savedToken, generateToken, getIPAddress, saveBackup, markAsSynced, markWithError, options]);

  /**
   * Update existing early lead with more data
   */
  const updateEarlyLead = useCallback(async (
    token: string,
    updates: Partial<ExtendedCompanyData>,
    currentStep: number
  ): Promise<boolean> => {
    try {
      // Update localStorage backup
      saveBackup(updates, currentStep, token);

      const updateData: Record<string, any> = {
        current_step: currentStep,
        completion_percentage: Math.round((currentStep / 4) * 100),
        last_activity_at: new Date().toISOString()
      };

      // Map fields
      if (updates.contactName !== undefined) updateData.contact_name = updates.contactName;
      if (updates.companyName !== undefined) updateData.company_name = updates.companyName;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.phone_e164 !== undefined) updateData.phone_e164 = updates.phone_e164;
      if (updates.industry !== undefined) updateData.industry = updates.industry;
      if (updates.employeeRange !== undefined) updateData.employee_range = updates.employeeRange;
      if (updates.revenue !== undefined) updateData.revenue = updates.revenue;
      if (updates.ebitda !== undefined) updateData.ebitda = updates.ebitda;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.whatsapp_opt_in !== undefined) updateData.whatsapp_opt_in = updates.whatsapp_opt_in;

      const { error } = await supabase
        .from('company_valuations')
        .update(updateData)
        .eq('unique_token', token);

      if (error) {
        console.error('[PREVENTIVE_SAVE] Update failed:', error);
        return false;
      }

      console.log('[PREVENTIVE_SAVE] Lead updated:', token);
      return true;
    } catch (err) {
      console.error('[PREVENTIVE_SAVE] Update exception:', err);
      return false;
    }
  }, [saveBackup]);

  /**
   * Finalize the lead when calculation completes
   */
  const finalizeLead = useCallback(async (
    token: string,
    result: any
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('company_valuations')
        .update({
          final_valuation: result.finalValuation,
          ebitda_multiple_used: result.multiples?.ebitdaMultipleUsed,
          valuation_range_min: result.valuationRange?.min,
          valuation_range_max: result.valuationRange?.max,
          valuation_status: 'completed',
          completion_percentage: 100,
          last_activity_at: new Date().toISOString()
        })
        .eq('unique_token', token);

      if (error) {
        console.error('[PREVENTIVE_SAVE] Finalize failed:', error);
        return false;
      }

      console.log('[PREVENTIVE_SAVE] Lead finalized:', token);
      return true;
    } catch (err) {
      console.error('[PREVENTIVE_SAVE] Finalize exception:', err);
      return false;
    }
  }, []);

  /**
   * Reset for a new session
   */
  const reset = useCallback(() => {
    setSavedToken(null);
    hasSavedRef.current = false;
  }, []);

  return {
    saveEarlyLead,
    updateEarlyLead,
    finalizeLead,
    reset,
    isSaving,
    savedToken,
    hasSaved: hasSavedRef.current
  };
};
