import { validateTranslations } from '../utils/i18n-validator';

// Ejecutar validación completa
const result = validateTranslations();

console.log(result.report);

// Salir con código de error si hay problemas críticos
const hasCriticalErrors = 
  !result.valid || 
  result.criticalKeysMissing.length > 0 ||
  result.duplicateKeys.length > 0;

process.exit(hasCriticalErrors ? 1 : 0);
