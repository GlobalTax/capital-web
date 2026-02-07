import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DealsuiteEmpresa {
  id: string;
  nombre: string;
  ubicacion: string | null;
  descripcion: string | null;
  tipo_empresa: string | null;
  parte_de: string | null;
  experiencia_ma: string[];
  experiencia_sector: string[];
  tamano_proyectos_min: number | null;
  tamano_proyectos_max: number | null;
  enfoque_consultivo: string | null;
  sitio_web: string | null;
  imagen_url: string | null;
  email: string | null;
  telefono: string | null;
  notas: string | null;
  deal_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface DealsuiteContacto {
  id: string;
  nombre: string | null;
  empresa: string | null;
  email: string | null;
  telefono: string | null;
  cargo: string | null;
  imagen_url: string | null;
  empresa_id: string | null;
  deal_ids: string[];
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export const useDealsuiteEmpresas = () => {
  return useQuery({
    queryKey: ['dealsuite-empresas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dealsuite_empresas' as any)
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as DealsuiteEmpresa[];
    },
  });
};

export const useDealsuiteContactos = (empresaId?: string) => {
  return useQuery({
    queryKey: ['dealsuite-contactos', empresaId],
    queryFn: async () => {
      let query = supabase
        .from('dealsuite_contacts' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as DealsuiteContacto[];
    },
  });
};

// --- Mutations ---

export const useCreateEmpresa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (empresa: Partial<DealsuiteEmpresa>) => {
      const { data, error } = await supabase
        .from('dealsuite_empresas' as any)
        .insert({
          nombre: empresa.nombre || 'Sin nombre',
          ubicacion: empresa.ubicacion || null,
          descripcion: empresa.descripcion || null,
          tipo_empresa: empresa.tipo_empresa || null,
          parte_de: empresa.parte_de || null,
          experiencia_ma: empresa.experiencia_ma || [],
          experiencia_sector: empresa.experiencia_sector || [],
          tamano_proyectos_min: empresa.tamano_proyectos_min || null,
          tamano_proyectos_max: empresa.tamano_proyectos_max || null,
          enfoque_consultivo: empresa.enfoque_consultivo || null,
          sitio_web: empresa.sitio_web || null,
          imagen_url: empresa.imagen_url || null,
          notas: empresa.notas || null,
          deal_ids: empresa.deal_ids || [],
        } as any)
        .select('*')
        .single();

      if (error) throw error;
      return data as unknown as DealsuiteEmpresa;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealsuite-empresas'] });
      toast({ title: 'Empresa creada' });
    },
    onError: (err: any) => {
      toast({ title: 'Error al crear empresa', description: err.message, variant: 'destructive' });
    },
  });
};

export const useUpdateEmpresa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...fields }: Partial<DealsuiteEmpresa> & { id: string }) => {
      const { error } = await supabase
        .from('dealsuite_empresas' as any)
        .update({ ...fields, updated_at: new Date().toISOString() } as any)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealsuite-empresas'] });
      toast({ title: 'Empresa actualizada' });
    },
    onError: (err: any) => {
      toast({ title: 'Error al actualizar', description: err.message, variant: 'destructive' });
    },
  });
};

export const useCreateContacto = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (contacto: Partial<DealsuiteContacto> & { empresa_id: string }) => {
      const { data, error } = await supabase
        .from('dealsuite_contacts' as any)
        .insert({
          nombre: contacto.nombre || 'Sin nombre',
          cargo: contacto.cargo || null,
          email: contacto.email || null,
          telefono: contacto.telefono || null,
          notas: contacto.notas || null,
          empresa_id: contacto.empresa_id,
          empresa: contacto.empresa || null,
          deal_ids: contacto.deal_ids || [],
        } as any)
        .select('*')
        .single();

      if (error) throw error;
      return data as unknown as DealsuiteContacto;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dealsuite-contactos', variables.empresa_id] });
      toast({ title: 'Contacto creado' });
    },
    onError: (err: any) => {
      toast({ title: 'Error al crear contacto', description: err.message, variant: 'destructive' });
    },
  });
};

export const useUpdateContacto = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, empresa_id, ...fields }: Partial<DealsuiteContacto> & { id: string; empresa_id?: string | null }) => {
      const { error } = await supabase
        .from('dealsuite_contacts' as any)
        .update({ ...fields, updated_at: new Date().toISOString() } as any)
        .eq('id', id);

      if (error) throw error;
      return empresa_id;
    },
    onSuccess: (empresaId) => {
      queryClient.invalidateQueries({ queryKey: ['dealsuite-contactos', empresaId || undefined] });
      toast({ title: 'Contacto actualizado' });
    },
    onError: (err: any) => {
      toast({ title: 'Error al actualizar contacto', description: err.message, variant: 'destructive' });
    },
  });
};

export const useDeleteContacto = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, empresa_id }: { id: string; empresa_id?: string | null }) => {
      const { error } = await supabase
        .from('dealsuite_contacts' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return empresa_id;
    },
    onSuccess: (empresaId) => {
      queryClient.invalidateQueries({ queryKey: ['dealsuite-contactos', empresaId || undefined] });
      toast({ title: 'Contacto eliminado' });
    },
    onError: (err: any) => {
      toast({ title: 'Error al eliminar contacto', description: err.message, variant: 'destructive' });
    },
  });
};
