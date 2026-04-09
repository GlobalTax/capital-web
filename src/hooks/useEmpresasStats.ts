// ============= EMPRESAS STATS HOOK =============
// Lightweight count queries for stats cards (no full data fetch)

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EmpresasStats {
  total: number;
  favorites: number;
  targets: number;
  totalFacturacion: number;
  avgEbitda: number;
  empresasWithEbitda: number;
}

export const useEmpresasStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['empresas-stats'],
    queryFn: async (): Promise<EmpresasStats> => {
      const [totalRes, favRes, targetRes] = await Promise.all([
        supabase.from('empresas').select('*', { count: 'exact', head: true }),
        supabase.from('empresa_favorites').select('*', { count: 'exact', head: true }),
        supabase.from('empresas').select('*', { count: 'exact', head: true }).eq('es_target', true),
      ]);

      return {
        total: totalRes.count ?? 0,
        favorites: favRes.count ?? 0,
        targets: targetRes.count ?? 0,
        totalFacturacion: 0, // Skip expensive aggregation
        avgEbitda: 0,
        empresasWithEbitda: 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    stats: stats || { total: 0, favorites: 0, targets: 0, totalFacturacion: 0, avgEbitda: 0, empresasWithEbitda: 0 },
    isLoading,
  };
};
