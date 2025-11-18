import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OperationNote, CreateNoteInput, UpdateNoteInput, NoteMention } from '../types/notes';

export const useOperationNotes = (operationId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch notas con threading
  const { data: notes, isLoading } = useQuery({
    queryKey: ['operation-notes', operationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operation_notes')
        .select(`
          *,
          author:admin_users!operation_notes_user_id_fkey(
            full_name,
            email
          )
        `)
        .eq('operation_id', operationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Organizar en threads (padres e hijos)
      const notesMap = new Map<string, OperationNote>();
      const rootNotes: OperationNote[] = [];

      (data || []).forEach((note: any) => {
        const formattedNote: OperationNote = {
          ...note,
          mentions: Array.isArray(note.mentions) ? note.mentions : [],
          attachments: Array.isArray(note.attachments) ? note.attachments : [],
          replies: [],
        };
        notesMap.set(note.id, formattedNote);
      });

      // Construir árbol de respuestas
      notesMap.forEach((note) => {
        if (note.parent_note_id) {
          const parent = notesMap.get(note.parent_note_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(note);
          }
        } else {
          rootNotes.push(note);
        }
      });

      return rootNotes;
    },
    enabled: !!operationId,
  });

  // Crear nota
  const createNoteMutation = useMutation({
    mutationFn: async (input: CreateNoteInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { data, error } = await supabase
        .from('operation_notes')
        .insert([{
          operation_id: input.operation_id,
          note_text: input.note_text,
          note_html: input.note_html,
          is_internal: input.is_internal,
          parent_note_id: input.parent_note_id || null,
          mentions: input.mentions,
          attachments: input.attachments,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-notes', operationId] });
      toast({
        title: 'Nota creada',
        description: 'La nota se ha añadido correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al crear nota',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Actualizar nota
  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, updates }: { noteId: string; updates: UpdateNoteInput }) => {
      const { data, error } = await supabase
        .from('operation_notes')
        .update({
          ...updates,
          is_edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-notes', operationId] });
      toast({
        title: 'Nota actualizada',
        description: 'Los cambios se han guardado',
      });
    },
  });

  // Eliminar nota (soft delete)
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('operation_notes')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id,
        })
        .eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-notes', operationId] });
      toast({
        title: 'Nota eliminada',
        description: 'La nota se ha eliminado correctamente',
      });
    },
  });

  return {
    notes,
    isLoading,
    createNote: createNoteMutation.mutate,
    updateNote: updateNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
  };
};

// Hook para notificaciones de menciones
export const useNoteMentions = () => {
  const queryClient = useQueryClient();

  const { data: mentions, isLoading } = useQuery({
    queryKey: ['note-mentions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('note_mentions')
        .select(`
          *,
          note:operation_notes(
            id,
            operation_id,
            note_text,
            created_at,
            author:admin_users!operation_notes_user_id_fkey(
              full_name,
              email
            )
          )
        `)
        .eq('mentioned_user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as any as NoteMention[];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (mentionId: string) => {
      const { error } = await supabase
        .from('note_mentions')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', mentionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note-mentions'] });
    },
  });

  return {
    mentions,
    unreadCount: mentions?.length || 0,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
  };
};
