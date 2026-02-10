import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_CONFIG } from '@/config/supabase';

interface SessionTrackingOptions {
  formType?: string;
  onSessionCreated?: (sessionId: string) => void;
  onExitIntent?: () => void;
}

interface SessionData {
  sessionId: string;
  enteredAt: Date;
  interacted: boolean;
  fieldsTouched: Set<string>;
  scrollDepth: number;
  exitIntentTriggered: boolean;
}

/**
 * Hook para tracking completo de sesiones de formularios (Fase 2)
 * Captura soft abandonments: usuarios que ven el formulario pero no interactúan
 */
export const useFormSessionTracking = (options: SessionTrackingOptions = {}) => {
  const { formType = 'valuation', onSessionCreated, onExitIntent } = options;
  
  const sessionDataRef = useRef<SessionData | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollListenerRef = useRef<(() => void) | null>(null);
  const mouseListenerRef = useRef<((e: MouseEvent) => void) | null>(null);

  // Generar ID de sesión único
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Obtener datos del navegador
  const getBrowserInfo = useCallback(() => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    
    return browser;
  }, []);

  // Obtener tipo de dispositivo
  const getDeviceType = useCallback(() => {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }, []);

  // Obtener UTM parameters de la URL
  const getUTMParams = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term')
    };
  }, []);

  // Calcular scroll depth actual
  const calculateScrollDepth = useCallback(() => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
    return Math.min(Math.max(scrollPercentage, 0), 100);
  }, []);

  // Crear sesión inicial en la base de datos
  const createSession = useCallback(async () => {
    const sessionId = generateSessionId();
    const utmParams = getUTMParams();
    
    try {
      const { error } = await supabase
        .from('form_sessions')
        .insert({
          session_id: sessionId,
          form_type: formType,
          page_url: window.location.href,
          referrer: document.referrer || null,
          device_type: getDeviceType(),
          browser: getBrowserInfo(),
          entered_at: new Date().toISOString(),
          interacted: false,
          fields_touched: [],
          scroll_depth_percentage: 0,
          exit_intent_triggered: false,
          ...utmParams
        });

      if (error) {
        console.error('Error creating session:', error);
        return null;
      }

      console.log('📊 Session tracking iniciado:', sessionId);
      
      sessionDataRef.current = {
        sessionId,
        enteredAt: new Date(),
        interacted: false,
        fieldsTouched: new Set(),
        scrollDepth: 0,
        exitIntentTriggered: false
      };

      onSessionCreated?.(sessionId);
      return sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  }, [formType, generateSessionId, getUTMParams, getDeviceType, getBrowserInfo, onSessionCreated]);

  // Marcar campo como tocado
  const trackFieldTouch = useCallback((fieldName: string) => {
    if (!sessionDataRef.current) return;

    const wasInteracted = sessionDataRef.current.interacted;
    sessionDataRef.current.fieldsTouched.add(fieldName);
    sessionDataRef.current.interacted = true;

    // Si es la primera interacción, actualizar inmediatamente
    if (!wasInteracted) {
      console.log('🎯 Primera interacción detectada:', fieldName);
      
      supabase
        .from('form_sessions')
        .update({
          interacted: true,
          fields_touched: Array.from(sessionDataRef.current.fieldsTouched)
        })
        .eq('session_id', sessionDataRef.current.sessionId)
        .then(({ error }) => {
          if (error) console.error('Error updating interaction:', error);
        })
        .catch(() => { /* silent fail in tracking context */ });
    }
  }, []);

  // Actualizar scroll depth
  const updateScrollDepth = useCallback(() => {
    if (!sessionDataRef.current) return;

    const currentScrollDepth = calculateScrollDepth();
    
    // Solo actualizar si hay cambio significativo (5% o más)
    if (Math.abs(currentScrollDepth - sessionDataRef.current.scrollDepth) >= 5) {
      sessionDataRef.current.scrollDepth = currentScrollDepth;
    }
  }, [calculateScrollDepth]);

  // Detectar exit intent (cursor hacia arriba para cerrar)
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (!sessionDataRef.current || sessionDataRef.current.exitIntentTriggered) return;

    // Detectar si el cursor sale por arriba (intento de cerrar pestaña)
    if (e.clientY <= 0) {
      console.log('⚠️ Exit intent detectado');
      sessionDataRef.current.exitIntentTriggered = true;

      supabase
        .from('form_sessions')
        .update({
          exit_intent_triggered: true
        })
        .eq('session_id', sessionDataRef.current.sessionId)
        .then(({ error }) => {
          if (error) console.error('Error updating exit intent:', error);
        })
        .catch(() => { /* silent fail in tracking context */ });

      onExitIntent?.();
    }
  }, [onExitIntent]);

  // Actualizar sesión periódicamente (cada 10 segundos)
  const updateSession = useCallback(() => {
    if (!sessionDataRef.current) return;

    const timeOnPage = Math.floor((Date.now() - sessionDataRef.current.enteredAt.getTime()) / 1000);

    supabase
      .from('form_sessions')
      .update({
        time_on_page_seconds: timeOnPage,
        scroll_depth_percentage: sessionDataRef.current.scrollDepth,
        fields_touched: Array.from(sessionDataRef.current.fieldsTouched)
      })
      .eq('session_id', sessionDataRef.current.sessionId)
      .then(({ error }) => {
        if (error) console.error('Error updating session:', error);
      })
      .catch(() => { /* silent fail in tracking context */ });
  }, []);

  // Finalizar sesión (beforeunload)
  const finalizeSession = useCallback(() => {
    if (!sessionDataRef.current) return;

    const timeOnPage = Math.floor((Date.now() - sessionDataRef.current.enteredAt.getTime()) / 1000);

    const updateData = {
      exited_at: new Date().toISOString(),
      time_on_page_seconds: timeOnPage,
      scroll_depth_percentage: sessionDataRef.current.scrollDepth,
      fields_touched: Array.from(sessionDataRef.current.fieldsTouched),
      exit_type: 'close_tab'
    };

    // Use centralized Supabase config for raw fetch with keepalive (beforeunload reliability)
    const supabaseUrl = SUPABASE_CONFIG.url;
    const supabaseKey = SUPABASE_CONFIG.anonKey;
    
    const url = `${supabaseUrl}/rest/v1/form_sessions?session_id=eq.${sessionDataRef.current.sessionId}`;
    
    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    };
    
    // Use fetch with keepalive for beforeunload reliability
    // sendBeacon doesn't support custom headers
    try {
      fetch(url, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(updateData),
        keepalive: true // Crucial for beforeunload
      }).catch(() => {
        // Silent fail - normal in beforeunload context
      });
    } catch (error) {
      // Fallback silencioso
    }
  }, []);

  // Link valuation to session
  const linkValuation = useCallback((valuationId: string) => {
    if (!sessionDataRef.current) return;

    supabase
      .from('form_sessions')
      .update({ valuation_id: valuationId })
      .eq('session_id', sessionDataRef.current.sessionId)
      .then(({ error }) => {
        if (error) console.error('Error linking valuation:', error);
        else console.log('✅ Valuation linked to session:', valuationId);
      });
  }, []);

  // Setup inicial
  useEffect(() => {
    // Crear sesión al montar
    createSession();

    // Setup listeners
    scrollListenerRef.current = () => updateScrollDepth();
    window.addEventListener('scroll', scrollListenerRef.current, { passive: true });

    mouseListenerRef.current = handleMouseLeave;
    document.addEventListener('mouseleave', mouseListenerRef.current);

    // Actualizar cada 10 segundos
    intervalRef.current = setInterval(updateSession, 10000);

    // Finalizar sesión al salir
    const handleBeforeUnload = () => finalizeSession();
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      if (scrollListenerRef.current) {
        window.removeEventListener('scroll', scrollListenerRef.current);
      }
      if (mouseListenerRef.current) {
        document.removeEventListener('mouseleave', mouseListenerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Última actualización antes de desmontar
      finalizeSession();
    };
  }, [createSession, updateScrollDepth, handleMouseLeave, updateSession, finalizeSession]);

  return {
    sessionId: sessionDataRef.current?.sessionId || null,
    trackFieldTouch,
    linkValuation,
    isInteracted: sessionDataRef.current?.interacted || false,
    fieldsTouched: sessionDataRef.current ? Array.from(sessionDataRef.current.fieldsTouched) : []
  };
};
