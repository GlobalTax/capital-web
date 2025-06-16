
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

    // Intentar insertar directamente sin verificaciones previas
    console.log('Insertando usuario como admin...');
    const { data: insertData, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        user_id: user.id,
        role: 'super_admin',
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      // Si ya existe, intentar actualizar
      if (insertError.code === '23505') { // unique violation
        console.log('Usuario ya existe, actualizando...');
        const { data: updateData, error: updateError } = await supabase
          .from('admin_users')
          .update({
            role: 'super_admin',
            is_active: true
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error actualizando admin:', updateError);
          return false;
        }

        console.log('Usuario actualizado como admin exitosamente:', updateData);
        return true;
      } else {
        console.error('Error insertando admin:', insertError);
        return false;
      }
    }

    console.log('Usuario insertado como admin exitosamente:', insertData);
    return true;

  } catch (error) {
    console.error('Error en ensureCurrentUserIsAdmin:', error);
    return false;
  }
};

// Función de debug simplificada
export const debugAdminStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('Debug: No hay usuario autenticado');
      return;
    }

    console.log('Debug: Usuario ID:', user.id);
    console.log('Debug: Email:', user.email);

    // Consulta directa a la tabla usando select sin filtros complejos
    const { data: adminUsers, error } = await supabase
      .from('admin_users')
      .select('*');

    console.log('Debug: Todos los registros admin:', adminUsers);
    if (error) {
      console.log('Debug: Error consultando admin_users:', error);
    }

    // Buscar el usuario actual en los resultados
    const currentUserAdmin = adminUsers?.find(admin => admin.user_id === user.id);
    console.log('Debug: Registro del usuario actual:', currentUserAdmin);

  } catch (error) {
    console.error('Debug: Error general:', error);
  }
};
