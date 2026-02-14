import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SectorIntelligenceRow {
  id: string;
  sector: string;
  subsector: string;
  vertical: string | null;
  pe_thesis: string | null;
  quantitative_data: string | null;
  active_pe_firms: string | null;
  platforms_operations: string | null;
  multiples_valuations: string | null;
  consolidation_phase: string | null;
  geography: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSectorIntelligence = () => {
  const queryClient = useQueryClient();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['sector-intelligence'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pe_sector_intelligence')
        .select('*')
        .order('sector', { ascending: true })
        .order('subsector', { ascending: true });
      if (error) throw error;
      return data as SectorIntelligenceRow[];
    },
  });

  const updateRow = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SectorIntelligenceRow> & { id: string }) => {
      const { error } = await supabase
        .from('pe_sector_intelligence')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sector-intelligence'] });
      toast.success('Registro actualizado');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const createRow = useMutation({
    mutationFn: async (row: Omit<SectorIntelligenceRow, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase.from('pe_sector_intelligence').insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sector-intelligence'] });
      toast.success('Registro creado');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteRow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pe_sector_intelligence').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sector-intelligence'] });
      toast.success('Registro eliminado');
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Group by sector
  const grouped = rows.reduce((acc, row) => {
    if (!acc[row.sector]) acc[row.sector] = [];
    acc[row.sector].push(row);
    return acc;
  }, {} as Record<string, SectorIntelligenceRow[]>);

  const sectors = Object.keys(grouped).sort();

  return { rows, grouped, sectors, isLoading, updateRow, createRow, deleteRow };
};
