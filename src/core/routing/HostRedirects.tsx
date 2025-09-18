import { Navigate } from 'react-router-dom';

export const useHostRedirects = () => {
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

  // Si entran por app.capittal.es, redirigir al login de admin
  if (host === 'app.capittal.es') {
    window.location.href = 'https://capittal.es/admin/login';
    return null;
  }

  // Si entran por capittalmarket.com, redirigir a venta de empresas
  if (host === 'capittalmarket.com' && path === '/') {
    return <Navigate to="/venta-empresas" replace />;
  }

  // Redirecciones internas por host -> ruta (si en el mismo dominio)
  const hostRedirects: Record<string, string> = {
    'webcapittal.lovable.app': '/lp/calculadora',
  };

  const target = hostRedirects[host];
  if (target && path !== target) {
    return <Navigate to={target} replace />;
  }

  return null;
};