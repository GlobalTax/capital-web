import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type TipoInteraccion = 'llamada' | 'email' | 'reunion' | 'nota' | 'whatsapp' | 'linkedin' | 'visita';
export type ResultadoInteraccion = 'positivo' | 'neutral' | 'negativo' | 'pendiente_seguimiento';

export interface Interaccion {
  id: string;
  empresa_id: string | null;
  mandato_id: string | null;
  tipo: TipoInteraccion;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  resultado: ResultadoInteraccion | null;
  siguiente_accion: string | null;
  fecha_siguiente_accion: string | null;
  created_by: string | null;
  created_at: string | null;
}

export interface CreateInteraccionInput {
  tipo: TipoInteraccion;
  titulo: string;
  descripcion?: string;
  fecha: string;
  resultado?: ResultadoInteraccion | '';
  siguiente_accion?: string;
  fecha_siguiente_accion?: string;
}

const QUERY_KEY = 'empresa-interacciones';

export function useEmpresaInteracciones(empresaId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: interacciones = [], isLoading } = useQuery({
    queryKey: [QUERY_KEY, empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from('interacciones')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('fecha', { ascending: false });

      if (error) {
        console.error('[useEmpresaInteracciones] Query error:', error);
        throw error;
      }
      return (data || []) as Interaccion[];
    },
    enabled: !!empresaId,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateInteraccionInput) => {
      console.group('[CREATE_INTERACCION]');
      console.log('empresa_id:', empresaId);
      console.log('input:', input);

      // 1. Obtener usuario autenticado (requerido por RLS)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[CREATE_INTERACCION] Auth error:', authError);
        throw new Error('No autenticado. Inicia sesión para continuar.');
      }

      // 2. Validación frontend
      if (!input.titulo?.trim()) throw new Error('El título es obligatorio');
      if (!input.tipo) throw new Error('El tipo de interacción es obligatorio');
      if (!empresaId) throw new Error('ID de empresa no disponible');

      // 3. Preparar datos con valores correctos para los CHECK constraints
      const insertData = {
        empresa_id: empresaId,
        tipo: input.tipo,                                    // ya normalizado ('whatsapp', 'llamada', etc.)
        titulo: input.titulo.trim(),
        descripcion: input.descripcion?.trim() || null,
        fecha: input.fecha,
        resultado: (input.resultado && input.resultado.length > 0 ? input.resultado as ResultadoInteraccion : null),
        siguiente_accion: input.siguiente_accion?.trim() || null,
        fecha_siguiente_accion: input.fecha_siguiente_accion || null,
        created_by: user.id,                                 // CRÍTICO para RLS
      };

      console.log('data to insert:', insertData);

      const { data, error } = await supabase
        .from('interacciones')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[CREATE_INTERACCION] Supabase error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        console.groupEnd();

        if (error.code === '23514') throw new Error(`Valor inválido en el formulario: ${error.hint || error.message}`);
        if (error.code === '23503') throw new Error('ID de empresa no válido');
        if (error.code === '42501') throw new Error('Sin permisos para crear interacciones');
        throw new Error(error.message || 'Error al guardar la interacción');
      }

      console.log('[CREATE_INTERACCION] Success:', data);
      console.groupEnd();
      return data as Interaccion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, empresaId] });
      toast({ title: '✅ Interacción registrada correctamente' });
    },
    onError: (error: Error) => {
      console.error('[CREATE_INTERACCION] Final error:', error);
      toast({
        title: 'Error al registrar la interacción',
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, empresaId] });
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
