
import { supabase } from '@/integrations/supabase/client';

export const ensureCurrentUserIsAdmin = async () => {
  try {
    // Obtener el usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error obteniendo usuario:', userError);
      return false;
    }
    
    if (!user) {
      console.log('No hay usuario autenticado');
      return false;
    }

    console.log('Usuario actual:', user.id, user.email);

    // Usar la nueva función check_is_admin para verificar permisos
    const { data: isAdmin, error: checkError } = await supabase
      .rpc('check_is_admin', { check_user_id: user.id });

    if (checkError) {
      console.error('Error verificando admin:', checkError);
      return false;
    }

    if (isAdmin) {
      console.log('Usuario ya es admin');
      return true;
    }

    // Si no es admin, intentar agregarlo
    console.log('Agregando usuario como admin...');
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        user_id: user.id,
        role: 'super_admin',
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creando admin:', insertError);
      return false;
    }

    console.log('Usuario creado como admin:', newAdmin);
    return true;
  } catch (error) {
    console.error('Error en ensureCurrentUserIsAdmin:', error);
    return false;
  }
};
