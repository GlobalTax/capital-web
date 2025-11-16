import { supabase } from '@/integrations/supabase/client';

export interface TrackingConfiguration {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  linkedInInsightTag?: string;
  hotjarId?: string;
  cookiebotId?: string;
  enableCMP?: boolean;
  enableHeatmaps?: boolean;
  enableSessionRecording?: boolean;
  enableLeadTracking?: boolean;
  enableBrevoTracking?: boolean;
  brevoClientKey?: string;
  customTrackingCode?: string;
}

export class TrackingConfigService {
  private static readonly STORAGE_KEY = 'capittal_tracking_config';
  
  // Save configuration to localStorage and optionally to Supabase
  static async saveConfiguration(config: TrackingConfiguration): Promise<void> {
    try {
      // Save to localStorage for immediate use
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      
      // TODO: Save to Supabase for admin users
      // This would require authentication and proper table structure
      console.log('Tracking configuration saved:', config);
    } catch (error) {
      console.error('Error saving tracking configuration:', error);
      throw error;
    }
  }
  
  // Load configuration from localStorage and optionally from Supabase
  static async loadConfiguration(): Promise<TrackingConfiguration> {
    try {
      // Load from localStorage first
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return default configuration with all tracking IDs
      return {
        enableHeatmaps: true,
        enableSessionRecording: false,
        enableLeadTracking: true,
        enableCMP: true,
        enableBrevoTracking: true,
        googleAnalyticsId: 'G-Z97ZB4YKPF',
        googleTagManagerId: 'GTM-N35CP3R9',
        facebookPixelId: '381068095046019',
        cookiebotId: 'c5f326c2-c1a3-48af-89ee-2113cd3c0399',
        brevoClientKey: 'roxikmpb0134fjx0zxc6vti5',
      };
    } catch (error) {
      console.error('Error loading tracking configuration:', error);
      return {
        enableHeatmaps: true,
        enableSessionRecording: false,
        enableLeadTracking: true,
        enableCMP: true,
        enableBrevoTracking: true,
        googleAnalyticsId: 'G-Z97ZB4YKPF',
        googleTagManagerId: 'GTM-N35CP3R9',
        facebookPixelId: '381068095046019',
        cookiebotId: 'c5f326c2-c1a3-48af-89ee-2113cd3c0399',
        brevoClientKey: 'roxikmpb0134fjx0zxc6vti5',
      };
    }
  }
  
  // Validate configuration
  // Helper method to check if tracking should be enabled based on domain
  static shouldEnableTracking(): boolean {
    const domain = window.location.hostname;
    const isProduction = domain === 'capittal.es' || domain.endsWith('.capittal.es');
    const isLocal = domain === 'localhost' || domain === '127.0.0.1';
    const isStaging = domain.endsWith('.lovable.app') || domain.endsWith('.lovable.dev');
    
    return isProduction || isLocal || isStaging;
  }

  static validateConfiguration(config: TrackingConfiguration): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate Google Analytics ID format
    if (config.googleAnalyticsId && !/^G-[A-Z0-9]{10}$/.test(config.googleAnalyticsId)) {
      errors.push('Google Analytics ID debe tener el formato G-XXXXXXXXXX');
    }

    // Validate Google Tag Manager ID format
    if (config.googleTagManagerId && !/^GTM-[A-Z0-9]+$/.test(config.googleTagManagerId)) {
      errors.push('Google Tag Manager ID debe tener el formato GTM-XXXXXXXX');
    }
    
    // Validate Facebook Pixel ID format
    if (config.facebookPixelId && !/^\d{15,16}$/.test(config.facebookPixelId)) {
      errors.push('Facebook Pixel ID debe ser un número de 15-16 dígitos');
    }
    
    // Validate LinkedIn Insight Tag format
    if (config.linkedInInsightTag && !/^\d+$/.test(config.linkedInInsightTag)) {
      errors.push('LinkedIn Insight Tag debe ser un número');
    }
    
    // Validate Hotjar ID format
    if (config.hotjarId && !/^\d+$/.test(config.hotjarId)) {
      errors.push('Hotjar Site ID debe ser un número');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}