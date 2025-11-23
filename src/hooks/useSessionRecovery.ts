import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedCompanyData } from '@/features/valuation/types/unified.types';

// ============= TYPES =============
export interface SessionRecoveryOptions {
  onRecover: (data: RecoveredSessionData) => void;
  onDismiss: () => void;
  autoShow?: boolean;
  storageKey?: string;
  tokenTTL?: number;
}

export interface RecoveredSessionData {
  token: string;
  companyData: ExtendedCompanyData;
  metadata: {
    created_at: string;
    current_step: number;
    completion_percentage: number;
    time_spent?: number;
    last_modified_field?: string;
  };
}

// ============= CONSTANTS =============
const DEFAULT_STORAGE_KEY = 'valuation_v4_token';
const DEFAULT_TOKEN_TTL = 48 * 60 * 60 * 1000; // 48 hours

// ============= HOOK =============
export const useSessionRecovery = (options: SessionRecoveryOptions) => {
  const {
    onRecover,
    onDismiss,
    autoShow = true,
    storageKey = DEFAULT_STORAGE_KEY,
    tokenTTL = DEFAULT_TOKEN_TTL
  } = options;

  const [hasRecoverableSession, setHasRecoverableSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [sessionData, setSessionData] = useState<RecoveredSessionData | null>(null);
  const [showModal, setShowModal] = useState(false);

  // ============= VALIDATION HELPERS =============
  const isTokenExpired = useCallback((timestamp: number): boolean => {
    return (Date.now() - timestamp) >= tokenTTL;
  }, [tokenTTL]);

  const hasSignificantData = useCallback((valuation: any): boolean => {
    // At least one of these fields must be filled
    return Boolean(
      valuation.contact_name || 
      valuation.email || 
      valuation.company_name ||
      valuation.revenue ||
      valuation.ebitda
    );
  }, []);

  // ============= CLEAR SESSION =============
  const clearStoredSession = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      console.log('🧹 Session storage cleared');
    } catch (error) {
      console.warn('Error clearing session storage:', error);
    }
  }, [storageKey]);

  // ============= TRACK EVENTS =============
  const trackRecoveryEvent = useCallback((eventType: string, data?: any) => {
    console.log(`📊 Session Recovery Event: ${eventType}`, data);
    
    // TODO: Implement analytics tracking if needed
    // Can be extended to send to analytics service
  }, []);

  // ============= RECOVER SESSION =============
  const recoverSession = useCallback(() => {
    if (!sessionData) return;

    trackRecoveryEvent('session_recovery_accepted', {
      previous_step: sessionData.metadata.current_step,
      completion: sessionData.metadata.completion_percentage
    });

    onRecover(sessionData);
    setShowModal(false);
  }, [sessionData, onRecover, trackRecoveryEvent]);

  // ============= DISMISS SESSION =============
  const dismissSession = useCallback(() => {
    if (sessionData) {
      trackRecoveryEvent('session_recovery_rejected', {
        reason: 'user_dismissed',
        step: sessionData.metadata.current_step
      });
    }

    clearStoredSession();
    onDismiss();
    setShowModal(false);
  }, [sessionData, clearStoredSession, onDismiss, trackRecoveryEvent]);

  // ============= CHECK FOR RECOVERABLE SESSION =============
  const checkForRecoverableSession = useCallback(async () => {
    setIsChecking(true);

    try {
      // Case 1: Check localStorage
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        console.log('ℹ️ No stored token found');
        setIsChecking(false);
        return;
      }

      const data = JSON.parse(stored);

      // Case 2: Validate token expiration
      if (!data.token || !data.timestamp || isTokenExpired(data.timestamp)) {
        console.log('⏰ Token expired, clearing storage');
        clearStoredSession();
        setIsChecking(false);
        return;
      }

      // Case 3: Query database for valuation
      const { data: valuation, error } = await supabase
        .from('company_valuations')
        .select('*')
        .eq('unique_token', data.token)
        .single();

      if (error || !valuation) {
        console.log('❌ Valuation not found in database');
        clearStoredSession();
        setIsChecking(false);
        return;
      }

      // Case 4: Check if completed
      if (valuation.final_valuation !== null) {
        console.log('✅ Valuation already completed, clearing storage');
        clearStoredSession();
        setIsChecking(false);
        return;
      }

      // Case 5: Check for significant data
      if (!hasSignificantData(valuation)) {
        console.log('⚠️ No significant data found, clearing storage');
        clearStoredSession();
        setIsChecking(false);
        return;
      }

      // ✅ VALID SESSION FOUND
      const recoveredData: RecoveredSessionData = {
        token: data.token,
        companyData: {
          contactName: valuation.contact_name || '',
          companyName: valuation.company_name || '',
          cif: valuation.cif || '',
          email: valuation.email || '',
          phone: valuation.phone || '',
          phone_e164: valuation.phone_e164 || '',
          whatsapp_opt_in: valuation.whatsapp_opt_in ?? true,
          industry: valuation.industry || '',
          activityDescription: valuation.activity_description || '',
          employeeRange: valuation.employee_range || '',
          revenue: valuation.revenue || 0,
          ebitda: valuation.ebitda || 0,
          hasAdjustments: valuation.has_adjustments ?? false,
          adjustmentAmount: valuation.adjustment_amount || 0,
          location: valuation.location || '',
          ownershipParticipation: valuation.ownership_participation || '',
          competitiveAdvantage: valuation.competitive_advantage || ''
        },
        metadata: {
          created_at: valuation.created_at,
          current_step: valuation.current_step || 1,
          completion_percentage: valuation.completion_percentage || 0,
          time_spent: valuation.time_spent_seconds || 0,
          last_modified_field: valuation.last_modified_field || ''
        }
      };

      setSessionData(recoveredData);
      setHasRecoverableSession(true);

      // Track modal shown event
      trackRecoveryEvent('session_recovery_modal_shown', {
        step: recoveredData.metadata.current_step,
        completion: recoveredData.metadata.completion_percentage,
        time_since_abandonment: calculateTimeSinceAbandonment(recoveredData.metadata.created_at)
      });

      // Auto-show modal if enabled
      if (autoShow) {
        setShowModal(true);
      }

      console.log('🎯 Recoverable session found:', {
        token: data.token.substring(0, 12) + '...',
        company: valuation.company_name,
        step: valuation.current_step,
        completion: valuation.completion_percentage
      });

    } catch (error) {
      console.error('Error checking for recoverable session:', error);
      // Case 6: Network error - silently fail, keep token
    } finally {
      setIsChecking(false);
    }
  }, [storageKey, isTokenExpired, clearStoredSession, hasSignificantData, autoShow, trackRecoveryEvent]);

  // ============= HELPERS =============
  const calculateTimeSinceAbandonment = (createdAt: string): number => {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  };

  // ============= INITIALIZATION =============
  useEffect(() => {
    checkForRecoverableSession();
  }, [checkForRecoverableSession]);

  // ============= RETURN =============
  return {
    // State
    hasRecoverableSession,
    isChecking,
    sessionData,
    
    // UI
    showModal,
    setShowModal,
    
    // Actions
    recoverSession,
    dismissSession,
    clearStoredSession
  };
};
