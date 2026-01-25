// Hook for admin CRUD operations on sidebar configuration

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  SidebarSection, 
  SidebarItem, 
  SidebarSectionFormData, 
  SidebarItemFormData,
  SidebarGlobalConfig 
} from '@/types/sidebar-config';

export const useSidebarAdmin = () => {
  const queryClient = useQueryClient();

  const invalidateSidebar = () => {
    queryClient.invalidateQueries({ queryKey: ['sidebar'] });
  };

  // === SECTION MUTATIONS ===

  const createSection = useMutation({
    mutationFn: async (data: SidebarSectionFormData & { position: number }) => {
      const { data: result, error } = await supabase
        .from('sidebar_sections')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Sección creada');
      invalidateSidebar();
    },
    onError: (error) => {
      toast.error('Error al crear sección: ' + error.message);
    }
  });

  const updateSection = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SidebarSectionFormData> }) => {
      const { data: result, error } = await supabase
        .from('sidebar_sections')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Sección actualizada');
      invalidateSidebar();
    },
    onError: (error) => {
      toast.error('Error al actualizar sección: ' + error.message);
    }
  });

  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sidebar_sections')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Sección eliminada');
      invalidateSidebar();
    },
    onError: (error) => {
      toast.error('Error al eliminar sección: ' + error.message);
    }
  });

  const reorderSections = useMutation({
    mutationFn: async (sections: { id: string; position: number }[]) => {
      const updates = sections.map(({ id, position }) =>
        supabase
          .from('sidebar_sections')
          .update({ position })
          .eq('id', id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      toast.success('Orden actualizado');
      invalidateSidebar();
    },
    onError: (error) => {
      toast.error('Error al reordenar: ' + error.message);
    }
  });

  // === ITEM MUTATIONS ===

  const createItem = useMutation({
    mutationFn: async (data: SidebarItemFormData & { section_id: string; position: number }) => {
      const { data: result, error } = await supabase
        .from('sidebar_items')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Item creado');
      invalidateSidebar();
    },
    onError: (error) => {
      toast.error('Error al crear item: ' + error.message);
    }
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SidebarItemFormData> }) => {
      const { data: result, error } = await supabase
        .from('sidebar_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Item actualizado');
      invalidateSidebar();
    },
    onError: (error) => {
      toast.error('Error al actualizar item: ' + error.message);
    }
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sidebar_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Item eliminado');
      invalidateSidebar();
    },
    onError: (error) => {
      toast.error('Error al eliminar item: ' + error.message);
    }
  });

  const reorderItems = useMutation({
    mutationFn: async (items: { id: string; position: number; section_id?: string }[]) => {
      const updates = items.map(({ id, position, section_id }) => {
        const updateData: { position: number; section_id?: string } = { position };
        if (section_id) updateData.section_id = section_id;
        return supabase
          .from('sidebar_items')
          .update(updateData)
          .eq('id', id);
      });
      await Promise.all(updates);
    },
    onSuccess: () => {
      toast.success('Orden actualizado');
      invalidateSidebar();
    },
    onError: (error) => {
      toast.error('Error al reordenar: ' + error.message);
    }
  });

  const moveItemToSection = useMutation({
    mutationFn: async ({ itemId, newSectionId, newPosition }: { itemId: string; newSectionId: string; newPosition: number }) => {
      const { error } = await supabase
        .from('sidebar_items')
        .update({ section_id: newSectionId, position: newPosition })
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Item movido');
      invalidateSidebar();
    },
    onError: (error) => {
      toast.error('Error al mover item: ' + error.message);
    }
  });

  // === GLOBAL CONFIG MUTATIONS ===

  const updateGlobalConfig = useMutation({
    mutationFn: async (data: Partial<Omit<SidebarGlobalConfig, 'id' | 'updated_at'>>) => {
      const { data: result, error } = await supabase
        .from('sidebar_config')
        .update(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Configuración actualizada');
      invalidateSidebar();
    },
    onError: (error) => {
      toast.error('Error al actualizar configuración: ' + error.message);
    }
  });

  return {
    // Sections
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    // Items
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
    moveItemToSection,
    // Global config
    updateGlobalConfig,
    // Utils
    invalidateSidebar,
  };
};
