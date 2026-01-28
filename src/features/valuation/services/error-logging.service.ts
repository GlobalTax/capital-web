// ============= ERROR LOGGING SERVICE =============
// Captures calculator errors for monitoring and recovery

import { supabase } from '@/integrations/supabase/client';

export interface CalculatorError {
  id?: string;
  error_type: 'calculation' | 'submission' | 'validation' | 'network' | 'unknown';
  error_message: string;
  error_stack?: string;
  component: string;
  action: string;
  company_data?: any;
  current_step?: number;
  unique_token?: string;
  source_project?: string;
  user_agent?: string;
  created_at?: string;
}

export const errorLoggingService = {
  /**
   * Log a calculator error to the database
   * Also saves to localStorage as backup if DB fails
   */
  async logError(error: Omit<CalculatorError, 'id' | 'created_at' | 'user_agent'>): Promise<boolean> {
    const errorEntry: CalculatorError = {
      ...error,
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString()
    };

    console.error('[CALCULATOR_ERROR]', {
      type: error.error_type,
      component: error.component,
      action: error.action,
      message: error.error_message
    });

    // Always save to localStorage first (guaranteed persistence)
    this.saveToLocalStorage(errorEntry);

    try {
      // Attempt to save to database using raw insert to bypass type checking
      // (table created dynamically)
      const { error: dbError } = await supabase
        .from('calculator_errors' as any)
        .insert({
          error_type: errorEntry.error_type,
          error_message: errorEntry.error_message,
          error_stack: errorEntry.error_stack,
          component: errorEntry.component,
          action: errorEntry.action,
          company_data: errorEntry.company_data,
          current_step: errorEntry.current_step,
          unique_token: errorEntry.unique_token,
          source_project: errorEntry.source_project,
          user_agent: errorEntry.user_agent
        });

      if (dbError) {
        console.warn('[ERROR_LOG] Failed to save to DB, using localStorage:', dbError);
        return false;
      }

      console.log('[ERROR_LOG] Error logged to database');
      return true;
    } catch (e) {
      console.warn('[ERROR_LOG] Exception saving to DB:', e);
      return false;
    }
  },

  /**
   * Save error to localStorage as fallback
   */
  saveToLocalStorage(error: CalculatorError): void {
    try {
      const STORAGE_KEY = 'calculator_errors_log';
      const MAX_ERRORS = 50;

      const stored = localStorage.getItem(STORAGE_KEY);
      const errors: CalculatorError[] = stored ? JSON.parse(stored) : [];
      
      errors.unshift({
        ...error,
        id: `local_${Date.now()}`
      });

      // Keep only latest errors
      while (errors.length > MAX_ERRORS) {
        errors.pop();
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(errors));
    } catch (e) {
      console.error('[ERROR_LOG] Failed to save to localStorage:', e);
    }
  },

  /**
   * Get local errors for sync retry
   */
  getLocalErrors(): CalculatorError[] {
    try {
      const stored = localStorage.getItem('calculator_errors_log');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * Create an error handler wrapper for async operations
   */
  createHandler(component: string) {
    return {
      wrap: async <T>(
        action: string,
        fn: () => Promise<T>,
        context?: { companyData?: any; currentStep?: number; uniqueToken?: string; sourceProject?: string }
      ): Promise<T | null> => {
        try {
          return await fn();
        } catch (error) {
          const err = error as Error;
          
          await errorLoggingService.logError({
            error_type: 'unknown',
            error_message: err.message || 'Unknown error',
            error_stack: err.stack,
            component,
            action,
            company_data: context?.companyData ? {
              contactName: context.companyData.contactName,
              email: context.companyData.email,
              companyName: context.companyData.companyName
            } : undefined,
            current_step: context?.currentStep,
            unique_token: context?.uniqueToken,
            source_project: context?.sourceProject
          });

          throw error; // Re-throw to let caller handle
        }
      },

      logCalculationError: async (
        error: Error,
        companyData: any,
        currentStep: number,
        uniqueToken?: string
      ) => {
        await errorLoggingService.logError({
          error_type: 'calculation',
          error_message: error.message,
          error_stack: error.stack,
          component,
          action: 'calculateValuation',
          company_data: {
            contactName: companyData.contactName,
            email: companyData.email,
            companyName: companyData.companyName,
            industry: companyData.industry,
            revenue: companyData.revenue,
            ebitda: companyData.ebitda
          },
          current_step: currentStep,
          unique_token: uniqueToken
        });
      },

      logSubmissionError: async (
        error: Error,
        companyData: any,
        uniqueToken?: string
      ) => {
        await errorLoggingService.logError({
          error_type: 'submission',
          error_message: error.message,
          error_stack: error.stack,
          component,
          action: 'submitValuation',
          company_data: {
            contactName: companyData.contactName,
            email: companyData.email,
            companyName: companyData.companyName,
            phone: companyData.phone
          },
          unique_token: uniqueToken
        });
      },

      logNetworkError: async (
        error: Error,
        action: string,
        context?: any
      ) => {
        await errorLoggingService.logError({
          error_type: 'network',
          error_message: error.message,
          error_stack: error.stack,
          component,
          action,
          company_data: context
        });
      }
    };
  }
};

// Export a pre-configured handler for the calculator
export const calculatorErrorHandler = errorLoggingService.createHandler('UnifiedCalculator');
