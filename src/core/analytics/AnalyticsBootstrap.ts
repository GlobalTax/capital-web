export class AnalyticsBootstrap {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Inicializar analytics de rendimiento de forma diferida
      setTimeout(async () => {
        try {
          const { performanceAnalytics } = await import('@/utils/performanceAnalytics');
          
          const handleRouteChange = () => {
            performanceAnalytics.recordPageView(window.location.pathname);
          };
          
          window.addEventListener('popstate', handleRouteChange);
          handleRouteChange();

          return () => {
            window.removeEventListener('popstate', handleRouteChange);
          };
        } catch (error) {
          console.warn('Failed to initialize performance analytics:', error);
        }
      }, 1000);

      this.initialized = true;
    } catch (error) {
      console.warn('Analytics bootstrap failed:', error);
    }
  }
}