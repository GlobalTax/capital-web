import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 0. Validate required env vars
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error('[upload-campaign-presentation] Missing env vars:', {
        hasUrl: !!supabaseUrl,
        hasAnon: !!anonKey,
        hasService: !!serviceRoleKey,
      });
      return jsonResponse({ error: 'Server configuration error' }, 500);
    }

    // 1. Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.warn('[upload-campaign-presentation] No valid Authorization header');
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
    if (userError || !user) {
      console.warn('[upload-campaign-presentation] Invalid token:', userError?.message);
      return jsonResponse({ error: 'Invalid token' }, 401);
    }

    const userId = user.id;
    console.log('[upload-campaign-presentation] Authenticated user:', userId);

    // 2. Verify admin role
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: adminRow } = await serviceClient
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (!adminRow) {
      console.warn('[upload-campaign-presentation] Not admin:', userId);
      return jsonResponse({ error: 'Forbidden: not an admin user' }, 403);
    }

    // 3. Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const storagePath = formData.get('path') as string | null;

    if (!file || !storagePath) {
      console.warn('[upload-campaign-presentation] Missing file or path');
      return jsonResponse({ error: 'Missing file or path' }, 400);
    }

    console.log('[upload-campaign-presentation] Uploading:', storagePath, 'size:', file.size);

    // 4. Upload using service_role (bypasses RLS)
    const { data, error: uploadError } = await serviceClient.storage
      .from('campaign-presentations')
      .upload(storagePath, file, {
        upsert: true,
        contentType: file.type || 'application/pdf',
      });

    if (uploadError) {
      console.error('[upload-campaign-presentation] Storage error:', uploadError.message);
      return jsonResponse({ error: uploadError.message }, 500);
    }

    console.log('[upload-campaign-presentation] OK:', data.path);
    return jsonResponse({ path: data.path });
  } catch (err) {
    console.error('[upload-campaign-presentation] Unexpected error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
