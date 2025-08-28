// ============= CONSOLE LOG CLEANUP SCRIPT =============
// Script para limpiar console logs en masa

import { conditionalLogger } from '@/core/logging/ConditionalLogger';

export interface CleanupRule {
  pattern: RegExp;
  replacement: string;
  logFunction: 'logDebug' | 'logInfo' | 'logWarning' | 'logError';
  context: string;
  component?: string;
}

export const CLEANUP_RULES: CleanupRule[] = [
  // Debug logs
  {
    pattern: /console\.log\(['"`](.*?)['"`]\)/g,
    replacement: 'logDebug("$1", { context: "CONTEXT", component: "COMPONENT" })',
    logFunction: 'logDebug',
    context: 'debug'
  },
  
  // Info logs
  {
    pattern: /console\.info\(['"`](.*?)['"`]\)/g,
    replacement: 'logInfo("$1", { context: "CONTEXT", component: "COMPONENT" })',
    logFunction: 'logInfo',
    context: 'info'
  },
  
  // Warning logs
  {
    pattern: /console\.warn\(['"`](.*?)['"`]\)/g,
    replacement: 'logWarning("$1", { context: "CONTEXT", component: "COMPONENT" })',
    logFunction: 'logWarning',
    context: 'warn'
  },
  
  // Error logs
  {
    pattern: /console\.error\(['"`](.*?)['"`](?:,\s*(.+?))?\)/g,
    replacement: 'logError("$1", $2 as Error, { context: "CONTEXT", component: "COMPONENT" })',
    logFunction: 'logError',
    context: 'error'
  },
  
  // Complex debug logs with data
  {
    pattern: /console\.log\(['"`](.*?)['"`],\s*(.+?)\)/g,
    replacement: 'logDebug("$1", { context: "CONTEXT", component: "COMPONENT", data: $2 })',
    logFunction: 'logDebug',
    context: 'debug'
  }
];

/**
 * Aplica reglas de limpieza a un string de código
 */
export const applyCleanupRules = (
  code: string, 
  context: string = 'system', 
  component?: string
): string => {
  let cleanedCode = code;
  
  CLEANUP_RULES.forEach(rule => {
    cleanedCode = cleanedCode.replace(rule.pattern, (match, message, error) => {
      let replacement = rule.replacement
        .replace('CONTEXT', context)
        .replace('COMPONENT', component || 'Unknown');
      
      // Manejar casos especiales para error logs
      if (rule.logFunction === 'logError' && error) {
        replacement = replacement.replace('$2 as Error', error);
      } else if (rule.logFunction === 'logError' && !error) {
        replacement = replacement.replace(', $2 as Error', '');
      }
      
      return replacement;
    });
  });
  
  return cleanedCode;
};

/**
 * Detecta qué archivos necesitan limpieza
 */
export const detectFilesNeedingCleanup = (content: string): boolean => {
  const consoleRegex = /console\.(log|info|warn|error|debug)/g;
  const matches = content.match(consoleRegex);
  return matches !== null && matches.length > 0;
};

/**
 * Genera estadísticas de limpieza
 */
export const generateCleanupStats = (beforeCode: string, afterCode: string) => {
  const beforeMatches = (beforeCode.match(/console\.(log|info|warn|error|debug)/g) || []).length;
  const afterMatches = (afterCode.match(/console\.(log|info|warn|error|debug)/g) || []).length;
  const loggerMatches = (afterCode.match(/log(Debug|Info|Warning|Error)/g) || []).length;
  
  return {
    consolesRemoved: beforeMatches - afterMatches,
    loggersAdded: loggerMatches,
    totalImprovement: beforeMatches - afterMatches + loggerMatches,
    cleanupPercentage: beforeMatches > 0 ? ((beforeMatches - afterMatches) / beforeMatches) * 100 : 100
  };
};

/**
 * Genera reporte de archivos que necesitan limpieza
 */
export const generateCleanupReport = (files: string[]): Promise<{
  totalFiles: number;
  filesNeedingCleanup: number;
  estimatedConsoleLogs: number;
  priorityFiles: string[];
}> => {
  return Promise.resolve({
    totalFiles: files.length,
    filesNeedingCleanup: 0, // Se calculará dinámicamente
    estimatedConsoleLogs: 0, // Se calculará dinámicamente
    priorityFiles: [] // Archivos con más console logs
  });
};

export default {
  CLEANUP_RULES,
  applyCleanupRules,
  detectFilesNeedingCleanup,
  generateCleanupStats,
  generateCleanupReport
};