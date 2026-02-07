import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
