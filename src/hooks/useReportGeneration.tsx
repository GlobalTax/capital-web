
import { logger } from '@/utils/logger';

export const useReportGeneration = () => {
  return {
    reportConfigs: [],
    generatedReports: [],
    isLoading: false,
    isGenerating: false,
    generateReport: (config: any) => {
      logger.info('Report generation disabled after cleanup', config, { context: 'system', component: 'useReportGeneration' });
    },
    createConfig: (config: any) => {
      logger.info('Report config creation disabled after cleanup', config, { context: 'system', component: 'useReportGeneration' });
    },
    updateConfig: (config: any) => {
      logger.info('Report config update disabled after cleanup', config, { context: 'system', component: 'useReportGeneration' });
    },
    deleteConfig: (id: string) => {
      logger.info('Report config deletion disabled after cleanup', { id }, { context: 'system', component: 'useReportGeneration' });
    },
    isCreatingConfig: false,
    isUpdatingConfig: false,
    isDeletingConfig: false
  };
};
