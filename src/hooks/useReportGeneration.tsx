
// Hook simplificado para mantener compatibilidad
export const useReportGeneration = () => {
  return {
    reportConfigs: [],
    generatedReports: [],
    isLoading: false,
    isGenerating: false,
    generateReport: (config: any) => {
      console.log('Report generation disabled after cleanup:', config);
    },
    createConfig: (config: any) => {
      console.log('Report config creation disabled after cleanup:', config);
    },
    updateConfig: (config: any) => {
      console.log('Report config update disabled after cleanup:', config);
    },
    deleteConfig: (id: string) => {
      console.log('Report config deletion disabled after cleanup:', id);
    },
    isCreatingConfig: false,
    isUpdatingConfig: false,
    isDeletingConfig: false
  };
};
