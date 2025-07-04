import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, X, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactTag {
  id: string;
  name: string;
  color: string;
  usage_count: number;
}

interface ContactTagsManagerProps {
  contactId: string;
  contactSource: 'apollo' | 'lead_score';
  onTagsChange?: () => void;
}

const TAG_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'
];

export const ContactTagsManager: React.FC<ContactTagsManagerProps> = ({
  contactId,
  contactSource,
  onTagsChange
}) => {
  const { toast } = useToast();
  const [contactTags, setContactTags] = useState<ContactTag[]>([]);
  const [availableTags, setAvailableTags] = useState<ContactTag[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchContactTags();
    fetchAvailableTags();
  }, [contactId, contactSource]);

  const fetchContactTags = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_tag_assignments')
        .select(`
          id,
          tag_id,
          contact_tags!inner (
            id,
            name,
            color,
            usage_count
          )
        `)
        .eq('contact_id', contactId)
        .eq('contact_source', contactSource);

      if (error) throw error;

      const tags = data?.map(item => item.contact_tags).flat() || [];
      setContactTags(tags);
    } catch (error) {
      console.error('Error fetching contact tags:', error);
    }
  };

  const fetchAvailableTags = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_tags')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableTags(data || []);
    } catch (error) {
      console.error('Error fetching available tags:', error);
    }
  };

  const addTagToContact = async (tagId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('contact_tag_assignments')
        .insert({
          contact_id: contactId,
          contact_source: contactSource,
          tag_id: tagId
        });

      if (error) throw error;

      await fetchContactTags();
      await fetchAvailableTags();
      onTagsChange?.();

      toast({
        title: "Éxito",
        description: "Etiqueta añadida al contacto"
      });
    } catch (error) {
      console.error('Error adding tag:', error);
      toast({
        title: "Error",
        description: "No se pudo añadir la etiqueta",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeTagFromContact = async (tagId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('contact_tag_assignments')
        .delete()
        .eq('contact_id', contactId)
        .eq('contact_source', contactSource)
        .eq('tag_id', tagId);

      if (error) throw error;

      await fetchContactTags();
      await fetchAvailableTags();
      onTagsChange?.();

      toast({
        title: "Éxito",
        description: "Etiqueta eliminada del contacto"
      });
    } catch (error) {
      console.error('Error removing tag:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la etiqueta",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewTag = async () => {
    if (!newTagName.trim()) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contact_tags')
        .insert({
          name: newTagName.trim(),
          color: newTagColor
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAvailableTags();
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0]);
      setIsCreateDialogOpen(false);

      toast({
        title: "Éxito",
        description: "Nueva etiqueta creada"
      });
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la etiqueta",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unassignedTags = availableTags.filter(
    tag => !contactTags.some(contactTag => contactTag.id === tag.id)
  );

  return (
    <div className="space-y-3">
      {/* Current Tags */}
      <div className="flex flex-wrap gap-2">
        {contactTags.map(tag => (
          <Badge
            key={tag.id}
            variant="secondary"
            style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color, color: tag.color }}
            className="flex items-center gap-1 px-2 py-1"
          >
            <Tag className="h-3 w-3" />
            {tag.name}
            <button
              onClick={() => removeTagFromContact(tag.id)}
              disabled={isLoading}
              className="ml-1 hover:bg-black/10 rounded-sm p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Add Tag Dropdown */}
      {unassignedTags.length > 0 && (
        <Select onValueChange={addTagToContact} disabled={isLoading}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Añadir etiqueta existente..." />
          </SelectTrigger>
          <SelectContent>
            {unassignedTags.map(tag => (
              <SelectItem key={tag.id} value={tag.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                  <span className="text-xs text-gray-500">({tag.usage_count})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Create New Tag */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700">
            <Plus className="h-4 w-4 mr-1" />
            Crear nueva etiqueta
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Etiqueta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nombre de la etiqueta"
                onKeyDown={(e) => e.key === 'Enter' && createNewTag()}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TAG_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewTagColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newTagColor === color ? 'border-gray-900' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={createNewTag}
                disabled={!newTagName.trim() || isLoading}
                className="flex-1"
              >
                Crear
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};