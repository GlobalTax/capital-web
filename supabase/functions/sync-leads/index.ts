
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LeadData {
  type: 'contact' | 'collaborator';
  data: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: LeadData = await req.json();

    // Crear cliente para la segunda base de datos
    const secondarySupabase = createClient(
      Deno.env.get('SECONDARY_SUPABASE_URL') ?? '',
      Deno.env.get('SECONDARY_SUPABASE_ANON_KEY') ?? ''
    );

    let leadData: any = {};

    // Transformar datos según el tipo
    if (type === 'contact') {
      leadData = {
        lead_type: 'contact',
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        country: data.country,
        company_size: data.company_size,
        referral: data.referral,
        status: data.status || 'new',
        source: 'capittal_website',
        created_at: new Date().toISOString(),
        ip_address: data.ip_address,
        user_agent: data.user_agent,
      };
    } else if (type === 'collaborator') {
      leadData = {
        lead_type: 'collaborator',
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        profession: data.profession,
        experience: data.experience,
        motivation: data.motivation,
        status: data.status || 'pending',
        source: 'capittal_collaborators',
        created_at: new Date().toISOString(),
        ip_address: data.ip_address,
        user_agent: data.user_agent,
      };
    }

    // Insertar en la segunda base de datos
    const { data: insertedData, error } = await secondarySupabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error('Error insertando en segunda DB:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          leadData: leadData 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Lead sincronizado exitosamente:', insertedData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: insertedData 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error en sync-leads:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
