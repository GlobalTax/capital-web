import React, { createContext, useContext, useMemo, useState } from 'react';
import { LangCode, getPreferredLang, setPreferredLang } from '@/shared/i18n/locale';
import { dictionaries } from '@/shared/i18n/dictionaries';

interface I18nContextValue {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  managed: boolean;
}

const noop = () => {};

const I18nContext = createContext<I18nContextValue>({
  lang: 'es',
  setLang: noop,
  t: (key) => key,
  managed: false,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = (() => {
    try {
      return getPreferredLang();
    } catch {
      return 'es' as LangCode;
    }
  })();
  const [lang, setLangState] = useState<LangCode>(initial);

  const setLang = (l: LangCode) => {
    setLangState(l);
    try {
      setPreferredLang(l);
    } catch {}
  };

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) => {
      const dict = (dictionaries[lang] || dictionaries.es) as Record<string, string>;
      const fallback = dictionaries.es as Record<string, string>;
      let value = dict[key] ?? fallback[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          value = value.replace(new RegExp(`{${k}}`, 'g'), String(v));
        });
      }
      return value;
    };
  }, [lang]);

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, t, managed: true }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
