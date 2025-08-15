import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyData } from '@/types/valuation';

interface AutosaveState {
  uniqueToken: string | null;
  lastSaved: Date | null;
  isSaving: boolean;
  currentStep: number;
  timeSpent: number;
  startTime: Date | null;
}

const STORAGE_KEY = 'valuation_v4_token';
const TOKEN_TTL = 48 * 60 * 60 * 1000; // 48 hours

export const useValuationAutosave = () => {
  const [state, setState] = useState<AutosaveState>({
    uniqueToken: null,
    lastSaved: null,
    isSaving: false,
    currentStep: 1,
    timeSpent: 0,
    startTime: null
  });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize token from localStorage on first load
  const initializeToken = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        if (data.token && data.timestamp && (now - data.timestamp) < TOKEN_TTL) {
          setState(prev => ({ ...prev, uniqueToken: data.token }));
          return data.token;
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('Error initializing autosave token:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  }, []);

  // Save token to localStorage with TTL
  const saveTokenToStorage = useCallback((token: string) => {
    try {
      const data = {
        token,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Error saving token to localStorage:', error);
    }
  }, []);

  // Create initial valuation record INMEDIATAMENTE cuando se complete el primer campo
  const createInitialValuation = useCallback(async (initialData: Partial<CompanyData>): Promise<string | null> => {
    try {
      setState(prev => ({ ...prev, isSaving: true }));

      // Obtener datos del primer campo completado
      const minimalData = {
        contact_name: initialData.contactName || '',
        company_name: initialData.companyName || '',
        cif: initialData.cif || null,
        email: initialData.email || '',
        phone: initialData.phone || null,
        industry: initialData.industry || '',
        employee_range: initialData.employeeRange || '',
        activity_description: initialData.activityDescription || null,
        location: initialData.location || null,
        ownership_participation: initialData.ownershipParticipation || null,
        competitive_advantage: initialData.competitiveAdvantage || null,
        revenue: initialData.revenue || null,
        ebitda: initialData.ebitda || null
      };

      const { data, error } = await supabase.functions.invoke('submit-valuation', {
        body: minimalData
      });

      if (error) {
        console.error('Error creating initial valuation:', error);
        return null;
      }

      const token = data?.uniqueToken;
      if (token) {
        setState(prev => ({ 
          ...prev, 
          uniqueToken: token, 
          lastSaved: new Date(),
          isSaving: false 
        }));
        saveTokenToStorage(token);
        console.log('Initial valuation created with token:', token);
        return token;
      }

      setState(prev => ({ ...prev, isSaving: false }));
      return null;
    } catch (error) {
      console.error('Exception creating initial valuation:', error);
      setState(prev => ({ ...prev, isSaving: false }));
      return null;
    }
  }, [saveTokenToStorage]);

  // Crear valuación automáticamente en el primer campo completado
  const createInitialValuationOnFirstField = useCallback(async (field: keyof CompanyData, value: any, allData: CompanyData): Promise<string | null> => {
    // Solo crear si no existe token y el valor no está vacío
    if (state.uniqueToken || !value || value === '') {
      return state.uniqueToken;
    }

    console.log(`Primer campo completado: ${field} = ${value}. Creando valoración inicial...`);
    const token = await createInitialValuation(allData);
    
    // Start timing when first field is completed
    if (token) {
      setState(prev => ({ ...prev, startTime: new Date() }));
    }
    
    return token;
  }, [state.uniqueToken, createInitialValuation]);

  // Update existing valuation record (debounced)
  const updateValuation = useCallback((partialData: Partial<CompanyData>, field?: string) => {
    const token = state.uniqueToken;
    if (!token) {
      console.warn('No token available for autosave update');
      return;
    }

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounced update
    debounceRef.current = setTimeout(async () => {
      try {
        setState(prev => ({ ...prev, isSaving: true }));

        // Calculate time spent if we have a start time
        const timeSpentSeconds = state.startTime 
          ? Math.floor((Date.now() - state.startTime.getTime()) / 1000)
          : state.timeSpent;

        const updateData = {
          ...partialData,
          timeSpentSeconds,
          lastModifiedField: field || 'unknown'
        };

        const { data, error } = await supabase.functions.invoke('update-valuation', {
          body: {
            uniqueToken: token,
            data: updateData
          }
        });

        if (error) {
          console.error('Error updating valuation:', error);
        } else {
          console.log('Valuation updated successfully:', data);
          setState(prev => ({ 
            ...prev, 
            lastSaved: new Date(),
            timeSpent: timeSpentSeconds
          }));
        }
      } catch (error) {
        console.error('Exception updating valuation:', error);
      } finally {
        setState(prev => ({ ...prev, isSaving: false }));
      }
    }, 600); // 600ms debounce
  }, [state.uniqueToken, state.startTime, state.timeSpent]);

  // Final update with calculation results
  const finalizeValuation = useCallback(async (finalData: Partial<CompanyData> & {
    finalValuation?: number;
    ebitdaMultipleUsed?: number;
    valuationRangeMin?: number;
    valuationRangeMax?: number;
  }) => {
    const token = state.uniqueToken;
    if (!token) {
      console.warn('No token available for final update');
      return false;
    }

    try {
      setState(prev => ({ ...prev, isSaving: true }));

      const { data, error } = await supabase.functions.invoke('update-valuation', {
        body: {
          uniqueToken: token,
          data: finalData
        }
      });

      if (error) {
        console.error('Error finalizing valuation:', error);
        return false;
      }

      console.log('Valuation finalized successfully:', data);
      setState(prev => ({ ...prev, lastSaved: new Date(), isSaving: false }));
      return true;
    } catch (error) {
      console.error('Exception finalizing valuation:', error);
      setState(prev => ({ ...prev, isSaving: false }));
      return false;
    }
  }, [state.uniqueToken]);

  // Update step tracking
  const updateStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
    if (state.uniqueToken) {
      // Send step update directly to avoid type issues
      const updateData = {
        currentStep: step,
        timeSpentSeconds: state.startTime 
          ? Math.floor((Date.now() - state.startTime.getTime()) / 1000)
          : state.timeSpent,
        lastModifiedField: 'step_change'
      };
      
      supabase.functions.invoke('update-valuation', {
        body: {
          uniqueToken: state.uniqueToken,
          data: updateData
        }
      }).then(({ error }) => {
        if (error) {
          console.error('Error updating step:', error);
        }
      });
    }
  }, [state.uniqueToken, state.startTime, state.timeSpent]);

  // Clear autosave data
  const clearAutosave = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setState({
        uniqueToken: null,
        lastSaved: null,
        isSaving: false,
        currentStep: 1,
        timeSpent: 0,
        startTime: null
      });
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    } catch (error) {
      console.warn('Error clearing autosave:', error);
    }
  }, []);

  return {
    // State
    uniqueToken: state.uniqueToken,
    lastSaved: state.lastSaved,
    isSaving: state.isSaving,
    currentStep: state.currentStep,
    timeSpent: state.timeSpent,
    hasExistingSession: Boolean(state.uniqueToken),

    // Actions
    initializeToken,
    createInitialValuation,
    createInitialValuationOnFirstField,
    updateValuation,
    finalizeValuation,
    updateStep,
    clearAutosave
  };
};