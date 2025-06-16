
import { supabase } from '@/integrations/supabase/client';

export const ensureCurrentUserIsAdmin = async () => {
  try {
    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No hay usuario autenticado');
      return false;
    }

    console.log('Usuario actual:', user.id, user.email);

    // Verificar si el usuario ya es admin
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error verificando admin:', checkError);
      return false;
    }

    if (existingAdmin) {
      console.log('Usuario ya es admin:', existingAdmin);
      return true;
    }

    // Si no es admin, intentar agregarlo
    console.log('Agregando usuario como admin...');
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        user_id: user.id,
        role: 'admin',
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
