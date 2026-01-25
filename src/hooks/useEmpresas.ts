import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Empresa {
  id: string;
  nombre: string;
  cif?: string | null;
  sector: string;
  subsector?: string | null;
  ubicacion?: string | null;
  facturacion?: number | null;
  empleados?: number | null;
  sitio_web?: string | null;
  descripcion?: string | null;
  revenue?: number | null;
  ebitda?: number | null;
  margen_ebitda?: number | null;
  deuda?: number | null;
  capital_circulante?: number | null;
  es_target?: boolean | null;
  estado_target?: string | null;
  nivel_interes?: string | null;
  potencial_search_fund?: boolean | null;
  source?: string | null;
  source_valuation_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  // Campos de valoración (desde company_valuations)
  valoracion?: number | null;
  fecha_valoracion?: string | null;
  // Campo calculado de última actividad
  ultima_actividad?: string | null;
}

export interface EmpresaFilters {
  search?: string;
  sector?: string;
  esTarget?: boolean | null;
  minFacturacion?: number;
  maxFacturacion?: number;
}

export const useEmpresas = (filters?: EmpresaFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all empresas with optional filters (includes valuation data and ultima_actividad via view)
  const { data: empresas, isLoading, refetch } = useQuery({
    queryKey: ['empresas', filters],
    queryFn: async () => {
      // Use view that calculates ultima_actividad
      let query = supabase
        .from('v_empresas_con_actividad' as any)
        .select(`
          *,
          company_valuations:source_valuation_id (
            final_valuation,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`nombre.ilike.%${filters.search}%,cif.ilike.%${filters.search}%`);
      }

      if (filters?.sector) {
        query = query.eq('sector', filters.sector);
      }

      if (filters?.esTarget !== null && filters?.esTarget !== undefined) {
        query = query.eq('es_target', filters.esTarget);
      }

      if (filters?.minFacturacion) {
        query = query.gte('facturacion', filters.minFacturacion);
      }

      if (filters?.maxFacturacion) {
        query = query.lte('facturacion', filters.maxFacturacion);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map valuation data to empresa fields
      return (data || []).map((empresa: any) => ({
        ...empresa,
        valoracion: empresa.company_valuations?.final_valuation ?? null,
        fecha_valoracion: empresa.company_valuations?.created_at ?? null,
        ultima_actividad: empresa.ultima_actividad ?? null,
        company_valuations: undefined, // Remove nested object
      })) as Empresa[];
    },
  });

  // Search empresas
  const searchEmpresas = async (searchQuery: string): Promise<Empresa[]> => {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .or(`nombre.ilike.%${searchQuery}%,cif.ilike.%${searchQuery}%`)
      .order('nombre')
      .limit(20);

    if (error) throw error;
    return data as Empresa[];
  };

  // Get empresa by ID
  const getEmpresaById = async (id: string): Promise<Empresa | null> => {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Empresa | null;
  };

  // Create empresa
  const createEmpresaMutation = useMutation({
    mutationFn: async (empresa: Omit<Empresa, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('empresas')
        .insert(empresa)
        .select()
        .single();

      if (error) throw error;
      return data as Empresa;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      toast({ title: '✅ Empresa creada correctamente' });
    },
    onError: (error) => {
      console.error('Error creating empresa:', error);
      toast({ 
        title: 'Error', 
        description: 'No se pudo crear la empresa', 
        variant: 'destructive' 
      });
    },
  });

  // Update empresa
  const updateEmpresaMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Empresa> & { id: string }) => {
      const { data, error } = await supabase
        .from('empresas')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Empresa;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      toast({ title: '✅ Empresa actualizada' });
    },
    onError: (error) => {
      console.error('Error updating empresa:', error);
      toast({ 
        title: 'Error', 
        description: 'No se pudo actualizar la empresa', 
        variant: 'destructive' 
      });
    },
  });

  // Delete empresa
  const deleteEmpresaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      toast({ title: 'Empresa eliminada' });
    },
    onError: (error) => {
      console.error('Error deleting empresa:', error);
      toast({ 
        title: 'Error', 
        description: 'No se pudo eliminar la empresa', 
        variant: 'destructive' 
      });
    },
  });

  // Link empresa to contact
  const linkToContact = async (empresaId: string, contactId: string, origin: string) => {
    const tableMap: Record<string, string> = {
      contact: 'contact_leads',
      valuation: 'company_valuations',
    };

    const table = tableMap[origin];
    if (!table) {
      throw new Error('Este tipo de lead no soporta vinculación de empresa');
    }

    const { error } = await supabase
      .from(table as any)
      .update({ empresa_id: empresaId })
      .eq('id', contactId);

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['lead-detail'] });
    queryClient.invalidateQueries({ queryKey: ['empresas'] });
    toast({ title: '✅ Empresa vinculada al contacto' });
  };

  // Unlink empresa from contact
  const unlinkFromContact = async (contactId: string, origin: string) => {
    const tableMap: Record<string, string> = {
      contact: 'contact_leads',
      valuation: 'company_valuations',
    };

    const table = tableMap[origin];
    if (!table) {
      throw new Error('Este tipo de lead no soporta vinculación de empresa');
    }

    const { error } = await supabase
      .from(table as any)
      .update({ empresa_id: null })
      .eq('id', contactId);

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['lead-detail'] });
    toast({ title: 'Empresa desvinculada' });
  };

  // Get unique sectors
  const { data: sectors } = useQuery({
    queryKey: ['empresas-sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('sector')
        .order('sector');

      if (error) throw error;
      
      const uniqueSectors = [...new Set(data.map(e => e.sector))].filter(Boolean);
      return uniqueSectors;
    },
  });

  return {
    empresas: empresas || [],
    isLoading,
    refetch,
    searchEmpresas,
    getEmpresaById,
    createEmpresa: createEmpresaMutation.mutateAsync,
    updateEmpresa: updateEmpresaMutation.mutateAsync,
    deleteEmpresa: deleteEmpresaMutation.mutateAsync,
    linkToContact,
    unlinkFromContact,
    sectors: sectors || [],
    isCreating: createEmpresaMutation.isPending,
    isUpdating: updateEmpresaMutation.isPending,
  };
};
