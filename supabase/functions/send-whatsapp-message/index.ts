import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendWhatsAppRequest {
  phoneE164: string;
  template?: string;
  variables?: Record<string, string>;
  textFallback: string;
  pdfUrl?: string;
  valuationId?: string;
}

interface WhatsAppResponse {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

interface WhatsAppMessagePayload {
  messaging_product: string;
  to: string;
  type: string;
  template?: {
    name: string;
    language: { code: string };
    components: Array<{
      type: string;
      parameters: Array<{ type: string; text: string }>;
    }>;
  };
  text?: {
    body: string;
  };
}

const validateE164Phone = (phone: string): boolean => {
  return /^\+[1-9]\d{1,14}$/.test(phone);
};

// Initialize Supabase client for logging (service role)
const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials for logging');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Log message to database
const logMessage = async (
  valuationId: string | undefined,
  type: 'whatsapp',
  status: 'sent' | 'failed',
  providerId: string | undefined,
  payloadSummary: any,
  phoneE164: string,
  errorDetails?: string
) => {
  if (!valuationId) {
    console.log('No valuation_id provided, skipping message log');
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Cannot log message: Supabase client not available');
    return;
  }

  try {
    const { error } = await supabase.from('message_logs').insert({
      valuation_id: valuationId,
      type,
      status,
      provider_id: providerId,
      provider_name: 'whatsapp_cloud_api',
      recipient: phoneE164.slice(0, 4) + '***',
      payload_summary: payloadSummary,
      error_details: errorDetails,
      retry_count: 0
    });

    if (error) {
      console.error('Failed to log message:', error);
    } else {
      console.log('Message logged successfully:', { type, status, valuationId });
    }
  } catch (error) {
    console.error('Error logging message:', error);
  }
};

const createTemplateMessage = (
  phoneE164: string, 
  template: string, 
  variables: Record<string, string> = {}
): WhatsAppMessagePayload => {
  const parameters = Object.values(variables).map(value => ({
    type: 'text',
    text: value
  }));

  return {
    messaging_product: 'whatsapp',
    to: phoneE164,
    type: 'template',
    template: {
      name: template,
      language: { code: 'es' },
      components: [{
        type: 'body',
        parameters
      }]
    }
  };
};

const createTextMessage = (
  phoneE164: string, 
  textFallback: string, 
  pdfUrl?: string
): WhatsAppMessagePayload => {
  const messageBody = textFallback + (pdfUrl ? `\n\nDescarga tu valoración: ${pdfUrl}` : '');
  
  return {
    messaging_product: 'whatsapp',
    to: phoneE164,
    type: 'text',
    text: {
      body: messageBody
    }
  };
};

const sendWhatsAppMessage = async (payload: WhatsAppMessagePayload): Promise<WhatsAppResponse> => {
  const whatsappToken = Deno.env.get('WHATSAPP_TOKEN');
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

  if (!whatsappToken || !phoneNumberId) {
    return {
      success: false,
      error: 'WhatsApp API credentials not configured'
    };
  }

  const endpoint = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', {
        status: response.status,
        error: responseData.error || responseData
      });
      
      return {
        success: false,
        error: responseData.error?.message || 'WhatsApp API request failed'
      };
    }

    return {
      success: true,
      providerMessageId: responseData.messages?.[0]?.id
    };

  } catch (error) {
    console.error('WhatsApp API request failed:', error);
    return {
      success: false,
      error: 'Network error communicating with WhatsApp API'
    };
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneE164, template, variables, textFallback, pdfUrl, valuationId }: SendWhatsAppRequest = await req.json();

    // Validation
    if (!phoneE164 || !textFallback) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: phoneE164, textFallback' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!validateE164Phone(phoneE164)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid phone number format (E.164 required)' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Secure logging - don't log full PII
    const logPayload = {
      phone: phoneE164.slice(0, 4) + '***',
      type: template ? 'template' : 'text',
      template: template || null,
      hasVariables: variables ? Object.keys(variables).length > 0 : false,
      hasPdfUrl: !!pdfUrl,
      hasValuationId: !!valuationId
    };
    console.log('WhatsApp message request:', logPayload);

    let result: WhatsAppResponse;
    let payloadSummary: any;

    // Try template message first if template is provided
    if (template) {
      const templatePayload = createTemplateMessage(phoneE164, template, variables);
      payloadSummary = {
        message_type: 'template',
        template_name: template,
        has_variables: variables ? Object.keys(variables).length > 0 : false,
        variable_count: variables ? Object.keys(variables).length : 0,
        has_pdf_url: !!pdfUrl,
        language: 'es',
        fallback_used: false
      };
      
      result = await sendWhatsAppMessage(templatePayload);
      
      // If template fails, fallback to text message
      if (!result.success) {
        console.log('Template message failed, falling back to text:', result.error);
        const textPayload = createTextMessage(phoneE164, textFallback, pdfUrl);
        payloadSummary.fallback_used = true;
        payloadSummary.message_type = 'text';
        payloadSummary.message_length = textFallback.length + (pdfUrl ? pdfUrl.length + 30 : 0);
        result = await sendWhatsAppMessage(textPayload);
      }
    } else {
      // Send text message directly
      const textPayload = createTextMessage(phoneE164, textFallback, pdfUrl);
      payloadSummary = {
        message_type: 'text',
        template_name: null,
        has_variables: false,
        variable_count: 0,
        has_pdf_url: !!pdfUrl,
        message_length: textFallback.length + (pdfUrl ? pdfUrl.length + 30 : 0),
        language: 'es',
        fallback_used: false
      };
      result = await sendWhatsAppMessage(textPayload);
    }

    // Log the message result
    await logMessage(
      valuationId,
      'whatsapp',
      result.success ? 'sent' : 'failed',
      result.providerMessageId,
      payloadSummary,
      phoneE164,
      result.success ? undefined : result.error
    );

    const statusCode = result.success ? 200 : 500;
    
    console.log('WhatsApp message result:', {
      success: result.success,
      hasMessageId: !!result.providerMessageId,
      error: result.error || null
    });

    return new Response(
      JSON.stringify(result),
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-whatsapp-message function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});