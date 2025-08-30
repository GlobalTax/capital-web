import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sector, CreateSectorRequest, UpdateSectorRequest, SectorWithChildren } from '@/types/sectors';

export const useSectors = (includeInactive = false) => {
  const queryClient = useQueryClient();

  // Fetch all sectors
  const { data: sectors = [], isLoading, error } = useQuery({
    queryKey: ['sectors', includeInactive],
    queryFn: async (): Promise<Sector[]> => {
      let query = supabase
        .from('sectors')
        .select('*')
        .order('display_order');

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create sector mutation
  const createSectorMutation = useMutation({
    mutationFn: async (newSector: CreateSectorRequest) => {
      const { data, error } = await supabase
        .from('sectors')
        .insert(newSector)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
      toast.success('Sector creado correctamente');
    },
    onError: (error: any) => {
      toast.error(`Error al crear sector: ${error.message}`);
    },
  });

  // Update sector mutation
  const updateSectorMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateSectorRequest }) => {
      const { data, error } = await supabase
        .from('sectors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
      toast.success('Sector actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(`Error al actualizar sector: ${error.message}`);
    },
  });

  // Delete sector mutation
  const deleteSectorMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
      toast.success('Sector eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar sector: ${error.message}`);
    },
  });

  // Toggle sector status
  const toggleSectorStatus = (id: string, currentStatus: boolean) => {
    updateSectorMutation.mutate({
      id,
      updates: { is_active: !currentStatus }
    });
  };

  // Reorder sectors
  const reorderSectors = async (sectorUpdates: { id: string; display_order: number }[]) => {
    try {
      for (const update of sectorUpdates) {
        await updateSectorMutation.mutateAsync({
          id: update.id,
          updates: { display_order: update.display_order }
        });
      }
    } catch (error) {
      toast.error('Error al reordenar sectores');
    }
  };

  // Build hierarchical tree structure
  const buildSectorTree = (sectors: Sector[]): SectorWithChildren[] => {
    const sectorMap = new Map<string, SectorWithChildren>();
    const rootSectors: SectorWithChildren[] = [];

    // First pass: create map of all sectors
    sectors.forEach(sector => {
      sectorMap.set(sector.id, { ...sector, children: [] });
    });

    // Second pass: build tree structure
    sectors.forEach(sector => {
      const sectorWithChildren = sectorMap.get(sector.id)!;
      
      if (sector.parent_id) {
        const parent = sectorMap.get(sector.parent_id);
        if (parent) {
          parent.children!.push(sectorWithChildren);
        }
      } else {
        rootSectors.push(sectorWithChildren);
      }
    });

    return rootSectors;
  };

  // Get sectors as flat list (for selects)
  const getActiveSectors = () => sectors.filter(s => s.is_active);

  // Get sectors as tree (for admin interface)
  const getSectorTree = () => buildSectorTree(sectors);

  return {
    sectors,
    activeSectors: getActiveSectors(),
    sectorTree: getSectorTree(),
    isLoading,
    error,
    createSector: createSectorMutation.mutate,
    updateSector: updateSectorMutation.mutate,
    deleteSector: deleteSectorMutation.mutate,
    toggleSectorStatus,
    reorderSectors,
    isCreating: createSectorMutation.isPending,
    isUpdating: updateSectorMutation.isPending,
    isDeleting: deleteSectorMutation.isPending,
  };
};