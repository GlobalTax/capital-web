import { useEffect } from 'react';

/**
 * ConsoleNoiseFilter - Filtra y deduplica mensajes de consola repetitivos del sandbox
 * Solo se aplica en entornos de desarrollo de Lovable
 */
export const ConsoleNoiseFilter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Solo aplicar filtro en preview/sandbox de Lovable
    const currentHost = window.location.hostname;
    if (!currentHost.endsWith('.lovableproject.com') && !currentHost.includes('preview--')) {
      return;
    }

    // Patrones de ruido conocido del sandbox
    const noisePatterns = [
      /Tracking Prevention blocked access to storage/,
      /Unrecognized feature: ['"]vr['"]/,
      /Unrecognized feature: ['"]ambient-light-sensor['"]/,
      /Unrecognized feature: ['"]battery['"]/,
      /An iframe which has both allow-scripts and allow-same-origin/,
      /_sandbox\/dev-server/,
      /lovable-api\.com.*latest-message/,
      /firestore\.googleapis\.com.*400/,
      /WebSocket.*handshake.*404.*lovableproject\.com/,
      /Failed to load resource.*lovableproject\.com/,
      /unsafe-eval.*WebAssembly/,
    ];

    // Contador de mensajes por patrón (deduplicación)
    const messageCount = new Map<string, { count: number; lastShown: number }>();
    const DEDUPE_WINDOW = 10000; // 10 segundos
    const MAX_SAME_MESSAGE = 3; // Máximo 3 veces el mismo mensaje

    const originalInfo = console.info;
    const originalWarn = console.warn;
    const originalError = console.error;

    const shouldFilter = (message: string): boolean => {
      // Verificar si coincide con patrones de ruido
      const matchesNoise = noisePatterns.some(pattern => pattern.test(message));
      if (!matchesNoise) return false;

      const now = Date.now();
      const existing = messageCount.get(message);

      if (!existing) {
        messageCount.set(message, { count: 1, lastShown: now });
        return false; // Mostrar la primera vez
      }

      // Si ha pasado la ventana de tiempo, resetear contador
      if (now - existing.lastShown > DEDUPE_WINDOW) {
        messageCount.set(message, { count: 1, lastShown: now });
        return false;
      }

      // Incrementar contador
      existing.count++;
      
      // Filtrar si ya se ha mostrado demasiadas veces
      return existing.count > MAX_SAME_MESSAGE;
    };

    console.info = (...args: any[]) => {
      const message = args.join(' ');
      if (!shouldFilter(message)) {
        originalInfo.apply(console, args);
      }
    };

    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      if (!shouldFilter(message)) {
        originalWarn.apply(console, args);
      }
    };

    console.error = (...args: any[]) => {
      const message = args.join(' ');
      if (!shouldFilter(message)) {
        originalError.apply(console, args);
      }
    };

    // Cleanup
    return () => {
      console.info = originalInfo;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return <>{children}</>;
};
