import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type CategoriaServicio = 'operacion_ma' | 'valoracion' | 'due_diligence' | 'asesoria';

const CATEGORIA_LABELS: Record<CategoriaServicio, string> = {
  operacion_ma: 'Mandato (Venta)',
  valoracion: 'Valoración',
  due_diligence: 'Due Diligence',
  asesoria: 'Legal / Asesoría',
};

const CATEGORIA_DEFAULTS: Record<CategoriaServicio, Record<string, unknown>> = {
  operacion_ma: { tipo: 'venta', estado: 'nuevo' },
  valoracion: { tipo: 'valoracion', estado: 'nuevo' },
  due_diligence: { tipo: 'due_diligence', estado: 'nuevo' },
  asesoria: { tipo: 'asesoria', estado: 'nuevo' },
};

export function useCreateServicio(empresaId: string | undefined, empresaNombre?: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (categoria: CategoriaServicio) => {
      if (!empresaId) throw new Error('No empresa ID');

      const defaults = CATEGORIA_DEFAULTS[categoria];
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('mandatos')
        .insert({
          categoria,
          empresa_principal_id: empresaId,
          nombre_proyecto: `${CATEGORIA_LABELS[categoria]} - ${empresaNombre || 'Sin nombre'}`,
          fecha_inicio: now,
          ...defaults,
        })
        .select('id')
        .single();

      if (error) throw error;
      return { id: data.id, categoria };
    },
    onSuccess: ({ id, categoria }) => {
      queryClient.invalidateQueries({ queryKey: ['empresa-detail', empresaId] });
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      queryClient.invalidateQueries({ queryKey: ['mandatos'] });
      toast({ title: `✅ ${CATEGORIA_LABELS[categoria]} creado` });
      navigate(`/admin/operations/${id}`);
    },
    onError: (error) => {
      console.error('Error creating servicio:', error);
      toast({ title: 'Error', description: 'No se pudo crear el servicio', variant: 'destructive' });
    },
  });

  return {
    createServicio: (categoria: CategoriaServicio) => mutation.mutate(categoria),
    isPending: mutation.isPending,
  };
}
