import { useState, useEffect } from 'react';
import { TrackingConfiguration, TrackingConfigService } from '@/services/TrackingConfigService';
import { initAnalytics, getAnalytics } from '@/utils/analytics/AnalyticsManager';
import { useToast } from '@/hooks/use-toast';

export const useTrackingConfig = () => {
  const [config, setConfig] = useState<TrackingConfiguration>({
    enableHeatmaps: true,
    enableSessionRecording: false,
    enableLeadTracking: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      const loadedConfig = await TrackingConfigService.loadConfiguration();
      setConfig(loadedConfig);
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la configuración de tracking',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async (newConfig: TrackingConfiguration) => {
    setIsSaving(true);
    try {
      // Validate configuration
      const validation = TrackingConfigService.validateConfiguration(newConfig);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Save configuration
      await TrackingConfigService.saveConfiguration(newConfig);
      setConfig(newConfig);

      // Reinitialize analytics with new configuration
      if (newConfig.googleAnalyticsId || newConfig.facebookPixelId) {
        initAnalytics({
          ga4MeasurementId: newConfig.googleAnalyticsId,
          facebookPixelId: newConfig.facebookPixelId,
          enableCompanyTracking: newConfig.enableLeadTracking,
          enableEnrichment: true,
          enableAlerting: true,
          enableAttribution: true,
        });
      }

      toast({
        title: 'Configuración guardada',
        description: 'Los ajustes de tracking se han actualizado correctamente',
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar la configuración',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (key: keyof TrackingConfiguration, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return {
    config,
    isLoading,
    isSaving,
    updateConfig,
    saveConfiguration,
    loadConfiguration,
  };
};