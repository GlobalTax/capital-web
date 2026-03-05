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

const BUCKET = 'campaign-presentations';

async function verifyAdmin(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    throw { status: 500, message: 'Server configuration error' };
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw { status: 401, message: 'Unauthorized' };
  }

  const token = authHeader.replace('Bearer ', '');
  const anonClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
  if (userError || !user) {
    throw { status: 401, message: 'Invalid token' };
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: adminRow } = await serviceClient
    .from('admin_users')
    .select('role, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!adminRow) {
    throw { status: 403, message: 'Forbidden: not an admin user' };
  }

  return { serviceClient, userId: user.id };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get('content-type') || '';

    // Detect action: FormData = upload, JSON = sign/delete
    if (contentType.includes('multipart/form-data') || contentType.includes('form-data')) {
      // ── UPLOAD ──
      const { serviceClient } = await verifyAdmin(req);
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const storagePath = formData.get('path') as string | null;

      if (!file || !storagePath) {
        return jsonResponse({ error: 'Missing file or path' }, 400);
      }

      console.log('[upload] path:', storagePath, 'size:', file.size);

      const { data, error: uploadError } = await serviceClient.storage
        .from(BUCKET)
        .upload(storagePath, file, { upsert: true, contentType: file.type || 'application/pdf' });

      if (uploadError) {
        console.error('[upload] error:', uploadError.message);
        return jsonResponse({ error: uploadError.message }, 500);
      }

      return jsonResponse({ path: data.path });
    }

    // ── JSON actions: sign / delete ──
    let body: { action?: string; path?: string };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const { action, path } = body;
    if (!action || !path) {
      return jsonResponse({ error: 'Missing action or path' }, 400);
    }

    const { serviceClient } = await verifyAdmin(req);

    if (action === 'sign') {
      const { data, error } = await serviceClient.storage
        .from(BUCKET)
        .createSignedUrl(path, 3600);

      if (error) {
        console.error('[sign] error:', error.message);
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({ signedUrl: data.signedUrl });
    }

    if (action === 'delete') {
      const { error } = await serviceClient.storage
        .from(BUCKET)
        .remove([path]);

      if (error) {
        console.error('[delete] error:', error.message);
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({ message: 'Deleted' });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);
  } catch (err: any) {
    if (err?.status && err?.message) {
      return jsonResponse({ error: err.message }, err.status);
    }
    console.error('[upload-campaign-presentation] Unexpected:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
