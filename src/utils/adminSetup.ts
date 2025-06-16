
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

    // Verificar si ya es admin usando la función RPC
    const { data: isAdmin, error: checkError } = await supabase
      .rpc('check_is_admin', { check_user_id: user.id });

    if (checkError) {
      console.error('Error verificando admin:', checkError);
      
      // Si la función RPC falla, intentar consulta directa
      console.log('Intentando consulta directa a admin_users...');
      const { data: adminRecord, error: directError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (directError && directError.code !== 'PGRST116') {
        console.error('Error en consulta directa:', directError);
        return false;
      }

      if (adminRecord) {
        console.log('Usuario ya es admin (consulta directa)');
        return true;
      }
    } else if (isAdmin) {
      console.log('Usuario ya es admin (RPC)');
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
      
      // Si el error es de conflicto, verificar si ya existe
      if (insertError.code === '23505') {
        console.log('El usuario ya existe como admin, actualizando...');
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({
            role: 'super_admin',
            is_active: true
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error actualizando admin:', updateError);
          return false;
        }
        
        console.log('Usuario actualizado como admin');
        return true;
      }
      return false;
    }

    console.log('Usuario creado como admin:', newAdmin);
    return true;
  } catch (error) {
    console.error('Error en ensureCurrentUserIsAdmin:', error);
    return false;
  }
};

// Función adicional para debug
export const debugAdminStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('Debug: No hay usuario autenticado');
      return;
    }

    console.log('Debug: Usuario ID:', user.id);
    console.log('Debug: Email:', user.email);

    // Intentar consulta directa
    const { data: adminUsers, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id);

    console.log('Debug: Registros admin encontrados:', adminUsers);
    if (error) {
      console.log('Debug: Error consultando admin_users:', error);
    }

    // Intentar RPC
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('check_is_admin', { check_user_id: user.id });

    console.log('Debug: Resultado RPC check_is_admin:', rpcResult);
    if (rpcError) {
      console.log('Debug: Error en RPC:', rpcError);
    }

  } catch (error) {
    console.error('Debug: Error general:', error);
  }
};
