import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StickyNote, Phone, Calendar, Mail, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactNote {
  id: string;
  content: string;
  note_type: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

interface ContactNotesManagerProps {
  contactId: string;
  contactSource: 'apollo' | 'lead_score';
  onNotesChange?: () => void;
}

const NOTE_TYPES = {
  general: { icon: StickyNote, label: 'General', color: 'bg-gray-100' },
  call: { icon: Phone, label: 'Llamada', color: 'bg-green-100' },
  meeting: { icon: Calendar, label: 'Reunión', color: 'bg-blue-100' },
  email: { icon: Mail, label: 'Email', color: 'bg-purple-100' }
};

export const ContactNotesManager: React.FC<ContactNotesManagerProps> = ({
  contactId,
  contactSource,
  onNotesChange
}) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<string>('general');
  const [newNotePrivate, setNewNotePrivate] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [contactId, contactSource]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_notes' as any)
        .select('*')
        .eq('contact_id', contactId)
        .eq('contact_source', contactSource)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes((data || []) as unknown as ContactNote[]);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const addNote = async () => {
    if (!newNoteContent.trim()) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('contact_notes' as any)
        .insert({
          contact_id: contactId,
          contact_source: contactSource,
          content: newNoteContent.trim(),
          note_type: newNoteType,
          is_private: newNotePrivate
        });

      if (error) throw error;

      await fetchNotes();
      setNewNoteContent('');
      setNewNoteType('general');
      setNewNotePrivate(false);
      setIsAddingNote(false);
      onNotesChange?.();

      toast({
        title: "Éxito",
        description: "Nota añadida correctamente"
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "No se pudo añadir la nota",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateNote = async (noteId: string) => {
    if (!editContent.trim()) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('contact_notes' as any)
        .update({ content: editContent.trim() })
        .eq('id', noteId);

      if (error) throw error;

      await fetchNotes();
      setEditingNote(null);
      setEditContent('');
      onNotesChange?.();

      toast({
        title: "Éxito",
        description: "Nota actualizada correctamente"
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la nota",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('contact_notes' as any)
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      await fetchNotes();
      onNotesChange?.();

      toast({
        title: "Éxito",
        description: "Nota eliminada correctamente"
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la nota",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (note: ContactNote) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setEditContent('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Add Note Button */}
      {!isAddingNote ? (
        <Button
          onClick={() => setIsAddingNote(true)}
          variant="outline"
          className="w-full"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir nota
        </Button>
      ) : (
        <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
          <div className="flex gap-2">
            <Select value={newNoteType} onValueChange={(value: any) => setNewNoteType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NOTE_TYPES).map(([type, config]) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-3 w-3" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={newNotePrivate ? "default" : "outline"}
              size="sm"
              onClick={() => setNewNotePrivate(!newNotePrivate)}
            >
              Privado
            </Button>
          </div>
          <Textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Escribe tu nota aquí..."
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              onClick={addNote}
              disabled={!newNoteContent.trim() || isLoading}
              size="sm"
            >
              <Save className="h-4 w-4 mr-1" />
              Guardar
            </Button>
            <Button
              onClick={() => {
                setIsAddingNote(false);
                setNewNoteContent('');
                setNewNoteType('general');
                setNewNotePrivate(false);
              }}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay notas</p>
          </div>
        ) : (
          notes.map(note => {
            const noteType = NOTE_TYPES[note.note_type];
            const isEditing = editingNote === note.id;

            return (
              <div key={note.id} className="p-3 border rounded-lg bg-white">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-full ${noteType.color}`}>
                      <noteType.icon className="h-3 w-3" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {noteType.label}
                    </Badge>
                    {note.is_private && (
                      <Badge variant="outline" className="text-xs">
                        Privado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(note)}
                      disabled={isLoading || isEditing}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNote(note.id)}
                      disabled={isLoading}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateNote(note.id)}
                        disabled={!editContent.trim() || isLoading}
                        size="sm"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Guardar
                      </Button>
                      <Button
                        onClick={cancelEditing}
                        variant="outline"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>{formatDate(note.created_at)}</span>
                      {note.updated_at !== note.created_at && (
                        <span>Editado: {formatDate(note.updated_at)}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};