import { Navigate } from 'react-router-dom';

export class HostRedirectService {
  private static hostRedirects: Record<string, string> = {
    'webcapittal.lovable.app': '/lp/calculadora',
  };

  static checkRedirection(): string | null {
    if (typeof window === 'undefined') return null;
    
    const rawHost = window.location.hostname;
    const host = rawHost.replace(/^www\./, '');
    const path = window.location.pathname;

    // Si entran por calculadoras.capittal.es, forzamos dominio canónico capittal.es/lp/calculadora
    if (host === 'calculadoras.capittal.es' || host === 'calculadora.capittal.es') {
      const canonical = 'https://capittal.es/lp/calculadora';
      if (window.location.href !== canonical) {
        window.location.replace(canonical); // 302 en cliente (efecto similar a 301 para UX)
        return null;
      }
    }

    // Redirecciones internas por host -> ruta (si en el mismo dominio)
    const target = this.hostRedirects[host];
    if (target && path !== target) {
      return target;
    }

    return null;
  }

  static shouldRedirectToCanonical(): boolean {
    if (typeof window === 'undefined') return false;
    
    const rawHost = window.location.hostname;
    const host = rawHost.replace(/^www\./, '');
    
    return host === 'calculadoras.capittal.es' || host === 'calculadora.capittal.es';
  }
}