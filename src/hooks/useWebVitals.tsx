// ============= WEB VITALS HOOK =============
// Hook para monitorear Web Vitals con alertas

import { useState, useEffect, useCallback } from 'react';
import { performanceMonitor } from '@/utils/unifiedPerformanceMonitor';

interface WebVitalsData {
  FCP?: number;
  LCP?: number;
  FID?: number;
  INP?: number;
  CLS?: number;
}

interface VitalAlert {
  metric: keyof WebVitalsData;
  value: number;
  threshold: number;
  severity: 'good' | 'needs-improvement' | 'poor';
  message: string;
}

const VITALS_THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 }
};

export const useWebVitals = () => {
  const [vitals, setVitals] = useState<WebVitalsData>({});
  const [alerts, setAlerts] = useState<VitalAlert[]>([]);
  const [score, setScore] = useState<number>(0);

  const updateVitals = useCallback(() => {
    const currentVitals = performanceMonitor.getWebVitals();
    setVitals(currentVitals);
    
    // Generar alertas
    const newAlerts: VitalAlert[] = [];
    let totalScore = 0;
    let vitalsCount = 0;

    Object.entries(currentVitals).forEach(([key, value]) => {
      if (value === undefined) return;
      
      const metric = key as keyof WebVitalsData;
      const thresholds = VITALS_THRESHOLDS[metric];
      vitalsCount++;

      let severity: VitalAlert['severity'] = 'good';
      let vitalScore = 100;

      if (value > thresholds.poor) {
        severity = 'poor';
        vitalScore = 0;
      } else if (value > thresholds.good) {
        severity = 'needs-improvement';
        vitalScore = 50;
      }

      totalScore += vitalScore;

      if (severity !== 'good') {
        newAlerts.push({
          metric,
          value,
          threshold: thresholds.good,
          severity,
          message: generateAlertMessage(metric, value, severity)
        });
      }
    });

    setAlerts(newAlerts);
    setScore(vitalsCount > 0 ? Math.round(totalScore / vitalsCount) : 100);
  }, []);

  const generateAlertMessage = (
    metric: keyof WebVitalsData, 
    value: number, 
    severity: VitalAlert['severity']
  ): string => {
    const messages = {
      FCP: {
        'needs-improvement': `First Contentful Paint es lento (${Math.round(value)}ms). Objetivo: <1.8s`,
        'poor': `First Contentful Paint es muy lento (${Math.round(value)}ms). Crítico: >3s`
      },
      LCP: {
        'needs-improvement': `Largest Contentful Paint es lento (${Math.round(value)}ms). Objetivo: <2.5s`,
        'poor': `Largest Contentful Paint es muy lento (${Math.round(value)}ms). Crítico: >4s`
      },
      FID: {
        'needs-improvement': `First Input Delay es alto (${Math.round(value)}ms). Objetivo: <100ms`,
        'poor': `First Input Delay es muy alto (${Math.round(value)}ms). Crítico: >300ms`
      },
      INP: {
        'needs-improvement': `Interaction to Next Paint es alto (${Math.round(value)}ms). Objetivo: ≤200ms`,
        'poor': `Interaction to Next Paint es muy alto (${Math.round(value)}ms). Crítico: >500ms`
      },
      CLS: {
        'needs-improvement': `Cumulative Layout Shift es alto (${value.toFixed(3)}). Objetivo: <0.1`,
        'poor': `Cumulative Layout Shift es muy alto (${value.toFixed(3)}). Crítico: >0.25`
      }
    };

    return messages[metric][severity] || `${metric} necesita optimización`;
  };

  const getScoreColor = useCallback((score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  const getScoreLabel = useCallback((score: number): string => {
    if (score >= 90) return 'Excelente';
    if (score >= 70) return 'Bueno';
    if (score >= 50) return 'Necesita mejoras';
    return 'Pobre';
  }, []);

  // Actualizar cada 5 segundos
  useEffect(() => {
    updateVitals();
    const interval = setInterval(updateVitals, 5000);
    return () => clearInterval(interval);
  }, [updateVitals]);

  return {
    vitals,
    alerts,
    score,
    scoreLabel: getScoreLabel(score),
    scoreColor: getScoreColor(score),
    refresh: updateVitals
  };
};