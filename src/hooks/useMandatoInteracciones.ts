import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type {
  TipoInteraccion,
  ResultadoInteraccion,
  Interaccion,
  CreateInteraccionInput,
} from './useEmpresaInteracciones';

export type { TipoInteraccion, ResultadoInteraccion, Interaccion, CreateInteraccionInput };

const QUERY_KEY = 'mandato-interacciones';

export function useMandatoInteracciones(mandatoId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: interacciones = [], isLoading } = useQuery({
    queryKey: [QUERY_KEY, mandatoId],
    queryFn: async () => {
      if (!mandatoId) return [];
      const { data, error } = await supabase
        .from('interacciones')
        .select('*')
        .eq('mandato_id', mandatoId)
        .order('fecha', { ascending: false });

      if (error) {
        console.error('[useMandatoInteracciones] Query error:', error);
        throw error;
      }
      return (data || []) as Interaccion[];
    },
    enabled: !!mandatoId,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateInteraccionInput) => {
      console.group('[CREATE_MANDATO_INTERACCION]');
      console.log('mandato_id:', mandatoId);
      console.log('input:', input);

      // 1. Auth check (requerido por RLS)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[CREATE_MANDATO_INTERACCION] Auth error:', authError);
        throw new Error('No autenticado. Inicia sesión para continuar.');
      }

      // 2. Validación frontend
      if (!input.titulo?.trim()) throw new Error('El título es obligatorio');
      if (!input.tipo) throw new Error('El tipo de interacción es obligatorio');
      if (!mandatoId) throw new Error('ID de mandato no disponible');

      // 3. Insert con mandato_id (constraint actualizada para aceptarlo sin empresa_id)
      const insertData = {
        mandato_id: mandatoId,
        tipo: input.tipo,
        titulo: input.titulo.trim(),
        descripcion: input.descripcion?.trim() || null,
        fecha: input.fecha,
        resultado: (input.resultado && input.resultado.length > 0
          ? input.resultado as ResultadoInteraccion
          : null),
        siguiente_accion: input.siguiente_accion?.trim() || null,
        fecha_siguiente_accion: input.fecha_siguiente_accion || null,
        created_by: user.id, // CRÍTICO para RLS
      };

      console.log('data to insert:', insertData);

      const { data, error } = await supabase
        .from('interacciones')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[CREATE_MANDATO_INTERACCION] Supabase error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        console.groupEnd();

        if (error.code === '23514') throw new Error(`Valor inválido en el formulario: ${error.hint || error.message}`);
        if (error.code === '23503') throw new Error('ID de mandato no válido');
        if (error.code === '42501') throw new Error('Sin permisos para crear interacciones');
        throw new Error(error.message || 'Error al guardar la interacción');
      }

      console.log('[CREATE_MANDATO_INTERACCION] Success:', data);
      console.groupEnd();
      return data as Interaccion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, mandatoId] });
      toast({ title: '✅ Interacción registrada correctamente' });
    },
    onError: (error: Error) => {
      console.error('[CREATE_MANDATO_INTERACCION] Final error:', error);
      toast({
        title: 'Error al registrar interacción',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (interaccionId: string) => {
      const { error } = await supabase
        .from('interacciones')
        .delete()
        .eq('id', interaccionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, mandatoId] });
      toast({ title: '🗑️ Interacción eliminada' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al eliminar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    interacciones,
    isLoading,
    createInteraccion: createMutation.mutate,
    isCreating: createMutation.isPending,
    deleteInteraccion: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
