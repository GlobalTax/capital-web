import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { BaseWidget, DashboardLayout } from '../types';

export function usePersonalizedDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [activeLayoutId, setActiveLayoutId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [customWidgets, setCustomWidgets] = useState<BaseWidget[]>([]);

  // Cargar layouts del usuario
  const loadLayouts = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Cargar layouts personalizados del usuario
      const { data: userLayouts, error } = await supabase
        .from('user_dashboard_layouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cargar layouts compartidos
      const { data: sharedLayouts, error: sharedError } = await supabase
        .from('user_dashboard_layouts')
        .select('*')
        .eq('is_shared', true)
        .order('created_at', { ascending: false });

      if (sharedError) throw sharedError;

      // Procesar y combinar layouts
      const processedLayouts: DashboardLayout[] = [];
      
      // Añadir layouts del usuario
      if (userLayouts) {
        userLayouts.forEach(layout => {
          const layoutData = layout.layout_data as any;
          processedLayouts.push({
            id: layout.id,
            name: layout.layout_name,
            widgets: layoutData?.widgets || [],
            columns: layoutData?.columns || 3,
            isDefault: layout.is_default,
            isShared: layout.is_shared,
            sharedWith: layout.shared_with || undefined
          });
        });
      }

      // Añadir layouts compartidos (excluyendo los propios)
      if (sharedLayouts) {
        sharedLayouts
          .filter(layout => layout.user_id !== user.id)
          .forEach(layout => {
            const layoutData = layout.layout_data as any;
            processedLayouts.push({
              id: layout.id,
              name: `${layout.layout_name} (compartido)`,
              widgets: layoutData?.widgets || [],
              columns: layoutData?.columns || 3,
              isShared: true
            });
          });
      }

      setLayouts(processedLayouts);

      // Establecer layout activo (el por defecto o el primero)
      const defaultLayout = processedLayouts.find(l => l.isDefault);
      setActiveLayoutId(defaultLayout?.id || processedLayouts[0]?.id || '');

    } catch (error) {
      console.error('Error loading layouts:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los layouts del dashboard.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Cargar widgets personalizados
  const loadCustomWidgets = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('custom_widgets')
        .select('*')
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedWidgets: BaseWidget[] = data?.map(widget => {
        const config = widget.widget_config as any;
        return {
          id: widget.id,
          type: widget.widget_type as 'kpi' | 'chart' | 'table' | 'text' | 'alert',
          title: widget.widget_name,
          size: config?.size || 'medium',
          config: config || {},
          permissions: widget.permissions
        };
      }) || [];

      setCustomWidgets(processedWidgets);
    } catch (error) {
      console.error('Error loading custom widgets:', error);
    }
  }, [user]);

  // Guardar layout
  const saveLayout = useCallback(async (layout: DashboardLayout, setAsDefault = false) => {
    if (!user) return { success: false, error: 'No user authenticated' };

    try {
      const layoutData = {
        user_id: user.id,
        layout_name: layout.name,
        layout_data: JSON.parse(JSON.stringify({
          widgets: layout.widgets,
          columns: layout.columns
        })),
        is_default: setAsDefault,
        is_shared: layout.isShared || false,
        shared_with: layout.sharedWith || null
      };

      let result;
      if (layout.id && layout.id !== 'new') {
        // Actualizar layout existente
        result = await supabase
          .from('user_dashboard_layouts')
          .update(layoutData)
          .eq('id', layout.id)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Crear nuevo layout
        result = await supabase
          .from('user_dashboard_layouts')
          .insert(layoutData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Si se marca como predeterminado, desmarcar otros
      if (setAsDefault) {
        await supabase
          .from('user_dashboard_layouts')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', result.data.id);
      }

      // Recargar layouts
      await loadLayouts();

      toast({
        title: "Layout guardado",
        description: `El layout "${layout.name}" ha sido guardado correctamente.`
      });

      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error saving layout:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el layout.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  }, [user, toast, loadLayouts]);

  // Eliminar layout
  const deleteLayout = useCallback(async (layoutId: string) => {
    if (!user) return { success: false, error: 'No user authenticated' };

    try {
      const { error } = await supabase
        .from('user_dashboard_layouts')
        .delete()
        .eq('id', layoutId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Si era el layout activo, cambiar al primero disponible
      if (activeLayoutId === layoutId) {
        const remainingLayouts = layouts.filter(l => l.id !== layoutId);
        setActiveLayoutId(remainingLayouts[0]?.id || '');
      }

      // Recargar layouts
      await loadLayouts();

      toast({
        title: "Layout eliminado",
        description: "El layout ha sido eliminado correctamente."
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting layout:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el layout.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  }, [user, toast, activeLayoutId, layouts, loadLayouts]);

  // Crear widget personalizado
  const createCustomWidget = useCallback(async (widget: Omit<BaseWidget, 'id'>, isPublic = false) => {
    if (!user) return { success: false, error: 'No user authenticated' };

    try {
      const { data, error } = await supabase
        .from('custom_widgets')
        .insert({
          user_id: user.id,
          widget_name: widget.title,
          widget_type: widget.type,
          widget_config: JSON.parse(JSON.stringify({
            size: widget.size,
            ...widget.config
          })),
          permissions: widget.permissions || [],
          is_public: isPublic
        })
        .select()
        .single();

      if (error) throw error;

      await loadCustomWidgets();

      toast({
        title: "Widget creado",
        description: `El widget "${widget.title}" ha sido creado correctamente.`
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error creating widget:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el widget.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  }, [user, toast, loadCustomWidgets]);

  // Obtener layout activo
  const getActiveLayout = useCallback(() => {
    return layouts.find(l => l.id === activeLayoutId) || layouts[0] || null;
  }, [layouts, activeLayoutId]);

  // Efectos
  useEffect(() => {
    loadLayouts();
    loadCustomWidgets();
  }, [loadLayouts, loadCustomWidgets]);

  return {
    layouts,
    activeLayout: getActiveLayout(),
    activeLayoutId,
    setActiveLayoutId,
    customWidgets,
    isLoading,
    saveLayout,
    deleteLayout,
    createCustomWidget,
    loadLayouts,
    loadCustomWidgets
  };
}