import { useI18n } from '@/shared/i18n/I18nProvider';
import { useEffect, useRef } from 'react';

/**
 * Hook seguro para traducciones con validación en desarrollo
 * Muestra warnings en consola cuando se usan claves no definidas
 */
export function useSafeTranslation() {
  const { t, lang } = useI18n();
  const warnedKeys = useRef<Set<string>>(new Set());

  const safeTx = (key: string, vars?: Record<string, string | number>): string => {
    const result = t(key, vars);
    
    // Solo en desarrollo: detectar claves no traducidas
    if (import.meta.env.DEV && result === key) {
      // Evitar warnings duplicados
      if (!warnedKeys.current.has(key)) {
        warnedKeys.current.add(key);
        
        // Obtener información del stack para identificar el componente
        const stack = new Error().stack;
        const componentMatch = stack?.split('\n')[2]?.match(/at (\w+)/);
        const component = componentMatch ? componentMatch[1] : 'Unknown';
        
        console.warn(
          `🌍 [i18n] Untranslated key detected\n` +
          `  Key: "${key}"\n` +
          `  Language: ${lang.toUpperCase()}\n` +
          `  Component: ${component}\n` +
          `  ⚠️  Add this key to src/shared/i18n/dictionaries.ts`
        );
      }
    }
    
    return result;
  };

  // Limpiar warnings cuando cambie el idioma
  useEffect(() => {
    warnedKeys.current.clear();
  }, [lang]);

  return { t: safeTx, lang };
}

/**
 * Versión del hook sin tracking de warnings (para producción)
 */
export function useTranslation() {
  return useI18n();
}
