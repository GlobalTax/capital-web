import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SectorMultiple {
  id: string;
  sector_name: string;
  description: string;
  employee_range: string;
  revenue_multiple: number;
  ebitda_multiple: number;
  is_active: boolean;
  last_updated: string;
}

export interface SectorInfo {
  sector_name: string;
  description: string;
  multiples: SectorMultiple[];
}

export const useSectorMultiples = () => {
  return useQuery({
    queryKey: ["sector-multiples"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sector_multiples")
        .select("*")
        .eq("is_active", true)
        .order("sector_name")
        .order("employee_range");

      if (error) throw error;
      return data as SectorMultiple[];
    },
  });
};

export const useSectorsList = () => {
  return useQuery({
    queryKey: ["sectors-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sector_multiples")
        .select("sector_name, description")
        .eq("is_active", true)
        .order("sector_name");

      if (error) throw error;
      
      // Agrupar por sector
      const sectorsMap = new Map<string, string>();
      data.forEach(item => {
        sectorsMap.set(item.sector_name, item.description);
      });

      return Array.from(sectorsMap.entries()).map(([sector_name, description]) => ({
        sector_name,
        description
      }));
    },
  });
};

export const useSectorMultiplesByName = (sectorName: string) => {
  return useQuery({
    queryKey: ["sector-multiples", sectorName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sector_multiples")
        .select("*")
        .eq("is_active", true)
        .eq("sector_name", sectorName)
        .order("employee_range");

      if (error) throw error;
      return data as SectorMultiple[];
    },
    enabled: !!sectorName,
  });
};

export const getSectorMultiple = (
  multiples: SectorMultiple[],
  employeeRange: string
): SectorMultiple | null => {
  return multiples.find(m => m.employee_range === employeeRange) || null;
};