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
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] === LEAD MAGNET DOWNLOAD START ===`);
    console.log('Lead magnet ID:', id);
    console.log('Form data:', formData);

    try {
      // Lead magnet downloads are simplified - no form_submissions table
      console.log('Lead magnet download recorded (tracking disabled)');
      return Promise.resolve();
    } catch (error) {
      console.error('Error in lead magnet download:', error);
      throw error;
    }
  };

  return {
    recordDownload
  };
};