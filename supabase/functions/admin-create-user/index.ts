// ============= ADMIN CREATE USER EDGE FUNCTION =============
// Secure Edge Function to create users bypassing standard email validation
// Only accessible by super_admin users

import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as djwt from "https://deno.land/x/djwt@v3.0.2/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  fullName: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============= RATE LIMITING =============
    // Limit: 5 user creations per hour per IP address
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Create admin client for rate limit check
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const { data: rateLimitOk, error: rateLimitError } = await supabaseAdmin
      .rpc('check_rate_limit_enhanced', {
        p_identifier: clientIp,
        p_category: 'admin_user_creation',
        p_max_requests: 5,
        p_window_minutes: 60
      });
    
    if (rateLimitError) {
      console.error('❌ Rate limit check failed:', rateLimitError);
      // Continue execution but log the error
    } else if (!rateLimitOk) {
      console.warn('⚠️ Rate limit exceeded for IP:', clientIp);
      
      // Log rate limit violation
      await supabaseAdmin.from('security_events').insert({
        event_type: 'RATE_LIMIT_EXCEEDED_USER_CREATION',
        severity: 'medium',
        ip_address: clientIp,
        details: {
          category: 'admin_user_creation',
          limit: 5,
          window: '60 minutes',
          timestamp: new Date().toISOString()
        }
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Demasiadas solicitudes. Por favor, intenta más tarde.',
          code: 'RATE_LIMIT_EXCEEDED'
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '3600' } 
        }
      );
    }
    
    console.log('✅ Rate limit check passed for IP:', clientIp);
    
    // ============= JWT VALIDATION =============
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract and VALIDATE JWT with signature verification
    const token = authHeader.replace(/^Bearer\s+/i, '');
    
    let userId: string;
    let userEmail: string | undefined;
    
    try {
      // Get JWT secret from environment
      const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET');
      if (!jwtSecret) {
        throw new Error('JWT secret not configured');
      }

      // Import cryptographic key for JWT verification
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(jwtSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      );

      // Verify JWT signature using djwt
      const payload = await djwt.verify(token, key) as any;
      
      // Validate required claims
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const expectedIssuer = supabaseUrl;
      const expectedAudience = 'authenticated';
      
      if (payload.iss !== expectedIssuer) {
        throw new Error(`Invalid issuer: ${payload.iss}`);
      }
      
      if (payload.aud !== expectedAudience) {
        throw new Error(`Invalid audience: ${payload.aud}`);
      }
      
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('Token expired');
      }
      
      userId = payload.sub;
      userEmail = payload.email;
      
      if (!userId) {
        throw new Error('No user ID in token');
      }
      
      console.log('✅ JWT validated with signature:', { userId, userEmail });
    } catch (decodeError) {
      console.error('❌ JWT validation failed:', decodeError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create admin client to verify role
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
      console.error('⚠️ SUPABASE_SERVICE_ROLE_KEY not configured!');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify user is super_admin using existing RPC
    const { data: userRole, error: roleError } = await adminClient.rpc(
      'check_user_admin_role',
      { check_user_id: userId }
    );

    if (roleError || userRole !== 'super_admin') {
      console.error('Role check failed:', roleError, 'Role:', userRole);
      
      // Log security event
      await adminClient.from('security_events').insert({
        event_type: 'UNAUTHORIZED_USER_CREATION_ATTEMPT',
        severity: 'high',
        user_id: userId,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        details: {
          attempted_by: userEmail,
          user_role: userRole,
          timestamp: new Date().toISOString()
        }
      });

      return new Response(
        JSON.stringify({ error: 'Forbidden: Only super admins can create users' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log request details for debugging
    const contentType = req.headers.get('content-type') ?? 'unknown';
    const contentLength = req.headers.get('content-length') ?? 'unknown';
    console.log('📥 Content-Type:', contentType, 'Content-Length:', contentLength);

// Parse and validate request body using raw text for robustness
let payload: any;
try {
  const raw = await req.text();
  console.log('🧪 Raw body length:', raw ? raw.length : 0, 'preview:', raw ? raw.slice(0, 200) : '');

  if (!raw || raw.trim() === '') {
    console.error('❌ Empty request body');
    return new Response(
      JSON.stringify({ error: 'Empty request body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  payload = JSON.parse(raw);
} catch (parseError) {
  console.error('❌ Failed to parse JSON body:', parseError);
  return new Response(
    JSON.stringify({ error: 'Invalid JSON body' }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

    // Normalize and validate fields
    const email = (payload.email ?? '').toString().trim().toLowerCase();
    const fullName = (payload.fullName ?? '').toString().trim();
    const role = (payload.role ?? '').toString();

    console.log('📋 Creating user - sanitized payload:', { email, role, requestedBy: userEmail });

    // Validate required fields
    if (!email) {
      console.error('❌ Missing required field: email');
      return new Response(
        JSON.stringify({ error: 'Missing required field', field: 'email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!fullName) {
      console.error('❌ Missing required field: fullName');
      return new Response(
        JSON.stringify({ error: 'Missing required field', field: 'fullName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!role) {
      console.error('❌ Missing required field: role');
      return new Response(
        JSON.stringify({ error: 'Missing required field', field: 'role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate role
    const allowedRoles = ['super_admin', 'admin', 'editor'] as const;
    if (!allowedRoles.includes(role as any)) {
      console.error('❌ Invalid role:', role);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid role', 
          provided: role,
          allowed: allowedRoles 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    if (!email || !fullName || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, fullName, role' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format:', email);
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate secure temporary password (20 characters)
    const tempPasswordBytes = new Uint8Array(15);
    crypto.getRandomValues(tempPasswordBytes);
    let tempPassword = btoa(String.fromCharCode(...tempPasswordBytes))
      .replace(/\//g, 'A')
      .replace(/\+/g, 'B')
      .replace(/=/g, 'C')
      .substring(0, 18) + '1!'; // Ensure complexity requirements

    console.log('Creating user with admin privileges:', { email, role });

    // Create user using admin API (bypasses email validation)
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        created_by_admin: true,
        created_by: userEmail
      }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create user',
          details: createError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!newUser.user) {
      return new Response(
        JSON.stringify({ error: 'User creation failed: no user returned' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User created successfully:', newUser.user.id);

    // Upsert into admin_users table
    const { error: adminInsertError } = await adminClient
      .from('admin_users')
      .upsert({
        user_id: newUser.user.id,
        email,
        full_name: fullName,
        role,
        is_active: true
      }, {
        onConflict: 'user_id'
      });

    if (adminInsertError) {
      console.error('Error inserting into admin_users:', adminInsertError);
      
      // User was created in auth but failed to add to admin_users
      // Log this critical issue (Fixed: use userId instead of user.id)
      await adminClient.from('security_events').insert({
        event_type: 'USER_CREATION_PARTIAL_FAILURE',
        severity: 'critical',
        user_id: userId,
        details: {
          created_user_id: newUser.user.id,
          created_user_email: email,
          error: adminInsertError.message,
          note: 'User exists in auth.users but not in admin_users'
        }
      });

      return new Response(
        JSON.stringify({ 
          error: 'User created but failed to assign role',
          details: adminInsertError.message,
          user_id: newUser.user.id
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log successful user creation
    await adminClient.from('security_events').insert({
      event_type: 'USER_CREATED_BY_ADMIN',
      severity: 'high',
      user_id: userId,
      details: {
        created_user_id: newUser.user.id,
        created_user_email: email,
        created_user_role: role,
        created_by: userEmail,
        timestamp: new Date().toISOString()
      }
    });

    console.log('User creation completed successfully');

    // Send credentials via secure email (NEVER expose password in HTTP response)
    try {
      const { data: emailData, error: emailError } = await adminClient.functions.invoke(
        'send-user-credentials',
        {
          body: {
            email,
            fullName,
            temporaryPassword: tempPassword,
            role,
            requiresPasswordChange: true
          }
        }
      );

      if (emailError) {
        console.error('⚠️ Failed to send credentials email:', emailError);
        // Log but don't fail - user was created successfully
        await adminClient.from('security_events').insert({
          event_type: 'CREDENTIALS_EMAIL_FAILED',
          severity: 'high',
          user_id: newUser.user.id,
          details: {
            email,
            error: emailError.message,
            note: 'User created but credentials email failed to send'
          }
        });
      } else {
        console.log('✅ Credentials email sent successfully');
      }
    } catch (emailError) {
      console.error('⚠️ Error invoking send-user-credentials:', emailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        user_id: newUser.user.id,
        email,
        message: 'User created successfully. Credentials sent via secure email.',
        requires_password_change: true
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in admin-create-user:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
