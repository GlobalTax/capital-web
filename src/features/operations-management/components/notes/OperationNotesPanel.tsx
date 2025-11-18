import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useOperationNotes } from '../../hooks/useOperationNotes';
import { NoteComposer } from './NoteComposer';
import { NotesThread } from './NotesThread';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface OperationNotesPanelProps {
  operationId: string;
}

export const OperationNotesPanel: React.FC<OperationNotesPanelProps> = ({
  operationId,
}) => {
  const { user } = useAuth();
  const {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    isCreating,
  } = useOperationNotes(operationId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Notas y Comentarios
          {notes && notes.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({notes.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <NoteComposer
          operationId={operationId}
          onSubmit={createNote}
          isSubmitting={isCreating}
        />

        <NotesThread
          notes={notes || []}
          operationId={operationId}
          onCreateNote={createNote}
          onUpdateNote={(noteId, updates) => updateNote({ noteId, updates })}
          onDeleteNote={deleteNote}
          currentUserId={user?.id}
        />
      </CardContent>
    </Card>
  );
};
