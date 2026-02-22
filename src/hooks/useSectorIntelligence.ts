import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
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

  const bulkCreateRows = useMutation({
    mutationFn: async (rows: Omit<SectorIntelligenceRow, 'id' | 'created_at' | 'updated_at'>[]) => {
      // Chunk into batches of 500
      for (let i = 0; i < rows.length; i += 500) {
        const chunk = rows.slice(i, i + 500);
        const { error } = await supabase.from('pe_sector_intelligence').insert(chunk);
        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sector-intelligence'] });
      toast.success(`${variables.length} registros importados`);
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Group by sector
  const grouped = useMemo(() => rows.reduce((acc, row) => {
    if (!acc[row.sector]) acc[row.sector] = [];
    acc[row.sector].push(row);
    return acc;
  }, {} as Record<string, SectorIntelligenceRow[]>), [rows]);

  const sectors = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  const findBySector = useMemo(() => (sector: string, subsector?: string | null) => {
    const sectorNorm = sector?.toLowerCase().trim();
    if (!sectorNorm) return { type: 'none' as const, matches: [] as SectorIntelligenceRow[] };
    const exactMatch = rows.filter(r =>
      r.sector.toLowerCase().trim() === sectorNorm &&
      (!subsector || r.subsector.toLowerCase().trim() === subsector.toLowerCase().trim())
    );
    if (exactMatch.length > 0) return { type: 'exact' as const, matches: exactMatch };
    const sectorMatch = rows.filter(r => r.sector.toLowerCase().trim() === sectorNorm);
    if (sectorMatch.length > 0) return { type: 'sector' as const, matches: sectorMatch };
    return { type: 'none' as const, matches: [] as SectorIntelligenceRow[] };
  }, [rows]);

  return { rows, grouped, sectors, isLoading, updateRow, createRow, deleteRow, bulkCreateRows, findBySector };
};
