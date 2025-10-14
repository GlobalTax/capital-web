// ============= ADMIN CREATE USER EDGE FUNCTION =============
// Secure Edge Function to create users bypassing standard email validation
// Only accessible by super_admin users

import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Create user client to verify caller identity
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { authorization: authHeader }
        }
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify user is super_admin using existing RPC
    const { data: userRole, error: roleError } = await userClient.rpc(
      'check_user_admin_role',
      { check_user_id: user.id }
    );

    if (roleError || userRole !== 'super_admin') {
      console.error('Role check failed:', roleError, 'Role:', userRole);
      
      // Log security event
      const adminClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await adminClient.from('security_events').insert({
        event_type: 'UNAUTHORIZED_USER_CREATION_ATTEMPT',
        severity: 'high',
        user_id: user.id,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        details: {
          attempted_by: user.email,
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

    // Parse request body
    const { email, fullName, role }: CreateUserRequest = await req.json();

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
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
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

    // Create admin client with service role
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create user using admin API (bypasses email validation)
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        created_by_admin: true,
        created_by: user.email
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
      // Log this critical issue
      await adminClient.from('security_events').insert({
        event_type: 'USER_CREATION_PARTIAL_FAILURE',
        severity: 'critical',
        user_id: user.id,
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
      user_id: user.id,
      details: {
        created_user_id: newUser.user.id,
        created_user_email: email,
        created_user_role: role,
        created_by: user.email,
        timestamp: new Date().toISOString()
      }
    });

    console.log('User creation completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        user_id: newUser.user.id,
        email,
        temporary_password: tempPassword,
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
