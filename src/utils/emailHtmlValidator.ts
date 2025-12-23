// Email HTML Validator - Validates HTML compatibility with email clients

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  issues: ValidationIssue[];
  stats: {
    sizeInBytes: number;
    sizeInKB: string;
    imageCount: number;
    linkCount: number;
    tableCount: number;
    inlineStyleCount: number;
  };
}

// CSS properties not well supported in email clients
const UNSUPPORTED_CSS = [
  { pattern: /display\s*:\s*flex/gi, name: 'flexbox', suggestion: 'Usa tablas en lugar de flexbox' },
  { pattern: /display\s*:\s*grid/gi, name: 'grid', suggestion: 'Usa tablas en lugar de grid' },
  { pattern: /position\s*:\s*(?:absolute|fixed|sticky)/gi, name: 'positioning', suggestion: 'Evita posicionamiento absoluto/fixed' },
  { pattern: /float\s*:/gi, name: 'float', suggestion: 'Usa align en tablas en lugar de float' },
  { pattern: /box-shadow\s*:/gi, name: 'box-shadow', suggestion: 'box-shadow no es compatible con Outlook' },
  { pattern: /border-radius\s*:/gi, name: 'border-radius', suggestion: 'border-radius no funciona en Outlook (info)' },
  { pattern: /transform\s*:/gi, name: 'transform', suggestion: 'Transformaciones CSS no son compatibles' },
  { pattern: /animation\s*:|@keyframes/gi, name: 'animation', suggestion: 'Animaciones CSS no son compatibles' },
  { pattern: /transition\s*:/gi, name: 'transition', suggestion: 'Transiciones CSS no son compatibles' },
  { pattern: /@media\s+\(prefers-/gi, name: 'prefers-media', suggestion: 'Media queries de preferencias no son compatibles' },
];

// Elements that shouldn't be in email HTML
const FORBIDDEN_ELEMENTS = [
  { pattern: /<script[\s\S]*?<\/script>/gi, name: 'script', message: 'JavaScript no está permitido en emails' },
  { pattern: /<iframe[\s\S]*?>/gi, name: 'iframe', message: 'iframes no están permitidos' },
  { pattern: /<form[\s\S]*?<\/form>/gi, name: 'form', message: 'Formularios no funcionan en la mayoría de clientes' },
  { pattern: /<video[\s\S]*?>/gi, name: 'video', message: 'Video HTML5 no es compatible. Usa una imagen con link' },
  { pattern: /<audio[\s\S]*?>/gi, name: 'audio', message: 'Audio HTML5 no es compatible' },
  { pattern: /<object[\s\S]*?>/gi, name: 'object', message: 'Objetos embebidos no son compatibles' },
  { pattern: /<embed[\s\S]*?>/gi, name: 'embed', message: 'Elementos embed no son compatibles' },
];

// Best practices checks
const BEST_PRACTICES = [
  { 
    check: (html: string) => !html.includes('<!DOCTYPE html>'),
    message: 'Falta DOCTYPE HTML',
    suggestion: 'Añade <!DOCTYPE html> al inicio',
    type: 'warning' as const
  },
  { 
    check: (html: string) => !html.includes('<meta charset'),
    message: 'Falta meta charset',
    suggestion: 'Añade <meta charset="utf-8">',
    type: 'warning' as const
  },
  { 
    check: (html: string) => !html.includes('viewport'),
    message: 'Falta meta viewport',
    suggestion: 'Añade <meta name="viewport" content="width=device-width">',
    type: 'warning' as const
  },
  { 
    check: (html: string) => {
      const imgWithoutAlt = html.match(/<img(?![^>]*alt=)[^>]*>/gi);
      return imgWithoutAlt && imgWithoutAlt.length > 0;
    },
    message: 'Algunas imágenes no tienen atributo alt',
    suggestion: 'Añade alt="" a todas las imágenes para accesibilidad',
    type: 'error' as const
  },
  { 
    check: (html: string) => {
      const links = html.match(/<a[^>]*>/gi) || [];
      return links.some(link => !link.includes('href='));
    },
    message: 'Algunos enlaces no tienen href',
    suggestion: 'Asegúrate de que todos los enlaces tengan href',
    type: 'error' as const
  },
  { 
    check: (html: string) => html.includes('http://') && !html.includes('https://'),
    message: 'URLs usando HTTP en lugar de HTTPS',
    suggestion: 'Usa HTTPS para mayor seguridad',
    type: 'warning' as const
  },
  {
    check: (html: string) => {
      const matches = html.match(/<table/gi);
      return !matches || matches.length === 0;
    },
    message: 'No se usan tablas para el layout',
    suggestion: 'Los emails deben usar tablas para layouts compatibles',
    type: 'info' as const
  },
];

export function validateEmailHtml(html: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  
  // Calculate stats
  const sizeInBytes = new Blob([html]).size;
  const stats = {
    sizeInBytes,
    sizeInKB: (sizeInBytes / 1024).toFixed(1),
    imageCount: (html.match(/<img/gi) || []).length,
    linkCount: (html.match(/<a /gi) || []).length,
    tableCount: (html.match(/<table/gi) || []).length,
    inlineStyleCount: (html.match(/style="/gi) || []).length,
  };

  // Check size limit (Gmail clips emails > 102KB)
  if (sizeInBytes > 102400) {
    issues.push({
      type: 'error',
      code: 'SIZE_LIMIT',
      message: `El HTML supera el límite de 102KB de Gmail (${stats.sizeInKB} KB)`,
      suggestion: 'Reduce el contenido o las imágenes inline'
    });
  } else if (sizeInBytes > 80000) {
    issues.push({
      type: 'warning',
      code: 'SIZE_WARNING',
      message: `El HTML está cerca del límite de Gmail (${stats.sizeInKB} KB / 102 KB)`,
      suggestion: 'Considera reducir el contenido'
    });
  }

  // Check for unsupported CSS
  UNSUPPORTED_CSS.forEach(({ pattern, name, suggestion }) => {
    if (pattern.test(html)) {
      // border-radius is common and just informational
      const type = name === 'border-radius' ? 'info' : 'warning';
      issues.push({
        type,
        code: `UNSUPPORTED_CSS_${name.toUpperCase()}`,
        message: `CSS no compatible detectado: ${name}`,
        suggestion
      });
    }
  });

  // Check for forbidden elements
  FORBIDDEN_ELEMENTS.forEach(({ pattern, name, message }) => {
    if (pattern.test(html)) {
      issues.push({
        type: 'error',
        code: `FORBIDDEN_${name.toUpperCase()}`,
        message
      });
    }
  });

  // Best practices checks
  BEST_PRACTICES.forEach(({ check, message, suggestion, type }) => {
    if (check(html)) {
      issues.push({
        type,
        code: 'BEST_PRACTICE',
        message,
        suggestion
      });
    }
  });

  // Check for external CSS (not inline)
  if (/<link[^>]*rel=["']stylesheet["'][^>]*>/gi.test(html)) {
    issues.push({
      type: 'error',
      code: 'EXTERNAL_CSS',
      message: 'CSS externo no es compatible con la mayoría de clientes',
      suggestion: 'Usa estilos inline o en un bloque <style> en el head'
    });
  }

  // Check for background images (limited support)
  if (/background(?:-image)?\s*:\s*url/gi.test(html)) {
    issues.push({
      type: 'warning',
      code: 'BACKGROUND_IMAGE',
      message: 'Imágenes de fondo tienen soporte limitado',
      suggestion: 'Outlook no soporta background-image en CSS'
    });
  }

  // Check for too many images
  if (stats.imageCount > 15) {
    issues.push({
      type: 'warning',
      code: 'TOO_MANY_IMAGES',
      message: `Demasiadas imágenes (${stats.imageCount})`,
      suggestion: 'Reduce el número de imágenes para mejor rendimiento'
    });
  }

  // Calculate score
  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  let score = 100;
  score -= errorCount * 15;
  score -= warningCount * 5;
  score = Math.max(0, Math.min(100, score));

  return {
    isValid: errorCount === 0,
    score,
    issues,
    stats
  };
}

// Quick check for critical issues only
export function quickValidateHtml(html: string): { hasErrors: boolean; errorCount: number; errors: string[] } {
  const result = validateEmailHtml(html);
  const errors = result.issues.filter(i => i.type === 'error').map(i => i.message);
  return {
    hasErrors: errors.length > 0,
    errorCount: errors.length,
    errors
  };
}