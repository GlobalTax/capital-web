import { validateTranslations } from '../utils/i18n-validator';

// Ejecutar validación
const { valid, report } = validateTranslations();

console.log(report);

// Exit con código de error si faltan traducciones
process.exit(valid ? 0 : 1);
