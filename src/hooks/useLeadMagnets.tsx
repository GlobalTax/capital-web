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
      // Get UTM and referrer data
      const urlParams = new URLSearchParams(window.location.search);
      const referrer = document.referrer || null;

      // Get IP address
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json() : null;

      // Step 1: Insert into lead_magnet_downloads (using form_submissions as main table)
      console.log('=== STEP 1: INSERTING INTO form_submissions (lead_magnet_download) ===');
      const submissionPayload = {
        form_type: 'lead_magnet_download',
        email: formData.user_email.trim(),
        full_name: formData.user_name?.trim() || formData.user_email.trim(),
        form_data: {
          lead_magnet_id: id,
          user_company: formData.user_company?.trim() || null,
          user_phone: formData.user_phone?.trim() || null,
        },
        ip_address: ipData?.ip,
        user_agent: navigator.userAgent,
        referrer,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
      };

      console.log('Payload for form_submissions insert:', submissionPayload);

      const { supabase } = await import('@/integrations/supabase/client');
      const { data: submissionData, error: submissionError } = await supabase
        .from('form_submissions')
        .insert(submissionPayload)
        .select()
        .single();

      if (submissionError) {
        console.error('Error inserting into form_submissions:', {
          code: submissionError.code,
          message: submissionError.message,
          details: submissionError.details,
          hint: submissionError.hint
        });
        throw submissionError;
      }

      console.log('Successfully inserted into form_submissions:', submissionData);

      // Step 2: Invoke send-form-notifications function
      console.log('=== STEP 2: INVOKING send-form-notifications FUNCTION ===');
      try {
        const functionPayload = {
          submissionId: submissionData.id,
          formType: 'lead_magnet_download',
          email: formData.user_email.trim(),
          fullName: formData.user_name?.trim() || formData.user_email.trim(),
          formData: {
            lead_magnet_id: id,
            user_company: formData.user_company?.trim() || null,
            user_phone: formData.user_phone?.trim() || null,
          }
        };

        console.log('Function payload:', functionPayload);

        const { data: functionData, error: functionError } = await supabase.functions.invoke(
          'send-form-notifications',
          { body: functionPayload }
        );

        if (functionError) {
          console.error('Error invoking send-form-notifications function:', {
            code: functionError.code,
            message: functionError.message,
            details: functionError.details
          });
          // Non-blocking error - download succeeded but notification failed
        } else {
          console.log('Successfully invoked send-form-notifications function:', functionData);
        }
      } catch (functionErr) {
        console.error('Exception invoking send-form-notifications function:', functionErr);
        // Non-blocking error
      }

      console.log(`[${new Date().toISOString()}] === LEAD MAGNET DOWNLOAD SUCCESS ===`);
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