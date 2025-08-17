import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { phoneE164, template, variables, textFallback, pdfUrl }: SendWhatsAppRequest = await req.json();

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
      hasPdfUrl: !!pdfUrl
    };
    console.log('WhatsApp message request:', logPayload);

    let result: WhatsAppResponse;

    // Try template message first if template is provided
    if (template) {
      const templatePayload = createTemplateMessage(phoneE164, template, variables);
      result = await sendWhatsAppMessage(templatePayload);
      
      // If template fails, fallback to text message
      if (!result.success) {
        console.log('Template message failed, falling back to text:', result.error);
        const textPayload = createTextMessage(phoneE164, textFallback, pdfUrl);
        result = await sendWhatsAppMessage(textPayload);
      }
    } else {
      // Send text message directly
      const textPayload = createTextMessage(phoneE164, textFallback, pdfUrl);
      result = await sendWhatsAppMessage(textPayload);
    }

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