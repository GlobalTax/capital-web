// ============= SECURITY MANAGER =============
// Sistema central de seguridad y protección

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface SecurityEvent {
  type: 'AUTH_ATTEMPT' | 'XSS_ATTEMPT' | 'CSRF_ATTEMPT' | 'RATE_LIMIT' | 'SUSPICIOUS_ACTIVITY';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDuration: number;
}

export class SecurityManager {
  private rateLimitStore = new Map<string, { count: number; resetTime: number; blocked?: boolean }>();
  private securityEvents: SecurityEvent[] = [];
  private blockedIPs = new Set<string>();

  private readonly DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
    'auth': { windowMs: 15 * 60 * 1000, maxRequests: 5, blockDuration: 30 * 60 * 1000 },
    'api': { windowMs: 60 * 1000, maxRequests: 100, blockDuration: 5 * 60 * 1000 },
    'contact': { windowMs: 10 * 60 * 1000, maxRequests: 3, blockDuration: 60 * 60 * 1000 }
  };

  // ============= RATE LIMITING =============
  checkRateLimit(identifier: string, category: string = 'api'): boolean {
    const config = this.DEFAULT_RATE_LIMITS[category];
    if (!config) return true;

    const key = `${category}:${identifier}`;
    const now = Date.now();
    const limit = this.rateLimitStore.get(key);

    // Verificar si está bloqueado
    if (limit?.blocked && now < limit.resetTime) {
      this.logSecurityEvent({
        type: 'RATE_LIMIT',
        severity: 'medium',
        details: { identifier, category, blocked: true }
      });
      return false;
    }

    // Resetear si la ventana ha expirado
    if (!limit || now > limit.resetTime) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    // Incrementar contador
    limit.count++;

    // Verificar límite
    if (limit.count > config.maxRequests) {
      limit.blocked = true;
      limit.resetTime = now + config.blockDuration;
      
      this.logSecurityEvent({
        type: 'RATE_LIMIT',
        severity: 'high',
        details: { identifier, category, count: limit.count, limit: config.maxRequests }
      });
      
      return false;
    }

    return true;
  }

  // ============= XSS PROTECTION =============
  detectXSSAttempt(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b/gi,
      /<object\b/gi,
      /<embed\b/gi,
      /on\w+\s*=/gi,
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /expression\s*\(/gi,
      /-moz-binding/gi,
      /eval\s*\(/gi,
      /document\.cookie/gi,
      /window\.location/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        this.logSecurityEvent({
          type: 'XSS_ATTEMPT',
          severity: 'high',
          details: { 
            input: input.substring(0, 200),
            pattern: pattern.source,
            detected: true
          }
        });
        return true;
      }
    }

    return false;
  }

  // ============= CSRF PROTECTION =============
  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  validateCSRFToken(token: string, sessionToken: string): boolean {
    // Implementación básica - en producción usar algoritmos más seguros
    const isValid = token === sessionToken && token.length === 64;
    
    if (!isValid) {
      this.logSecurityEvent({
        type: 'CSRF_ATTEMPT',
        severity: 'high',
        details: { tokenValid: false, tokenLength: token?.length }
      });
    }

    return isValid;
  }

  // ============= SUSPICIOUS ACTIVITY DETECTION =============
  detectSuspiciousActivity(sessionData: {
    rapidRequests?: number;
    unusualPatterns?: string[];
    geolocationChange?: boolean;
    userAgentChange?: boolean;
  }): boolean {
    const suspiciousFactors = [];

    if (sessionData.rapidRequests && sessionData.rapidRequests > 50) {
      suspiciousFactors.push('rapid_requests');
    }

    if (sessionData.unusualPatterns?.length && sessionData.unusualPatterns.length > 3) {
      suspiciousFactors.push('unusual_patterns');
    }

    if (sessionData.geolocationChange) {
      suspiciousFactors.push('geolocation_change');
    }

    if (sessionData.userAgentChange) {
      suspiciousFactors.push('user_agent_change');
    }

    const isSuspicious = suspiciousFactors.length >= 2;

    if (isSuspicious) {
      this.logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'medium',
        details: { factors: suspiciousFactors, ...sessionData }
      });
    }

    return isSuspicious;
  }

  // ============= INPUT SANITIZATION =============
  sanitizeInput(input: string, options: {
    allowHTML?: boolean;
    maxLength?: number;
    stripScripts?: boolean;
  } = {}): string {
    let sanitized = input;

    // Detectar XSS primero
    if (this.detectXSSAttempt(input)) {
      // Log ya realizado en detectXSSAttempt
    }

    // Remover scripts si está habilitado
    if (options.stripScripts !== false) {
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    // Limitar longitud
    if (options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    // Escape HTML si no se permite
    if (!options.allowHTML) {
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    return sanitized.trim();
  }

  // ============= LOGGING & MONITORING =============
  private logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
      userAgent: navigator?.userAgent,
      ipAddress: 'client' // En el cliente no podemos obtener la IP real
    };

    this.securityEvents.push(fullEvent);
    
    // Mantener solo los últimos 1000 eventos
    if (this.securityEvents.length > 1000) {
      this.securityEvents.shift();
    }

    // Log en consola para desarrollo
    logger.warn('Security event detected', fullEvent, { 
      context: 'security', 
      component: 'SecurityManager' 
    });

    // En producción, enviar a servidor
    if (event.severity === 'high' || event.severity === 'critical') {
      this.reportSecurityEvent(fullEvent);
    }
  }

  private async reportSecurityEvent(event: SecurityEvent) {
    try {
      // Enviar evento de seguridad al backend
      await supabase.functions.invoke('security-events', {
        body: { event }
      });
    } catch (error) {
      logger.error('Failed to report security event', error as Error, { 
        context: 'security', 
        component: 'SecurityManager' 
      });
    }
  }

  // ============= PUBLIC METHODS =============
  getSecurityMetrics() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    
    const recentEvents = this.securityEvents.filter(
      event => event.timestamp.getTime() > last24h
    );

    const eventsByType = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsBySeverity = recentEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents: recentEvents.length,
      eventsByType,
      eventsBySeverity,
      activeRateLimits: this.rateLimitStore.size,
      blockedIPs: this.blockedIPs.size
    };
  }

  clearSecurityEvents() {
    this.securityEvents = [];
    this.rateLimitStore.clear();
    this.blockedIPs.clear();
  }

  // ============= VALIDATION HELPERS =============
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && !this.detectXSSAttempt(email);
  }

  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 9 && phone.length <= 20;
  }

  validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol) && !this.detectXSSAttempt(url);
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const securityManager = new SecurityManager();