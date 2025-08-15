/**
 * Sistema de monitoreo de seguridad mejorado
 * Registra eventos de seguridad y detecta patrones sospechosos
 */

export interface SecurityEvent {
  id: string;
  type: 'xss_attempt' | 'injection_attempt' | 'rate_limit_exceeded' | 'invalid_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, any>;
  timestamp: string;
  session_id?: string;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private rateLimitMap = new Map<string, { count: number; lastReset: number }>();
  
  // Configuración
  private readonly MAX_EVENTS = 1000;
  private readonly ALERT_THRESHOLD = 10; // eventos críticos en 5 minutos

  /**
   * Registra un evento de seguridad
   */
  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date().toISOString()
    };

    this.events.push(securityEvent);
    
    // Limpiar eventos antiguos
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Log en consola para desarrollo
    console.warn('Security Event:', securityEvent);

    // Verificar si necesitamos enviar alerta
    this.checkForCriticalAlerts();
  }

  /**
   * Verifica rate limiting para una IP específica
   */
  checkRateLimit(ip: string, windowMs: number = 60000, maxRequests: number = 100): boolean {
    const now = Date.now();
    const current = this.rateLimitMap.get(ip) || { count: 0, lastReset: now };
    
    // Reset contador si ha pasado la ventana de tiempo
    if (now - current.lastReset > windowMs) {
      current.count = 0;
      current.lastReset = now;
    }
    
    current.count++;
    this.rateLimitMap.set(ip, current);
    
    const exceeded = current.count > maxRequests;
    
    if (exceeded) {
      this.logSecurityEvent({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        ip_address: ip,
        details: {
          requests_count: current.count,
          max_allowed: maxRequests,
          window_ms: windowMs
        }
      });
    }
    
    return !exceeded;
  }

  /**
   * Detecta intentos de XSS básicos
   */
  detectXSSAttempt(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi
    ];

    const hasXSS = xssPatterns.some(pattern => pattern.test(input));

    if (hasXSS) {
      this.logSecurityEvent({
        type: 'xss_attempt',
        severity: 'high',
        details: {
          input: input.substring(0, 500), // Limitar longitud para logging
          detected_patterns: xssPatterns.filter(p => p.test(input)).map(p => p.source)
        }
      });
    }

    return hasXSS;
  }

  /**
   * Detecta intentos de inyección SQL básicos
   */
  detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(\b(OR|AND)\s+[\d\w]+\s*=\s*[\d\w]+)/gi,
      /(;\s*--)/gi,
      /(';\s*(SELECT|INSERT|UPDATE|DELETE))/gi,
      /(\b(SCRIPT|SCRIPT>))/gi
    ];

    const hasSQL = sqlPatterns.some(pattern => pattern.test(input));

    if (hasSQL) {
      this.logSecurityEvent({
        type: 'injection_attempt',
        severity: 'critical',
        details: {
          input: input.substring(0, 500),
          detected_patterns: sqlPatterns.filter(p => p.test(input)).map(p => p.source)
        }
      });
    }

    return hasSQL;
  }

  /**
   * Verifica patrones de actividad sospechosa
   */
  detectSuspiciousActivity(sessionData: {
    rapidRequests?: number;
    unusualPatterns?: string[];
    geolocationChange?: boolean;
    userAgentChange?: boolean;
  }): boolean {
    let suspicionScore = 0;
    const details: Record<string, any> = {};

    if (sessionData.rapidRequests && sessionData.rapidRequests > 50) {
      suspicionScore += 30;
      details.rapid_requests = sessionData.rapidRequests;
    }

    if (sessionData.geolocationChange) {
      suspicionScore += 40;
      details.geolocation_change = true;
    }

    if (sessionData.userAgentChange) {
      suspicionScore += 25;
      details.user_agent_change = true;
    }

    if (sessionData.unusualPatterns && sessionData.unusualPatterns.length > 0) {
      suspicionScore += sessionData.unusualPatterns.length * 10;
      details.unusual_patterns = sessionData.unusualPatterns;
    }

    const isSuspicious = suspicionScore > 50;

    if (isSuspicious) {
      this.logSecurityEvent({
        type: 'suspicious_activity',
        severity: suspicionScore > 80 ? 'critical' : 'high',
        details: {
          ...details,
          suspicion_score: suspicionScore
        }
      });
    }

    return isSuspicious;
  }

  /**
   * Genera alertas para eventos críticos
   */
  private checkForCriticalAlerts(): void {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);

    const recentCriticalEvents = this.events.filter(event => 
      event.severity === 'critical' && 
      new Date(event.timestamp).getTime() > fiveMinutesAgo
    );

    if (recentCriticalEvents.length >= this.ALERT_THRESHOLD) {
      console.error('CRITICAL SECURITY ALERT: Multiple critical events detected', {
        count: recentCriticalEvents.length,
        events: recentCriticalEvents.map(e => ({ type: e.type, timestamp: e.timestamp }))
      });

      // En producción, aquí se enviaría una notificación real
      // Por ejemplo, llamar a una función edge para enviar email o Slack
    }
  }

  /**
   * Obtiene métricas de seguridad
   */
  getSecurityMetrics(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    recentEvents: SecurityEvent[];
  } {
    const eventsByType = this.events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsBySeverity = this.events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentEvents = this.events.filter(event => 
      new Date(event.timestamp).getTime() > oneHourAgo
    );

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      recentEvents
    };
  }

  /**
   * Limpia eventos antiguos y datos de rate limiting
   */
  clearOldData(): void {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    // Limpiar eventos antiguos
    this.events = this.events.filter(event => 
      new Date(event.timestamp).getTime() > oneDayAgo
    );

    // Limpiar rate limiting antiguo
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [ip, data] of this.rateLimitMap.entries()) {
      if (data.lastReset < oneHourAgo) {
        this.rateLimitMap.delete(ip);
      }
    }
  }

  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Instancia singleton
export const securityMonitor = new SecurityMonitor();

// Auto-limpiar datos antiguos cada hora
setInterval(() => {
  securityMonitor.clearOldData();
}, 60 * 60 * 1000);