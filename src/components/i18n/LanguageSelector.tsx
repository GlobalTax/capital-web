import React, { useEffect, useState } from 'react';
import { getPreferredLang, setPreferredLang, LangCode } from '@/shared/i18n/locale';
import { useI18n } from '@/shared/i18n/I18nProvider';

const labels: Record<LangCode, string> = {
  es: 'Castellano',
  ca: 'Català',
  val: 'Valencià',
  gl: 'Galego',
  en: 'English',
};

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className }) => {
  const { lang: ctxLang, setLang: ctxSetLang, managed } = useI18n();
  const [localLang, setLocalLang] = useState<LangCode>(ctxLang ?? 'es');

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
      // Forzar re-render de toda la aplicación
      setTimeout(() => {
        // Trigger a small DOM update to ensure all components re-render
        document.documentElement.lang = value;
      }, 0);
    } else {
      setLocalLang(value);
      try { setPreferredLang(value); } catch {}
      // Recargar para que todo el contenido refleje el idioma cuando no hay provider
      window.location.reload();
    }
  };

  return (
    <div className={className}>
      <label htmlFor="lang" className="sr-only">Idioma</label>
      <select
        id="lang"
        value={managed ? ctxLang : localLang}
        onChange={onChange}
        className="border rounded px-2 py-1 text-sm"
        aria-label="Seleccionar idioma"
      >
        {Object.entries(labels).map(([code, name]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
