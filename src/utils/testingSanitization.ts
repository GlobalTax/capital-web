
/**
 * Utilidades para testing y verificación de sanitización
 */

import { sanitizeText, detectXSSAttempt, sanitizeObject } from './sanitization';

// Casos de test para XSS
export const XSS_TEST_CASES = [
  '<script>alert("xss")</script>',
  'javascript:void(0)',
  '<img src="x" onerror="alert(1)">',
  '<iframe src="javascript:alert(1)"></iframe>',
  '<svg onload="alert(1)">',
  '<a href="javascript:alert(1)">click</a>',
  '"><script>alert(1)</script>',
  "'; alert(1); //",
  '<script>document.cookie</script>',
  'vbscript:msgbox("xss")'
];

// Casos de test válidos que no deberían ser sanitizados excesivamente
export const VALID_TEST_CASES = [
  'Empresa S.L.',
  'Juan Pérez García',
  '+34 600 123 456',
  'contacto@empresa.com',
  'Calle Mayor, 123',
  'Madrid - España',
  '1.500.000€ facturación',
  'Tecnología & Innovación'
];

/**
 * Ejecuta tests de sanitización y devuelve resultados
 */
export const runSanitizationTests = () => {
  const results = {
    xssTests: [] as Array<{ input: string; detected: boolean; sanitized: string }>,
    validTests: [] as Array<{ input: string; preserved: boolean; sanitized: string }>
  };

  // Test de detección de XSS
  XSS_TEST_CASES.forEach(testCase => {
    const detected = detectXSSAttempt(testCase);
    const sanitized = sanitizeText(testCase, 'STRICT');
    
    results.xssTests.push({
      input: testCase,
      detected,
      sanitized
    });
  });

  // Test de preservación de contenido válido
  VALID_TEST_CASES.forEach(testCase => {
    const sanitized = sanitizeText(testCase, 'STRICT');
    const preserved = sanitized.length > 0 && !sanitized.includes('&lt;') && !sanitized.includes('&gt;');
    
    results.validTests.push({
      input: testCase,
      preserved,
      sanitized
    });
  });

  return results;
};

/**
 * Verifica la configuración de sanitización
 */
export const verifySanitizationConfig = () => {
  const testData = {
    name: '<script>alert("hack")</script>Juan Pérez',
    email: 'test@example.com<script>',
    company: 'Mi Empresa & Asociados',
    phone: '+34 600<script>alert(1)</script> 123 456'
  };

  const sanitized = sanitizeObject(testData);
  
  return {
    original: testData,
    sanitized,
    safe: Object.values(sanitized).every(value => 
      typeof value === 'string' && !value.includes('<script>')
    )
  };
};

/**
 * Monitor de performance de sanitización
 */
export const benchmarkSanitization = (iterations: number = 1000) => {
  const testString = 'Empresa <script>alert("test")</script> & Asociados S.L.';
  
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    sanitizeText(testString, 'STRICT');
  }
  
  const end = performance.now();
  const avgTime = (end - start) / iterations;
  
  return {
    iterations,
    totalTime: end - start,
    averageTime: avgTime,
    operationsPerSecond: 1000 / avgTime
  };
};

/**
 * Log de resultados de testing en consola
 */
export const logSanitizationTestResults = () => {
  console.group('🔒 Resultados de Testing de Sanitización');
  
  const testResults = runSanitizationTests();
  const configResults = verifySanitizationConfig();
  const benchmarkResults = benchmarkSanitization();
  
  console.log('✅ Tests de XSS:', testResults.xssTests);
  console.log('✅ Tests de contenido válido:', testResults.validTests);
  console.log('⚙️ Verificación de configuración:', configResults);
  console.log('⚡ Benchmark de performance:', benchmarkResults);
  
  console.groupEnd();
  
  return {
    xss: testResults.xssTests,
    valid: testResults.validTests,
    config: configResults,
    benchmark: benchmarkResults
  };
};
