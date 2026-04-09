/**
 * Shared Auth Guard for Edge Functions
 * Validates JWT token and verifies admin role in admin_users table.
 * 
 * Usage:
 *   const auth = await validateAdminRequest(req, corsHeaders);
 *   if (auth.error) return auth.error;
 *   const { userId, role, adminClient } = auth;
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

interface AuthSuccess {
  userId: string;
  userEmail: string;
  role: string;
  adminClient: ReturnType<typeof createClient>;
  error?: undefined;
}

interface AuthFailure {
  error: Response;
  userId?: undefined;
  userEmail?: undefined;
  role?: undefined;
  adminClient?: undefined;
}

type AuthResult = AuthSuccess | AuthFailure;

export async function validateAdminRequest(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<AuthResult> {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Unauthorized - Missing authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      ),
    };
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);

  if (claimsError || !claimsData?.claims) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      ),
    };
  }

  const userId = claimsData.claims.sub as string;
  const userEmail = (claimsData.claims.email as string) || '';

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: adminUser, error: adminError } = await adminClient
    .from('admin_users')
    .select('role')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (adminError || !adminUser) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      ),
    };
  }

  return {
    userId,
    userEmail,
    role: adminUser.role,
    adminClient,
  };
}
