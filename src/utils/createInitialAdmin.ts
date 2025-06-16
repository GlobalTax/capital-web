
import { supabase } from '@/integrations/supabase/client';

export const createInitialAdminUser = async (email: string, password: string) => {
  try {
    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`
      }
    });

    if (authError) throw authError;

    if (authData.user) {
      // Añadir rol de admin al usuario
      const { error: roleError } = await supabase
        .from('admin_users')
        .insert({
          user_id: authData.user.id,
          role: 'super_admin',
          is_active: true
        });

      if (roleError) throw roleError;

      return { success: true, user: authData.user };
    }

    throw new Error('No se pudo crear el usuario');
  } catch (error) {
    console.error('Error creating initial admin:', error);
    return { success: false, error };
  }
};
