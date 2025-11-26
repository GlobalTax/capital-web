import { useState, useEffect, useRef } from 'react';

export interface TrackingData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
}

interface RateLimitEntry {
  count: number;
  lastAttempt: number;
}

const RATE_LIMIT_STORAGE_KEY = 'form_rate_limits';
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora
const MAX_ATTEMPTS_PER_HOUR = 3;
const MIN_SUBMISSION_TIME_MS = 3000; // 3 segundos mínimo

export const useFormSecurity = () => {
  const [honeypotValue, setHoneypotValue] = useState('');
  const formStartTime = useRef(Date.now());

  useEffect(() => {
    formStartTime.current = Date.now();
  }, []);

  // Props para el campo honeypot (invisible para usuarios reales)
  const honeypotProps = {
    name: 'website',
    tabIndex: -1,
    autoComplete: 'off',
    'aria-hidden': true,
    style: {
      position: 'absolute' as const,
      left: '-9999px',
      width: '1px',
      height: '1px',
      opacity: 0,
      pointerEvents: 'none' as const,
    },
  };

  // Detectar si es un bot (honeypot rellenado)
  const isBot = (): boolean => {
    return honeypotValue.trim() !== '';
  };

  // Detectar si el envío fue demasiado rápido
  const isSubmissionTooFast = (): boolean => {
    const timeSinceStart = Date.now() - formStartTime.current;
    return timeSinceStart < MIN_SUBMISSION_TIME_MS;
  };

  // Rate limiting basado en identificador (email o IP)
  const checkRateLimit = (identifier: string): boolean => {
    if (!identifier) return true;

    const now = Date.now();
    const rateLimits = getRateLimits();
    const entry = rateLimits[identifier];

    // Limpiar entradas antiguas
    if (entry && now - entry.lastAttempt > RATE_LIMIT_WINDOW_MS) {
      delete rateLimits[identifier];
      saveRateLimits(rateLimits);
      return true;
    }

    // Verificar límite
    if (entry && entry.count >= MAX_ATTEMPTS_PER_HOUR) {
      return false;
    }

    return true;
  };

  // Registrar intento de envío
  const recordSubmissionAttempt = (identifier: string): void => {
    if (!identifier) return;

    const now = Date.now();
    const rateLimits = getRateLimits();
    const entry = rateLimits[identifier];

    if (entry && now - entry.lastAttempt < RATE_LIMIT_WINDOW_MS) {
      rateLimits[identifier] = {
        count: entry.count + 1,
        lastAttempt: now,
      };
    } else {
      rateLimits[identifier] = {
        count: 1,
        lastAttempt: now,
      };
    }

    saveRateLimits(rateLimits);
  };

  // Obtener datos de tracking (UTM, referrer, user agent)
  const getTrackingData = async (): Promise<TrackingData> => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Intentar obtener IP (sin bloquear si falla)
    let ipAddress: string | undefined;
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json', {
        signal: AbortSignal.timeout(2000), // Timeout de 2 segundos
      });
      const ipData = await ipResponse.json();
      ipAddress = ipData.ip;
    } catch (error) {
      console.warn('No se pudo obtener la IP del usuario:', error);
    }

    return {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_content: urlParams.get('utm_content') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
      referrer: document.referrer || undefined,
      user_agent: navigator.userAgent,
      ip_address: ipAddress,
    };
  };

  return {
    honeypotProps,
    honeypotValue,
    setHoneypotValue,
    isBot,
    isSubmissionTooFast,
    checkRateLimit,
    recordSubmissionAttempt,
    getTrackingData,
    formStartTime: formStartTime.current,
  };
};

// Helpers para localStorage
function getRateLimits(): Record<string, RateLimitEntry> {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveRateLimits(rateLimits: Record<string, RateLimitEntry>): void {
  try {
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(rateLimits));
  } catch (error) {
    console.error('Error guardando rate limits:', error);
  }
}
