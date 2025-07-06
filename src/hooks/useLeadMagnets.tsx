// Hook simplificado para mantener compatibilidad con componentes existentes
export const useLeadMagnets = () => {
  return {
    leadMagnets: [],
    isLoading: false,
    error: null,
    createLeadMagnet: {
      mutateAsync: async (data: any) => {
        console.log('Lead magnets disabled after cleanup:', data);
        return Promise.resolve();
      }
    }
  };
};

export const useLeadMagnetDownloads = () => {
  const recordDownload = async (id: string, formData: any) => {
    console.log('Lead magnet downloads disabled after cleanup:', { id, formData });
    return Promise.resolve();
  };

  return {
    recordDownload
  };
};