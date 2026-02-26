import type { Metric } from 'web-vitals';

/**
 * Send Web Vitals metrics to Google Analytics 4 via dataLayer
 */
const sendToGA4 = (metric: Metric) => {
  if (typeof window === 'undefined') return;

  const dl = (window as any).dataLayer;
  if (!dl) return;

  dl.push({
    event: 'web_vitals',
    web_vital_name: metric.name,
    web_vital_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    web_vital_id: metric.id,
    web_vital_rating: metric.rating,
    web_vital_delta: Math.round(metric.delta),
  });
};

/**
 * Initialize Web Vitals monitoring.
 * Dynamically imports web-vitals to avoid blocking initial load.
 */
export const initWebVitals = () => {
  import('web-vitals').then(({ onLCP, onCLS, onINP }) => {
    onLCP(sendToGA4);
    onCLS(sendToGA4);
    onINP(sendToGA4);
  });
};
