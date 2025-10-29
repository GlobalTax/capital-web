/**
 * SECURITY HARDENING UTILITIES
 * 
 * Utilidades centralizadas para fortificación de seguridad
 * Incluye validación avanzada, sanitización y detección de amenazas
 */

import { securityManager } from '@/core/security/SecurityManager';

// ============= HONEYPOT UTILITIES =============

export interface HoneypotConfig {
  fieldName: string;
  formType: string;
  logEnabled?: boolean;
}

export function createHoneypotField(config: HoneypotConfig) {
  return {
    name: config.fieldName,
    type: 'text' as const,
    tabIndex: -1,
    autoComplete: 'off',
    'aria-hidden': true,
    style: {
      position: 'absolute' as const,
      left: '-9999px',
      width: '1px',
      height: '1px',
      opacity: 0,
      pointerEvents: 'none' as const
    }
  };
}

export function validateHoneypot(
  honeypotValue: string,
  config: HoneypotConfig
): boolean {
  if (honeypotValue && honeypotValue.trim().length > 0) {
    if (config.logEnabled !== false) {
      console.warn('[Security] Honeypot triggered:', config.formType);
    }
    return false; // Bot detected
  }
  return true; // Human user
}

// ============= RATE LIMITING UTILITIES =============

export interface RateLimitConfig {
  identifier: string;
  category: string;
  maxRequests: number;
  windowMs: number;
}

export function checkClientRateLimit(config: RateLimitConfig): boolean {
  const key = `rate_limit_${config.category}_${config.identifier}`;
  const now = Date.now();
  
  // Get stored data
  const stored = localStorage.getItem(key);
  let requests: number[] = stored ? JSON.parse(stored) : [];
  
  // Filter out old requests
  requests = requests.filter(timestamp => now - timestamp < config.windowMs);
  
  // Check if limit exceeded
  if (requests.length >= config.maxRequests) {
    console.warn('[Security] Rate limit exceeded:', config.category);
    return false;
  }
  
  // Add current request
  requests.push(now);
  localStorage.setItem(key, JSON.stringify(requests));
  
  return true;
}

// ============= INPUT SANITIZATION =============

export function sanitizeFormInput(
  input: string,
  type: 'text' | 'email' | 'phone' | 'url' = 'text'
): string {
  if (!input) return '';
  
  let sanitized = input.trim();
  
  // Type-specific sanitization
  switch (type) {
    case 'email':
      // Remove everything except valid email characters
      sanitized = sanitized.replace(/[^a-zA-Z0-9@._+-]/g, '');
      break;
      
    case 'phone':
      // Remove everything except numbers, +, -, (, ), spaces
      sanitized = sanitized.replace(/[^0-9+\-() ]/g, '');
      break;
      
    case 'url':
      // Use SecurityManager's URL validation
      try {
        const url = new URL(sanitized);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return '';
        }
      } catch {
        return '';
      }
      break;
      
    case 'text':
    default:
      // General sanitization
      sanitized = securityManager.sanitizeInput(sanitized, {
        allowHTML: false,
        stripScripts: true,
        maxLength: 1000
      });
      break;
  }
  
  return sanitized;
}

// ============= SUSPICIOUS ACTIVITY DETECTION =============

export interface ActivityTracker {
  rapidRequestCount: number;
  lastRequestTime: number;
  geolocation?: { latitude: number; longitude: number };
  userAgent: string;
}

const activityTrackers = new Map<string, ActivityTracker>();

export function trackUserActivity(userId: string): void {
  const now = Date.now();
  const tracker = activityTrackers.get(userId) || {
    rapidRequestCount: 0,
    lastRequestTime: now,
    userAgent: navigator.userAgent
  };
  
  // Check for rapid requests (< 1 second apart)
  if (now - tracker.lastRequestTime < 1000) {
    tracker.rapidRequestCount++;
  } else {
    tracker.rapidRequestCount = 0;
  }
  
  tracker.lastRequestTime = now;
  activityTrackers.set(userId, tracker);
  
  // Detect suspicious activity
  if (tracker.rapidRequestCount > 10) {
    securityManager.detectSuspiciousActivity({
      rapidRequests: tracker.rapidRequestCount,
      unusualPatterns: ['rapid_requests']
    });
  }
}

// ============= CSRF TOKEN UTILITIES =============

export function getCSRFToken(): string {
  let token = sessionStorage.getItem('csrf_token');
  if (!token) {
    token = securityManager.generateCSRFToken();
    sessionStorage.setItem('csrf_token', token);
  }
  return token;
}

export function validateCSRFToken(token: string): boolean {
  const sessionToken = sessionStorage.getItem('csrf_token');
  if (!sessionToken) return false;
  
  return securityManager.validateCSRFToken(token, sessionToken);
}

// ============= CONTENT SECURITY POLICY =============

export function enforceCSP(): void {
  // Set security headers via meta tags
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://cdn-st.adsmurai.com https://consent.cookiebot.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://fwhqtzkkvnjkazhaficj.supabase.co wss://fwhqtzkkvnjkazhaficj.supabase.co https://www.google-analytics.com",
    "frame-src 'self' https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ');
  
  document.head.appendChild(meta);
}

// ============= SECURITY METRICS =============

export function getSecurityHealth(): {
  score: number;
  issues: string[];
  recommendations: string[];
} {
  const metrics = securityManager.getSecurityMetrics();
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;
  
  // Check for high severity events
  if (metrics.eventsBySeverity.high > 0) {
    score -= 30;
    issues.push(`${metrics.eventsBySeverity.high} high severity security events`);
    recommendations.push('Review security logs and address high severity issues immediately');
  }
  
  if (metrics.eventsBySeverity.critical > 0) {
    score -= 50;
    issues.push(`${metrics.eventsBySeverity.critical} CRITICAL security events`);
    recommendations.push('URGENT: Critical security issues require immediate attention');
  }
  
  // Check for rate limiting
  if (metrics.activeRateLimits > 10) {
    score -= 10;
    issues.push('High number of rate limit violations');
    recommendations.push('Monitor for potential DDoS or brute force attacks');
  }
  
  // Check for blocked IPs
  if (metrics.blockedIPs > 0) {
    score -= 5;
    issues.push(`${metrics.blockedIPs} IP addresses currently blocked`);
    recommendations.push('Review blocked IPs list for false positives');
  }
  
  return {
    score: Math.max(0, score),
    issues,
    recommendations
  };
}

// ============= INITIALIZATION =============

export function initializeSecurityHardening(): void {
  // Enforce CSP
  if (typeof document !== 'undefined') {
    enforceCSP();
  }
  
  // Clear old security data periodically
  if (typeof window !== 'undefined') {
    setInterval(() => {
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      
      // Clear old rate limit data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('rate_limit_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const requests: number[] = JSON.parse(stored);
            const filtered = requests.filter(ts => ts > oneDayAgo);
            if (filtered.length === 0) {
              localStorage.removeItem(key);
            } else {
              localStorage.setItem(key, JSON.stringify(filtered));
            }
          }
        }
      }
    }, 60 * 60 * 1000); // Run every hour
  }
}
