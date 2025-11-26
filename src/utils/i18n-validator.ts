import { dictionaries } from '@/shared/i18n/dictionaries';
import type { LangCode } from '@/shared/i18n/locale';
import { CRITICAL_KEYS, EXPECTED_NAMESPACES } from './i18n-key-registry';

interface I18nValidationResult {
  valid: boolean;
  missingKeys: Record<LangCode, string[]>;
  criticalKeysMissing: string[];
  namespaceIssues: string[];
  duplicateKeys: string[];
  report: string;
}

/**
 * Extrae el namespace de una clave (e.g., 'nav.home' -> 'nav')
 */
function getNamespace(key: string): string {
  return key.split('.')[0];
}

/**
 * Valida la consistencia de los namespaces
 */
function validateNamespaceConsistency(): string[] {
  const issues: string[] = [];
  const languages: LangCode[] = ['es', 'ca', 'en'];
  
  languages.forEach(lang => {
    const langDict = dictionaries[lang];
    const namespaces = new Set<string>();
    
    Object.keys(langDict).forEach(key => {
      const namespace = getNamespace(key);
      namespaces.add(namespace);
    });
    
    // Verificar que todos los namespaces esperados existen
    EXPECTED_NAMESPACES.forEach(expectedNs => {
      if (!namespaces.has(expectedNs)) {
        issues.push(`${lang.toUpperCase()}: Missing namespace '${expectedNs}'`);
      }
    });
  });
  
  return issues;
}

/**
 * Verifica que todas las claves críticas estén presentes
 */
function validateCriticalKeys(): string[] {
  const missing: string[] = [];
  const languages: LangCode[] = ['es', 'ca', 'en'];
  
  languages.forEach(lang => {
    const langDict = dictionaries[lang];
    CRITICAL_KEYS.forEach(key => {
      if (!langDict[key]) {
        missing.push(`${lang.toUpperCase()}: Missing critical key '${key}'`);
      }
    });
  });
  
  return missing;
}

/**
 * Detecta claves duplicadas (misma clave definida múltiples veces)
 */
function detectDuplicateKeys(): string[] {
  const duplicates: string[] = [];
  const languages: LangCode[] = ['es', 'ca', 'en'];
  
  languages.forEach(lang => {
    const langDict = dictionaries[lang];
    const keys = Object.keys(langDict);
    const seen = new Set<string>();
    
    keys.forEach(key => {
      if (seen.has(key)) {
        duplicates.push(`${lang.toUpperCase()}: Duplicate key '${key}'`);
      }
      seen.add(key);
    });
  });
  
  return duplicates;
}

/**
 * Validación completa de traducciones
 */
export function validateTranslations(): I18nValidationResult {
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
  
  // Validaciones adicionales
  const criticalKeysMissing = validateCriticalKeys();
  const namespaceIssues = validateNamespaceConsistency();
  const duplicateKeys = detectDuplicateKeys();
  
  const basicValid = Object.values(missingKeys).every(keys => keys.length === 0);
  const valid = basicValid && 
                criticalKeysMissing.length === 0 && 
                namespaceIssues.length === 0 &&
                duplicateKeys.length === 0;
  
  // Generar reporte completo
  let report = '🌍 I18N VALIDATION REPORT\n';
  report += '═══════════════════════════════════════════════════════\n\n';
  
  report += '📊 SUMMARY\n';
  report += `  Total keys: ${allKeys.size}\n`;
  report += `  Languages: ${languages.map(l => l.toUpperCase()).join(', ')}\n`;
  report += `  Critical keys: ${CRITICAL_KEYS.length}\n\n`;
  
  // Claves críticas faltantes
  if (criticalKeysMissing.length > 0) {
    report += '❌ CRITICAL: Missing critical keys\n';
    criticalKeysMissing.forEach(issue => {
      report += `  → ${issue}\n`;
    });
    report += '\n';
  }
  
  // Claves duplicadas
  if (duplicateKeys.length > 0) {
    report += '❌ CRITICAL: Duplicate keys detected\n';
    duplicateKeys.forEach(dup => {
      report += `  → ${dup}\n`;
    });
    report += '\n';
  }
  
  // Claves faltantes
  if (!basicValid) {
    report += '⚠️  WARNING: Missing translations\n';
    languages.forEach(lang => {
      if (missingKeys[lang].length > 0) {
        report += `  ${lang.toUpperCase()}: ${missingKeys[lang].length} missing keys\n`;
        missingKeys[lang].slice(0, 10).forEach(key => {
          report += `    - ${key}\n`;
        });
        if (missingKeys[lang].length > 10) {
          report += `    ... and ${missingKeys[lang].length - 10} more\n`;
        }
      }
    });
    report += '\n';
  }
  
  // Problemas de namespaces
  if (namespaceIssues.length > 0) {
    report += 'ℹ️  INFO: Namespace consistency issues\n';
    namespaceIssues.forEach(issue => {
      report += `  → ${issue}\n`;
    });
    report += '\n';
  }
  
  report += '═══════════════════════════════════════════════════════\n';
  
  if (valid) {
    report += 'RESULT: ✅ PASSED - All validations successful\n';
  } else {
    const errorCount = criticalKeysMissing.length + duplicateKeys.length;
    const warningCount = Object.values(missingKeys).reduce((sum, keys) => sum + keys.length, 0);
    report += `RESULT: ❌ FAILED (${errorCount} critical, ${warningCount} warnings)\n`;
  }
  
  return { 
    valid, 
    missingKeys, 
    criticalKeysMissing,
    namespaceIssues,
    duplicateKeys,
    report 
  };
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
