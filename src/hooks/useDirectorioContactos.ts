/**
 * Hook for fetching contactos with server-side pagination and search
 * Used in the Directorio page for browsing all contacts
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DirectorioContacto {
  id: string;
  nombre: string;
  apellidos: string | null;
  email: string | null;
  telefono: string | null;
  cargo: string | null;
  empresa_principal_id: string | null;
  empresa_nombre: string | null;
  empresa_cif: string | null;
  empresa_facturacion: number | null;
  empresa_ebitda: number | null;
  linkedin: string | null;
  source: string | null;
  created_at: string | null;
}

interface UseDirectorioContactosParams {
  search?: string;
  page: number;
  pageSize: number;
}

export const useDirectorioContactos = (
  params: UseDirectorioContactosParams,
  enabled = true
) => {
  const { search, page, pageSize } = params;

  const contactosQuery = useQuery({
    queryKey: ['directorio-contactos', search, page, pageSize],
    queryFn: async () => {
      // Build query with empresa join
      let query = (supabase as any)
        .from('contactos')
        .select(`
          id, nombre, apellidos, email, telefono, cargo,
          empresa_principal_id, linkedin, source, created_at,
          empresas!contactos_empresa_principal_id_fkey ( nombre, cif, facturacion, ebitda )
        `, { count: 'exact' });

      // Search filter
      if (search && search.trim().length >= 2) {
        const s = `%${search.trim()}%`;
        query = query.or(
          `nombre.ilike.${s},apellidos.ilike.${s},email.ilike.${s},telefono.ilike.${s},cargo.ilike.${s}`
        );
      }

      // Pagination
      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Map empresa name from join
      const mapped: DirectorioContacto[] = (data || []).map((c: any) => ({
        id: c.id,
        nombre: c.nombre,
        apellidos: c.apellidos,
        email: c.email,
        telefono: c.telefono,
        cargo: c.cargo,
        empresa_principal_id: c.empresa_principal_id,
        empresa_nombre: c.empresas?.nombre || null,
        empresa_cif: c.empresas?.cif || null,
        empresa_facturacion: c.empresas?.facturacion || null,
        empresa_ebitda: c.empresas?.ebitda || null,
        linkedin: c.linkedin,
        source: c.source,
        created_at: c.created_at,
      }));

      return { contactos: mapped, total: count || 0 };
    },
    enabled,
  });

  return {
    contactos: contactosQuery.data?.contactos || [],
    totalCount: contactosQuery.data?.total || 0,
    isLoading: contactosQuery.isLoading,
    refetch: contactosQuery.refetch,
  };
};

// Also search empresas by contact name (cross-search)
export const useDirectorioSearch = (search: string, enabled = true) => {
  return useQuery({
    queryKey: ['directorio-cross-search', search],
    queryFn: async () => {
      if (!search || search.trim().length < 2) return { empresaIds: [] };
      
      const s = `%${search.trim()}%`;
      const { data } = await (supabase as any)
        .from('contactos')
        .select('empresa_principal_id')
        .not('empresa_principal_id', 'is', null)
        .or(`nombre.ilike.${s},apellidos.ilike.${s},email.ilike.${s}`)
        .limit(100);

      const ids = [...new Set((data || []).map((c: any) => c.empresa_principal_id).filter(Boolean))];
      return { empresaIds: ids as string[] };
    },
    enabled: enabled && !!search && search.trim().length >= 2,
  });
};
