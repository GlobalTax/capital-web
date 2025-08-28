/**
 * Sistema de Feature Flags para desarrollo seguro
 * Permite habilitar/deshabilitar funcionalidades de forma controlada
 */

import { secureLogger } from './secureLogger';

export type FeatureFlagKey = 
  | 'enhanced_logging'
  | 'security_monitoring'
  | 'performance_tracking'
  | 'admin_analytics'
  | 'experimental_features'
  | 'debug_mode'
  | 'maintenance_mode'
  | 'new_valuation_flow'
  | 'enhanced_security'
  | 'api_rate_limiting';

interface FeatureFlag {
  key: FeatureFlagKey;
  enabled: boolean;
  description: string;
  environment: 'development' | 'staging' | 'production' | 'all';
  rolloutPercentage?: number;
  conditions?: {
    userRole?: string[];
    userEmail?: string[];
    ipAddress?: string[];
  };
  metadata?: Record<string, any>;
}

class FeatureFlagManager {
  private flags: Map<FeatureFlagKey, FeatureFlag> = new Map();
  private currentEnvironment: 'development' | 'staging' | 'production';
  private userId?: string;
  private userRole?: string;
  private userEmail?: string;

  constructor() {
    this.currentEnvironment = this.detectEnvironment();
    this.initializeDefaultFlags();
    this.loadUserContext();
  }

  private detectEnvironment(): 'development' | 'staging' | 'production' {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
      return 'development';
    } else if (hostname.includes('staging') || hostname.includes('preview')) {
      return 'staging';
    } else {
      return 'production';
    }
  }

  private async loadUserContext(): Promise<void> {
    try {
      // Intentar obtener contexto del usuario de localStorage o Supabase
      const authData = localStorage.getItem('supabase.auth.token');
      if (authData) {
        const parsed = JSON.parse(authData);
        this.userId = parsed?.user?.id;
        this.userEmail = parsed?.user?.email;
        // El rol se puede obtener de una consulta a la base de datos si es necesario
      }
    } catch (error) {
      secureLogger.warn('Failed to load user context for feature flags', error, {
        context: 'system',
        component: 'feature_flags'
      });
    }
  }

  private initializeDefaultFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        key: 'enhanced_logging',
        enabled: true,
        description: 'Sistema de logging mejorado con contexto',
        environment: 'all'
      },
      {
        key: 'security_monitoring',
        enabled: true,
        description: 'Monitoreo de seguridad en tiempo real',
        environment: 'all'
      },
      {
        key: 'performance_tracking',
        enabled: this.currentEnvironment !== 'production',
        description: 'Tracking detallado de rendimiento',
        environment: 'all'
      },
      {
        key: 'admin_analytics',
        enabled: true,
        description: 'Analytics avanzados para administradores',
        environment: 'all',
        conditions: {
          userRole: ['admin', 'super_admin']
        }
      },
      {
        key: 'experimental_features',
        enabled: this.currentEnvironment === 'development',
        description: 'Funcionalidades experimentales',
        environment: 'development'
      },
      {
        key: 'debug_mode',
        enabled: this.currentEnvironment === 'development',
        description: 'Modo debug con información adicional',
        environment: 'development'
      },
      {
        key: 'maintenance_mode',
        enabled: false,
        description: 'Modo mantenimiento para bloquear acceso',
        environment: 'all'
      },
      {
        key: 'new_valuation_flow',
        enabled: false,
        description: 'Nuevo flujo de valoración optimizado',
        environment: 'all',
        rolloutPercentage: 0 // Gradual rollout
      },
      {
        key: 'enhanced_security',
        enabled: true,
        description: 'Características de seguridad mejoradas',
        environment: 'all'
      },
      {
        key: 'api_rate_limiting',
        enabled: this.currentEnvironment === 'production',
        description: 'Rate limiting estricto en APIs',
        environment: 'production'
      }
    ];

    defaultFlags.forEach(flag => {
      this.flags.set(flag.key, flag);
    });

    secureLogger.info('Feature flags initialized', {
      environment: this.currentEnvironment,
      totalFlags: defaultFlags.length,
      enabledFlags: defaultFlags.filter(f => f.enabled).length
    }, { context: 'system', component: 'feature_flags' });
  }

  /**
   * Verificar si una feature flag está habilitada
   */
  isEnabled(key: FeatureFlagKey): boolean {
    const flag = this.flags.get(key);
    
    if (!flag) {
      secureLogger.warn(`Feature flag not found: ${key}`, undefined, {
        context: 'system',
        component: 'feature_flags'
      });
      return false;
    }

    // Verificar entorno
    if (flag.environment !== 'all' && flag.environment !== this.currentEnvironment) {
      return false;
    }

    // Si está deshabilitada globalmente
    if (!flag.enabled) {
      return false;
    }

    // Verificar condiciones específicas
    if (flag.conditions) {
      if (flag.conditions.userRole && this.userRole) {
        if (!flag.conditions.userRole.includes(this.userRole)) {
          return false;
        }
      }

      if (flag.conditions.userEmail && this.userEmail) {
        if (!flag.conditions.userEmail.includes(this.userEmail)) {
          return false;
        }
      }

      if (flag.conditions.ipAddress) {
        // Implementar verificación de IP si es necesario
        // Por ahora no implementado por privacidad
      }
    }

    // Verificar rollout percentage
    if (flag.rolloutPercentage !== undefined) {
      const userHash = this.hashUserId(this.userId || 'anonymous');
      const percentage = userHash % 100;
      
      if (percentage >= flag.rolloutPercentage) {
        return false;
      }
    }

    return true;
  }

  /**
   * Habilitar/deshabilitar una feature flag
   */
  setFlag(key: FeatureFlagKey, enabled: boolean, reason?: string): void {
    const flag = this.flags.get(key);
    
    if (flag) {
      flag.enabled = enabled;
      this.flags.set(key, flag);
      
      secureLogger.info(`Feature flag ${enabled ? 'enabled' : 'disabled'}: ${key}`, {
        reason,
        environment: this.currentEnvironment,
        userId: this.userId
      }, { context: 'system', component: 'feature_flags' });
    }
  }

  /**
   * Actualizar el rollout percentage de una feature flag
   */
  setRolloutPercentage(key: FeatureFlagKey, percentage: number): void {
    const flag = this.flags.get(key);
    
    if (flag) {
      flag.rolloutPercentage = Math.max(0, Math.min(100, percentage));
      this.flags.set(key, flag);
      
      secureLogger.info(`Feature flag rollout updated: ${key}`, {
        percentage: flag.rolloutPercentage,
        environment: this.currentEnvironment
      }, { context: 'system', component: 'feature_flags' });
    }
  }

  /**
   * Obtener información de todas las feature flags
   */
  getAllFlags(): Array<FeatureFlag & { isEnabled: boolean }> {
    return Array.from(this.flags.values()).map(flag => ({
      ...flag,
      isEnabled: this.isEnabled(flag.key)
    }));
  }

  /**
   * Obtener solo las flags habilitadas
   */
  getEnabledFlags(): FeatureFlagKey[] {
    return Array.from(this.flags.keys()).filter(key => this.isEnabled(key));
  }

  /**
   * Rollback de emergencia - deshabilitar todas las flags experimentales
   */
  emergencyRollback(reason: string): void {
    const experimentalFlags: FeatureFlagKey[] = [
      'experimental_features',
      'new_valuation_flow'
    ];

    experimentalFlags.forEach(key => {
      this.setFlag(key, false, `Emergency rollback: ${reason}`);
    });

    secureLogger.critical('Emergency rollback executed', {
      reason,
      disabledFlags: experimentalFlags,
      environment: this.currentEnvironment
    }, { context: 'system', component: 'feature_flags' });
  }

  /**
   * Modo de mantenimiento
   */
  enableMaintenanceMode(reason: string): void {
    this.setFlag('maintenance_mode', true, reason);
    
    secureLogger.critical('Maintenance mode enabled', {
      reason,
      environment: this.currentEnvironment
    }, { context: 'system', component: 'feature_flags' });
  }

  /**
   * Salir del modo de mantenimiento
   */
  disableMaintenanceMode(reason: string): void {
    this.setFlag('maintenance_mode', false, reason);
    
    secureLogger.info('Maintenance mode disabled', {
      reason,
      environment: this.currentEnvironment
    }, { context: 'system', component: 'feature_flags' });
  }

  /**
   * Hash simple para distribución de rollout
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Actualizar contexto de usuario
   */
  updateUserContext(userId: string, userRole?: string, userEmail?: string): void {
    this.userId = userId;
    this.userRole = userRole;
    this.userEmail = userEmail;

    secureLogger.debug('User context updated for feature flags', {
      userId,
      userRole,
      environment: this.currentEnvironment
    }, { context: 'system', component: 'feature_flags' });
  }
}

// Instancia singleton
export const featureFlags = new FeatureFlagManager();

// Hook para usar en componentes React
export const useFeatureFlag = (key: FeatureFlagKey): boolean => {
  return featureFlags.isEnabled(key);
};

// Hook para múltiples feature flags
export const useFeatureFlags = (keys: FeatureFlagKey[]): Record<FeatureFlagKey, boolean> => {
  const result: Record<string, boolean> = {};
  keys.forEach(key => {
    result[key] = featureFlags.isEnabled(key);
  });
  return result as Record<FeatureFlagKey, boolean>;
};

export default featureFlags;