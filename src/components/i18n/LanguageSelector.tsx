import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPreferredLang, setPreferredLang, LangCode } from '@/shared/i18n/locale';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { cn } from '@/lib/utils';

const labels: Record<LangCode, string> = {
  es: 'Castellano',
  ca: 'Català',
  en: 'English',
};

interface LanguageSelectorProps {
  className?: string;
}

// Helper to get localized path from current path
function getLocalizedPath(currentPath: string, newLang: LangCode): string {
  // Map of route patterns: ES -> CA -> EN
  const routePatterns = [
    { es: '/', ca: '/inici', en: '/home' },
    { es: '/venta-empresas', ca: '/venda-empreses', en: '/sell-companies' },
    { es: '/compra-empresas', ca: '/compra-empreses', en: '/buy-companies' },
    { es: '/contacto', ca: '/contacte', en: '/contact' },
    { es: '/casos-exito', ca: '/casos-exit', en: '/success-stories' },
    { es: '/por-que-elegirnos', ca: '/per-que-triar-nos', en: '/why-choose-us' },
    { es: '/equipo', ca: '/equip', en: '/team' },
    { es: '/programa-colaboradores', ca: '/programa-col·laboradors', en: '/partners-program' },
    // Services routes
    { es: '/servicios/valoraciones', ca: '/serveis/valoracions', en: '/services/valuations' },
    { es: '/servicios/fusiones-adquisiciones', ca: '/serveis/fusions-adquisicions', en: '/services/mergers-acquisitions' },
    { es: '/servicios/due-diligence', ca: '/serveis/due-diligence', en: '/services/due-diligence' },
    { es: '/servicios/reestructuraciones', ca: '/serveis/reestructuracions', en: '/services/restructuring' },
    // Sector routes
    { es: '/sectores/tecnologia', ca: '/sectors/tecnologia', en: '/sectors/technology' },
    { es: '/sectores/industrial', ca: '/sectors/industrial', en: '/sectors/industrial' },
    { es: '/sectores/retail', ca: '/sectors/retail', en: '/sectors/retail' },
    { es: '/sectores/servicios', ca: '/sectors/serveis', en: '/sectors/services' },
    // Landing pages keep same path across languages
    { es: '/lp/calculadora', ca: '/lp/calculadora', en: '/lp/calculadora' },
    { es: '/lp/calculadora-fiscal', ca: '/lp/calculadora-fiscal', en: '/lp/calculadora-fiscal' },
  ];

  // Find matching pattern
  for (const pattern of routePatterns) {
    if (Object.values(pattern).includes(currentPath)) {
      return pattern[newLang];
    }
  }

  // Default: return current path
  return currentPath;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className }) => {
  const { lang: ctxLang, setLang: ctxSetLang, managed } = useI18n();
  const [localLang, setLocalLang] = useState<LangCode>(ctxLang ?? 'es');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLocalLang(ctxLang);
  }, [ctxLang]);

  // Fallback para cuando no hay provider
  useEffect(() => {
    if (!managed) {
      try {
        setLocalLang(getPreferredLang());
      } catch {}
    }
  }, [managed]);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as LangCode;
    
    if (managed) {
      ctxSetLang(value);
      try { setPreferredLang(value); } catch {}
      
      // Redirect to localized version of current page
      const currentPath = location.pathname;
      const newPath = getLocalizedPath(currentPath, value);
      
      if (newPath !== currentPath) {
        navigate(newPath);
      } else {
        // Force re-render if staying on same path
        document.documentElement.lang = value;
      }
    } else {
      setLocalLang(value);
      try { setPreferredLang(value); } catch {}
      window.location.reload();
    }
  };

  return (
    <div>
      <label htmlFor="lang" className="sr-only">Idioma</label>
      <select
        id="lang"
        value={managed ? ctxLang : localLang}
        onChange={onChange}
        className={cn(
          "bg-transparent border-none rounded px-2 py-1 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/30",
          className
        )}
        aria-label="Seleccionar idioma"
      >
        {Object.entries(labels).map(([code, name]) => (
          <option key={code} value={code} className="bg-slate-800 text-white">{name}</option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
