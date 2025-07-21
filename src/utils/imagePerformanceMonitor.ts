interface ImagePerformanceMetric {
  url: string;
  loadTime: number;
  size?: number;
  fromCache: boolean;
  timestamp: number;
  viewport: string;
}

class ImagePerformanceMonitor {
  private metrics: ImagePerformanceMetric[] = [];
  private isEnabled = process.env.NODE_ENV === 'development';

  recordImageLoad(url: string, loadTime: number, fromCache: boolean = false, size?: number) {
    if (!this.isEnabled) return;
    
    const viewport = this.getCurrentViewport();
    
    this.metrics.push({
      url,
      loadTime,
      size,
      fromCache,
      timestamp: Date.now(),
      viewport
    });

    // Log slow images
    if (loadTime > 2000) {
      console.warn(`🐌 Slow image load: ${url} took ${loadTime}ms`);
    }

    // Clean old metrics (keep last hour)
    const oneHourAgo = Date.now() - 3600000;
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
  }

  private getCurrentViewport(): string {
    const width = window.innerWidth;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  getMetrics() {
    return this.metrics;
  }

  getAverageLoadTime(viewport?: string) {
    const relevantMetrics = viewport 
      ? this.metrics.filter(m => m.viewport === viewport)
      : this.metrics;
    
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, m) => acc + m.loadTime, 0);
    return sum / relevantMetrics.length;
  }

  getCacheHitRate() {
    if (this.metrics.length === 0) return 0;
    
    const cacheHits = this.metrics.filter(m => m.fromCache).length;
    return (cacheHits / this.metrics.length) * 100;
  }

  getSlowestImages(limit: number = 5) {
    return [...this.metrics]
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, limit);
  }

  getLargestImages(limit: number = 5) {
    return [...this.metrics]
      .filter(m => m.size)
      .sort((a, b) => (b.size || 0) - (a.size || 0))
      .slice(0, limit);
  }

  getPerformanceReport() {
    const totalImages = this.metrics.length;
    const avgLoadTime = this.getAverageLoadTime();
    const cacheHitRate = this.getCacheHitRate();
    const slowImages = this.getSlowestImages();
    const largeImages = this.getLargestImages();
    
    return {
      totalImages,
      avgLoadTime: Math.round(avgLoadTime),
      cacheHitRate: Math.round(cacheHitRate),
      slowImages,
      largeImages,
      byViewport: {
        mobile: Math.round(this.getAverageLoadTime('mobile')),
        tablet: Math.round(this.getAverageLoadTime('tablet')),
        desktop: Math.round(this.getAverageLoadTime('desktop'))
      }
    };
  }

  clear() {
    this.metrics = [];
  }
}

export const imagePerformanceMonitor = new ImagePerformanceMonitor();

// Hook para medir rendimiento de imágenes
export const useImagePerformanceTracking = () => {
  const trackImageLoad = (url: string, startTime: number, fromCache: boolean = false) => {
    const loadTime = performance.now() - startTime;
    imagePerformanceMonitor.recordImageLoad(url, loadTime, fromCache);
  };

  return { trackImageLoad };
};

// Función para obtener reporte de rendimiento
export const getImagePerformanceReport = () => {
  return imagePerformanceMonitor.getPerformanceReport();
};

// Función para logs automáticos del rendimiento
export const logImagePerformance = () => {
  if (process.env.NODE_ENV === 'development') {
    const report = getImagePerformanceReport();
    console.group('📊 Image Performance Report');
    console.log('Total images loaded:', report.totalImages);
    console.log('Average load time:', `${report.avgLoadTime}ms`);
    console.log('Cache hit rate:', `${report.cacheHitRate}%`);
    console.log('Performance by viewport:', report.byViewport);
    if (report.slowImages.length > 0) {
      console.warn('Slowest images:', report.slowImages);
    }
    console.groupEnd();
  }
};
