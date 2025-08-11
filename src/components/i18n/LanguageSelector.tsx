import React, { useEffect, useState } from 'react';
import { getPreferredLang, setPreferredLang, LangCode } from '@/shared/i18n/locale';

const labels: Record<LangCode, string> = {
  es: 'Castellano',
  ca: 'Català',
  val: 'Valencià',
  gl: 'Galego',
};

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className }) => {
  const [lang, setLang] = useState<LangCode>('es');

  useEffect(() => {
    try {
      setLang(getPreferredLang());
    } catch {}
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as LangCode;
    setLang(value);
    try {
      setPreferredLang(value);
    } catch {}
    // Opcional: recargar para que todo el contenido refleje el idioma
    // window.location.reload();
  };

  return (
    <div className={className}>
      <label htmlFor="lang" className="sr-only">Idioma</label>
      <select
        id="lang"
        value={lang}
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
