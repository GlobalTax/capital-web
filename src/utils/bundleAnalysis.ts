// ============= BUNDLE ANALYSIS UTILITIES =============
// Utilidades para análisis y optimización de bundle

// Función para analizar el tamaño de bundle en desarrollo
export const logBundleSize = () => {
  if (import.meta.env.DEV) {
    // Simular análisis de bundle (en producción usarías webpack-bundle-analyzer)
    const estimatedSizes = {
      'vendor.js': '250KB',
      'admin.js': '180KB', 
      'dashboard.js': '120KB',
      'blog.js': '90KB',
      'main.js': '150KB'
    };

    console.group('📦 Bundle Analysis');
    Object.entries(estimatedSizes).forEach(([chunk, size]) => {
      console.log(`${chunk}: ${size}`);
    });
    console.groupEnd();
  }
};

// Preload de chunks críticos
export const preloadCriticalChunks = () => {
  const criticalChunks = [
    '/assets/vendor.js',
    '/assets/main.js'
  ];

  criticalChunks.forEach(chunk => {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = chunk;
    document.head.appendChild(link);
  });
};

// Monitor de recursos cargados
export const monitorResourceLoading = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource');
      
      console.group('🚀 Performance Metrics');
      console.log(`Page Load: ${navigation.loadEventEnd - navigation.fetchStart}ms`);
      console.log(`DOM Content Loaded: ${navigation.domContentLoadedEventEnd - navigation.fetchStart}ms`);
      console.log(`Resources Loaded: ${resources.length}`);
      console.groupEnd();
    });
  }
};