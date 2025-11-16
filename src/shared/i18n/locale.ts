// Simple locale utilities for Spain-only languages without external APIs
// Supported languages: 'es' (Castellano), 'ca' (Català), 'val' (Valencià), 'gl' (Galego)

export type LangCode = 'es' | 'ca' | 'en'

export const regionToLang: Record<string, LangCode> = {
  // Comunidades Autónomas (keys are normalized lowercase without accents)
  andalucia: 'es',
  aragon: 'es',
  asturias: 'es',
  cantabria: 'es',
  castilla_la_mancha: 'es',
  castilla_y_leon: 'es',
  cataluna: 'ca',
  catalunya: 'ca',
  catalonia: 'ca',
  ceuta: 'es',
  madrid: 'es',
  murcia: 'es',
  extremadura: 'es',
  galicia: 'es', // Changed from 'gl' to 'es'
  islas_baleares: 'ca',
  baleares: 'ca',
  illes_balears: 'ca',
  islas_canarias: 'es',
  canarias: 'es',
  la_rioja: 'es',
  navarra: 'es',
  pais_vasco: 'es',
  euskadi: 'es',
  valencia: 'ca', // Changed from 'val' to 'ca'
  comunitat_valenciana: 'ca',
  comunidad_valenciana: 'ca',
  valenciana: 'ca',
};

export const langToLocale: Record<LangCode, string> = {
  es: 'es-ES',
  ca: 'ca-ES',
  en: 'en-US',
};

export function detectBrowserLang(): LangCode {
  const langs = (navigator.languages || [navigator.language || 'es']).map(l => l.toLowerCase());
  if (langs.some(l => l.startsWith('ca'))) return 'ca';
  if (langs.some(l => l.startsWith('en'))) return 'en';
  return 'es';
}

const STORAGE_KEY = 'capittal_lang_preference';

export function getPreferredLang(): LangCode {
  const saved = localStorage.getItem(STORAGE_KEY) as LangCode | null;
  return saved || detectBrowserLang();
}

export function setPreferredLang(lang: LangCode) {
  localStorage.setItem(STORAGE_KEY, lang);
}

export function localeForIntl(lang: LangCode): string {
  return langToLocale[lang] || 'es-ES';
}

export function normalizeRegionName(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '_');
}

export function langForRegion(input: string): LangCode {
  const key = normalizeRegionName(input);
  return regionToLang[key] || 'es';
}
