import React, { useState } from 'react';
import { OperationNote } from '../../types/notes';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  MessageSquare,
  Pencil,
  Trash2,
  Reply,
  Lock,
  Globe,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NoteComposer } from './NoteComposer';

interface NotesThreadProps {
  notes: OperationNote[];
  operationId: string;
  onCreateNote: (data: any) => void;
  onUpdateNote: (noteId: string, updates: any) => void;
  onDeleteNote: (noteId: string) => void;
  currentUserId?: string;
}

export const NotesThread: React.FC<NotesThreadProps> = ({
  notes,
  operationId,
  onCreateNote,
  onDeleteNote,
  currentUserId,
}) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const renderNote = (note: OperationNote, isReply: boolean = false) => {
    const isAuthor = currentUserId === note.user_id;

    return (
      <Card key={note.id} className={isReply ? 'ml-12 mt-3' : 'mb-4'}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {note.author?.full_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {note.author?.full_name || note.author?.email || 'Usuario'}
                  </span>
                  <Badge variant={note.is_internal ? 'secondary' : 'outline'} className="h-5">
                    {note.is_internal ? (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        Interna
                      </>
                    ) : (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        Compartible
                      </>
                    )}
                  </Badge>
                  {note.is_edited && (
                    <span className="text-xs text-muted-foreground">(editada)</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(note.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>
            </div>

            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onDeleteNote(note.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{note.note_text}</p>

          {note.mentions && note.mentions.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {note.mentions.length} {note.mentions.length === 1 ? 'mención' : 'menciones'}
              </span>
            </div>
          )}

          {!isReply && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(replyingTo === note.id ? null : note.id)}
              >
                <Reply className="h-4 w-4 mr-2" />
                Responder
              </Button>
            </div>
          )}

          {replyingTo === note.id && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <NoteComposer
                operationId={operationId}
                parentNoteId={note.id}
                onSubmit={(data) => {
                  onCreateNote(data);
                  setReplyingTo(null);
                }}
                placeholder="Escribe una respuesta..."
              />
            </div>
          )}

          {note.replies && note.replies.length > 0 && (
            <div className="mt-4">
              {note.replies.map((reply) => renderNote(reply, true))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {notes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No hay notas todavía</p>
          <p className="text-sm">Sé el primero en añadir una nota</p>
        </div>
      ) : (
        notes.map((note) => renderNote(note))
      )}
    </div>
  );
};
