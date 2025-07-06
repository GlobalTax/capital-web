// Hook simplificado para mantener compatibilidad
export const useHubSpotIntegration = () => {
  const createCompanyValuation = async (data: any) => {
    console.log('HubSpot integration disabled after cleanup:', data);
    // No-op - integration was removed
  };

  const createToolRating = async (data: any) => {
    console.log('HubSpot tool rating disabled after cleanup:', data);
    // No-op - integration was removed
  };

  return {
    createCompanyValuation,
    createToolRating,
  };
};