/**
 * Hook for managing contactos linked to an empresa via empresa_principal_id
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Contacto {
  id: string;
  nombre: string;
  apellidos: string | null;
  email: string;
  telefono: string | null;
  cargo: string | null;
  empresa_principal_id: string | null;
  linkedin: string | null;
  notas: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type ContactoInput = {
  nombre: string;
  apellidos?: string;
  email: string;
  telefono?: string;
  cargo?: string;
  linkedin?: string;
  notas?: string;
};

const QUERY_KEY = 'empresa-contactos';

export const useEmpresaContactos = (empresaId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const contactosQuery = useQuery({
    queryKey: [QUERY_KEY, empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from('contactos')
        .select('*')
        .eq('empresa_principal_id', empresaId)
        .order('nombre');

      if (error) throw error;
      return data as Contacto[];
    },
    enabled: !!empresaId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY, empresaId] });
  };

  // Create new contacto and link to empresa
  const createAndLink = useMutation({
    mutationFn: async (input: ContactoInput) => {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('contactos')
        .select('id, nombre, empresa_principal_id')
        .eq('email', input.email)
        .maybeSingle();

      if (existing) {
        // If already linked to this empresa, do nothing
        if (existing.empresa_principal_id === empresaId) {
          return { action: 'already_linked' as const, contacto: existing };
        }
        // If exists but not linked, link it
        const { data, error } = await supabase
          .from('contactos')
          .update({ empresa_principal_id: empresaId })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return { action: 'linked_existing' as const, contacto: data };
      }

      // Create new
      const { data, error } = await supabase
        .from('contactos')
        .insert({
          ...input,
          empresa_principal_id: empresaId,
        })
        .select()
        .single();
      if (error) throw error;
      return { action: 'created' as const, contacto: data };
    },
    onSuccess: (result) => {
      invalidate();
      if (result.action === 'already_linked') {
        toast({ title: 'Este contacto ya está vinculado a esta empresa' });
      } else if (result.action === 'linked_existing') {
        toast({ title: '✅ Contacto existente vinculado' });
      } else {
        toast({ title: '✅ Contacto creado y vinculado' });
      }
    },
    onError: (error) => {
      console.error('Error creating contacto:', error);
      toast({ title: 'Error', description: 'No se pudo crear el contacto', variant: 'destructive' });
    },
  });

  // Link existing contacto to empresa
  const linkContacto = useMutation({
    mutationFn: async (contactoId: string) => {
      const { error } = await supabase
        .from('contactos')
        .update({ empresa_principal_id: empresaId })
        .eq('id', contactoId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: '✅ Contacto vinculado' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo vincular', variant: 'destructive' });
    },
  });

  // Unlink contacto (set empresa_principal_id to null)
  const unlinkContacto = useMutation({
    mutationFn: async (contactoId: string) => {
      const { error } = await supabase
        .from('contactos')
        .update({ empresa_principal_id: null })
        .eq('id', contactoId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: 'Contacto desvinculado' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo desvincular', variant: 'destructive' });
    },
  });

  // Update contacto fields
  const updateContacto = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Contacto> & { id: string }) => {
      const { data, error } = await supabase
        .from('contactos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: '✅ Contacto actualizado' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' });
    },
  });

  // Search contactos not linked to this empresa
  const searchContactos = async (query: string) => {
    if (query.length < 2) return [];
    const { data, error } = await supabase
      .from('contactos')
      .select('id, nombre, apellidos, email, telefono, cargo, empresa_principal_id')
      .or(`nombre.ilike.%${query}%,email.ilike.%${query}%,apellidos.ilike.%${query}%,telefono.ilike.%${query}%`)
      .neq('empresa_principal_id', empresaId || '')
      .limit(15);
    if (error) throw error;
    return data as Contacto[];
  };

  return {
    contactos: contactosQuery.data || [],
    isLoading: contactosQuery.isLoading,
    createAndLink,
    linkContacto,
    unlinkContacto,
    updateContacto,
    searchContactos,
    refetch: contactosQuery.refetch,
  };
};
