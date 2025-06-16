
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

    // Con las nuevas políticas RLS simplificadas, podemos hacer upsert directamente
    console.log('Configurando usuario como admin...');
    const { data: upsertData, error: upsertError } = await supabase
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

    if (upsertError) {
      console.error('Error insertando/actualizando admin:', upsertError);
      return false;
    }

    console.log('Usuario configurado como admin exitosamente:', upsertData);

    // Verificar que la configuración fue exitosa
    const { data: verificationData, error: verificationError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (verificationError) {
      console.error('Error verificando configuración de admin:', verificationError);
      return false;
    }

    console.log('Verificación exitosa:', verificationData);
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

    // Consulta directa a la tabla
    const { data: adminUsers, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id);

    console.log('Debug: Registros admin encontrados:', adminUsers);
    if (error) {
      console.log('Debug: Error consultando admin_users:', error);
    }

  } catch (error) {
    console.error('Debug: Error general:', error);
  }
};
