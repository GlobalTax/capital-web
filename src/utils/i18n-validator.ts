import { dictionaries } from '@/shared/i18n/dictionaries';
import type { LangCode } from '@/shared/i18n/locale';

/**
 * Valida que todas las claves de traducción existan en todos los idiomas
 */
export function validateTranslations(): {
  valid: boolean;
  missingKeys: Record<LangCode, string[]>;
  report: string;
} {
  const languages: LangCode[] = ['es', 'ca', 'en'];
  const allKeys = new Set<string>();
  
  // Recopilar todas las claves únicas de todos los idiomas
  languages.forEach(lang => {
    Object.keys(dictionaries[lang]).forEach(key => allKeys.add(key));
  });
  
  // Verificar qué claves faltan en cada idioma
  const missingKeys: Record<LangCode, string[]> = { es: [], ca: [], en: [] };
  
  languages.forEach(lang => {
    const langDict = dictionaries[lang];
    allKeys.forEach(key => {
      if (!langDict[key]) {
        missingKeys[lang].push(key);
      }
    });
  });
  
  const valid = Object.values(missingKeys).every(keys => keys.length === 0);
  
  // Generar reporte
  let report = '🌍 Translation Validation Report\n\n';
  
  if (valid) {
    report += '✅ All translations are complete!\n';
    report += `Total keys: ${allKeys.size}`;
  } else {
    report += '❌ Missing translations found:\n\n';
    languages.forEach(lang => {
      if (missingKeys[lang].length > 0) {
        report += `${lang.toUpperCase()}: ${missingKeys[lang].length} missing keys\n`;
        missingKeys[lang].forEach(key => {
          report += `  - ${key}\n`;
        });
        report += '\n';
      }
    });
  }
  
  return { valid, missingKeys, report };
}

/**
 * Ejecuta la validación en desarrollo y muestra advertencias en consola
 */
export function devValidateTranslations() {
  if (import.meta.env.DEV) {
    const { valid, report } = validateTranslations();
    
    if (!valid) {
      console.warn('⚠️ I18n Validation Failed:');
      console.warn(report);
    } else {
      console.info('✅ I18n: All translations valid');
    }
  }
}
