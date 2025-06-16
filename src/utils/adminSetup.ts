
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

    // Primero intentar insertar directamente (más confiable que verificar primero)
    console.log('Intentando configurar usuario como admin...');
    const { data: insertData, error: insertError } = await supabase
      .from('admin_users')
      .upsert({
        user_id: user.id,
        role: 'super_admin',
        is_active: true
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error insertando/actualizando admin:', insertError);
      return false;
    }

    console.log('Usuario configurado como admin:', insertData);

    // Verificar que la configuración fue exitosa usando RPC
    const { data: isAdmin, error: checkError } = await supabase
      .rpc('check_is_admin', { check_user_id: user.id });

    if (checkError) {
      console.error('Error verificando admin después de insertar:', checkError);
      // Si RPC falla, hacer verificación directa
      const { data: directCheck, error: directError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (directError) {
        console.error('Error en verificación directa:', directError);
        return false;
      }

      console.log('Verificación directa exitosa:', directCheck);
      return true;
    }

    console.log('Verificación RPC resultado:', isAdmin);
    return isAdmin === true;

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

    // Consulta directa a la tabla
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

    // Verificar tabla completa (para debug)
    const { data: allAdmins, error: allError } = await supabase
      .from('admin_users')
      .select('*');

    console.log('Debug: Todos los registros admin:', allAdmins);
    if (allError) {
      console.log('Debug: Error consultando todos los admins:', allError);
    }

  } catch (error) {
    console.error('Debug: Error general:', error);
  }
};
