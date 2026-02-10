import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyData } from '@/types/valuation';
import { useLeadTracking } from './useLeadTracking';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/utils/storageWithFallback';

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
  const { trackValuationCompleted } = useLeadTracking();
  const { user, session } = useAuth();

  // Initialize token from storage on first load with session recovery
  const initializeToken = useCallback(() => {
    try {
      console.log('🔍 [AUTOSAVE] Inicializando token desde storage...');
      const stored = storage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        if (data.token && data.timestamp && (now - data.timestamp) < TOKEN_TTL) {
          setState(prev => ({ ...prev, uniqueToken: data.token }));
          console.log('✅ [AUTOSAVE] Sesión recuperada con token:', data.token.substring(0, 12) + '...');
          return data.token;
        } else {
          storage.removeItem(STORAGE_KEY);
          console.log('⏰ [AUTOSAVE] Token expirado, removido del storage');
        }
      } else {
        console.log('ℹ️ [AUTOSAVE] No hay token guardado');
      }
    } catch (error) {
      console.warn('❌ [AUTOSAVE] Error inicializando token:', error);
      storage.removeItem(STORAGE_KEY);
    }
    return null;
  }, []);

  // Save token to storage with TTL
  const saveTokenToStorage = useCallback((token: string) => {
    try {
      const data = {
        token,
        timestamp: Date.now()
      };
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('💾 [AUTOSAVE] Token guardado en storage:', token.substring(0, 12) + '...');
    } catch (error) {
      console.warn('❌ [AUTOSAVE] Error guardando token en storage:', error);
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

  // FASE 1: Crear valuación en CUALQUIER campo (no solo críticos)
  const createInitialValuationOnFirstField = useCallback(async (
    field: keyof CompanyData, 
    value: any, 
    allData: CompanyData,
    utmData?: { utm_source?: string | null; utm_medium?: string | null; utm_campaign?: string | null; referrer?: string | null }
  ): Promise<string | null> => {
    console.log('🔍 [AUTOSAVE] Intentando crear valoración inicial');
    console.log('🔍 [AUTOSAVE] Campo:', field, 'Valor:', value);
    console.log('🔍 [AUTOSAVE] Token actual:', state.uniqueToken);
    
    // CAMBIO FASE 1: Guardar en CUALQUIER campo, no solo los 3 críticos
    // Esto captura muchos más abandonos tempranos
    const allFields: (keyof CompanyData)[] = [
      'contactName', 'companyName', 'email', 'phone', 'cif',
      'industry', 'employeeRange', 'activityDescription',
      'revenue', 'ebitda', 'location', 'ownershipParticipation', 'competitiveAdvantage'
    ];
    
    // Si ya tenemos token, no crear uno nuevo
    if (state.uniqueToken) {
      console.log('ℹ️ [AUTOSAVE] Ya existe token, saltando creación inicial');
      return state.uniqueToken;
    }
    
    // Verificar que sea un campo válido
    if (!allFields.includes(field)) {
      console.warn('⚠️ [AUTOSAVE] Campo no válido:', field);
      return null;
    }

    // MEJORA: Reducir validación a 1 carácter mínimo para capturar más abandonos
    if (!value || 
        (typeof value === 'string' && value.trim().length < 1) ||
        (typeof value === 'number' && value <= 0)) {
      console.warn('⚠️ [AUTOSAVE] Valor vacío o inválido:', value);
      return null;
    }

    console.log(`✅ [AUTOSAVE] Validaciones pasadas, iniciando creación...`);
    console.log(`🚀 [AUTOSAVE] Primer campo completado: ${field} = "${value}"`);
    
    try {
      setState(prev => ({ ...prev, isSaving: true }));

      // Preparar datos mínimos incluyendo UTMs
      const minimalData = {
        contact_name: allData.contactName || (field === 'contactName' ? value : ''),
        company_name: allData.companyName || (field === 'companyName' ? value : ''),
        cif: allData.cif || (field === 'cif' ? value : null),
        email: allData.email || (field === 'email' ? value : ''),
        phone: allData.phone || (field === 'phone' ? value : null),
        industry: allData.industry || (field === 'industry' ? value : ''),
        employee_range: allData.employeeRange || (field === 'employeeRange' ? value : ''),
        activity_description: allData.activityDescription || (field === 'activityDescription' ? value : null),
        location: allData.location || (field === 'location' ? value : null),
        ownership_participation: allData.ownershipParticipation || (field === 'ownershipParticipation' ? value : null),
        competitive_advantage: allData.competitiveAdvantage || (field === 'competitiveAdvantage' ? value : null),
        revenue: allData.revenue || (field === 'revenue' ? value : null),
        ebitda: allData.ebitda || (field === 'ebitda' ? value : null),
        
        // UTM y tracking data
        utm_source: utmData?.utm_source,
        utm_medium: utmData?.utm_medium,
        utm_campaign: utmData?.utm_campaign,
        referrer: utmData?.referrer,
        current_step: 1,
        completion_percentage: 5,
        last_modified_field: field
      };

      // Crear registro usando update-valuation con uniqueToken generado
      const tempToken = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🎫 [AUTOSAVE] Token temporal generado:', tempToken.substring(0, 12) + '...');
      
      // Use authenticated session if user is logged in
      const invokeOptions = {
        body: {
          uniqueToken: tempToken,
          data: minimalData,
          isInitialCreation: true
        }
      };

      console.log('📡 [AUTOSAVE] Llamando a edge function update-valuation...');
      const { data, error } = user && session 
        ? await supabase.functions.invoke('update-valuation', invokeOptions)
        : await supabase.functions.invoke('update-valuation', invokeOptions);

      if (error) {
        console.error('❌ [AUTOSAVE] Error llamando a edge function:', error);
        setState(prev => ({ ...prev, isSaving: false }));
        return null;
      }

      console.log('✅ [AUTOSAVE] Respuesta de edge function recibida:', data);
      const finalToken = data?.uniqueToken || tempToken;
      setState(prev => ({ 
        ...prev, 
        uniqueToken: finalToken, 
        lastSaved: new Date(),
        isSaving: false,
        startTime: new Date()
      }));
      
      saveTokenToStorage(finalToken);
      console.log('✅ [AUTOSAVE] Valoración inicial creada exitosamente con token:', finalToken.substring(0, 12) + '...');
      return finalToken;
      
    } catch (error) {
      console.error('❌ [AUTOSAVE] Excepción creando valoración inicial:', error);
      setState(prev => ({ ...prev, isSaving: false }));
      return null;
    }
  }, [state.uniqueToken, saveTokenToStorage, user, session]);

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

        // Si se está actualizando el campo phone, normalizar automáticamente
        const updateData: any = {
          ...partialData,
          timeSpentSeconds,
          lastModifiedField: field || 'unknown'
        };
        
        if (field === 'phone' && partialData.phone) {
          const { normalizeToE164 } = await import('@/utils/phoneUtils');
          const normalizedPhone = normalizeToE164(partialData.phone, 'ES');
          if (normalizedPhone) {
            updateData.phone_e164 = normalizedPhone;
          }
        }

        // Ensure authenticated session is used when available
        const { data, error } = await supabase.functions.invoke('update-valuation', {
          body: {
            uniqueToken: token,
            data: updateData
          }
        });

        if (error) {
          console.error('❌ Error actualizando valoración:', error);
        } else {
          console.log('✅ Valoración actualizada exitosamente:', { field, token: `${token.substring(0, 12)}...` });
          setState(prev => ({ 
            ...prev, 
            lastSaved: new Date(),
            timeSpent: timeSpentSeconds
          }));
        }
      } catch (error) {
        console.error('❌ Excepción actualizando valoración:', error);
      } finally {
        setState(prev => ({ ...prev, isSaving: false }));
      }
    }, 500); // FASE 1: 500ms debounce (antes 3000ms) - más rápido y responsivo
  }, [state.uniqueToken, state.startTime, state.timeSpent]);

  // Guardado inmediato para campos críticos (email, company name)
  const updateValuationImmediate = useCallback(async (partialData: Partial<CompanyData>, field?: string) => {
    const token = state.uniqueToken;
    if (!token) {
      console.warn('⚠️ No hay token disponible para guardado inmediato');
      return;
    }

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

      console.log('🔥 Guardado inmediato iniciado para campo crítico:', { field, token: `${token.substring(0, 12)}...` });

      // Ensure authenticated session is used when available  
      const { data, error } = await supabase.functions.invoke('update-valuation', {
        body: {
          uniqueToken: token,
          data: updateData
        }
      });

      if (error) {
        console.error('❌ Error en guardado inmediato:', error);
      } else {
        console.log('✅ Guardado inmediato exitoso:', { field, token: `${token.substring(0, 12)}...` });
        setState(prev => ({ 
          ...prev, 
          lastSaved: new Date(),
          timeSpent: timeSpentSeconds
        }));
      }
    } catch (error) {
      console.error('❌ Excepción en guardado inmediato:', error);
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
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

      // Ensure authenticated session is used when available
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
      
      // Track valuation completion with full metadata
      await trackValuationCompleted(finalData, {
        timeSpent: state.startTime ? Math.floor((Date.now() - state.startTime.getTime()) / 1000) : state.timeSpent,
        currentStep: state.currentStep,
        token: token
      });
      
      return true;
    } catch (error) {
      console.error('Exception finalizing valuation:', error);
      setState(prev => ({ ...prev, isSaving: false }));
      return false;
    }
  }, [state.uniqueToken, trackValuationCompleted, state.startTime, state.timeSpent, state.currentStep]);

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
      
      // Ensure authenticated session is used when available
      supabase.functions.invoke('update-valuation', {
        body: {
          uniqueToken: state.uniqueToken,
          data: updateData
        }
      }).then(({ error }) => {
        if (error) {
          console.error('Error updating step:', error);
        } else if (user) {
          console.log('Step updated for authenticated user:', user.email);
        }
      }).catch(() => { /* silent fail in autosave context */ });
    }
  }, [state.uniqueToken, state.startTime, state.timeSpent, user]);

  // Clear autosave data and cleanup
  const clearAutosave = useCallback(() => {
    try {
      storage.removeItem(STORAGE_KEY);
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
      console.log('🧹 [AUTOSAVE] Datos de autosave limpiados');
    } catch (error) {
      console.warn('❌ [AUTOSAVE] Error limpiando autosave:', error);
    }
  }, []);

  // Flush pending updates immediately (for beforeunload)
  const flushPendingUpdates = useCallback(() => {
    if (debounceRef.current && state.uniqueToken) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      
      // Force immediate update
      const timeSpentSeconds = state.startTime 
        ? Math.floor((Date.now() - state.startTime.getTime()) / 1000)
        : state.timeSpent;

      // Ensure authenticated session is used when available
      supabase.functions.invoke('update-valuation', {
        body: {
          uniqueToken: state.uniqueToken,
          data: {
            timeSpentSeconds,
            lastModifiedField: 'page_exit',
            session_status: 'abandoned'
          }
        }
      }).catch(console.error);
    }
  }, [state.uniqueToken, state.startTime, state.timeSpent]);

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
    updateValuationImmediate,
    finalizeValuation,
    updateStep,
    clearAutosave,
    flushPendingUpdates
  };
};