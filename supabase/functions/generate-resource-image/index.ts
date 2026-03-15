import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { lead_magnet_id } = await req.json();
    if (!lead_magnet_id) {
      throw new Error('lead_magnet_id is required');
    }

    // Fetch lead magnet data
    const { data: magnet, error: fetchError } = await supabase
      .from('lead_magnets')
      .select('id, title, type, sector')
      .eq('id', lead_magnet_id)
      .single();

    if (fetchError || !magnet) {
      throw new Error(`Lead magnet not found: ${fetchError?.message}`);
    }

    console.log(`Generating image for: ${magnet.title}`);

    const typeLabels: Record<string, string> = {
      report: 'professional business report cover',
      whitepaper: 'corporate whitepaper cover',
      checklist: 'clean checklist document cover',
      template: 'professional template document cover',
    };

    const typeLabel = typeLabels[magnet.type] || 'professional document cover';
    const prompt = `Create a ${typeLabel} about "${magnet.title}" in the ${magnet.sector} sector. Style: modern, corporate, sophisticated M&A advisory aesthetic. Use deep navy blue, gold accents, and clean geometric shapes. Abstract financial/business imagery. NO text, NO letters, NO words, NO numbers on the image. Clean composition suitable as a thumbnail card image. Photorealistic quality.`;

    // Call Gemini image generation
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add funds.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageDataUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageDataUrl) {
      console.error('No image in response:', JSON.stringify(data).substring(0, 500));
      throw new Error('No image was generated');
    }

    // Extract base64 data and convert to Uint8Array
    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
    
    // Decode base64 in chunks to avoid stack overflow
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    const chunkSize = 32768;
    for (let i = 0; i < binaryString.length; i += chunkSize) {
      const end = Math.min(i + chunkSize, binaryString.length);
      for (let j = i; j < end; j++) {
        bytes[j] = binaryString.charCodeAt(j);
      }
    }

    // Upload to Supabase Storage
    const fileName = `covers/${lead_magnet_id}-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from('lead-magnets')
      .upload(fileName, bytes, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('lead-magnets')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Update lead magnet with image URL
    const { error: updateError } = await supabase
      .from('lead_magnets')
      .update({ featured_image_url: publicUrl })
      .eq('id', lead_magnet_id);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error(`Failed to update lead magnet: ${updateError.message}`);
    }

    console.log(`Image generated and saved: ${publicUrl}`);

    return new Response(JSON.stringify({
      success: true,
      imageUrl: publicUrl,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating resource image:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
