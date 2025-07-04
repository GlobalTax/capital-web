import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, X, List, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactList {
  id: string;
  name: string;
  description?: string;
  list_type: string;
  contact_count: number;
}

interface ContactListsManagerProps {
  contactId: string;
  contactSource: 'apollo' | 'lead_score';
  onListsChange?: () => void;
}

export const ContactListsManager: React.FC<ContactListsManagerProps> = ({
  contactId,
  contactSource,
  onListsChange
}) => {
  const { toast } = useToast();
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [availableLists, setAvailableLists] = useState<ContactList[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListType, setNewListType] = useState<string>('static');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchContactLists();
    fetchAvailableLists();
  }, [contactId, contactSource]);

  const fetchContactLists = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_list_assignments')
        .select(`
          id,
          list_id,
          contact_lists!inner (
            id,
            name,
            description,
            list_type,
            contact_count
          )
        `)
        .eq('contact_id', contactId)
        .eq('contact_source', contactSource);

      if (error) throw error;

      const lists = data?.map(item => item.contact_lists).flat() || [];
      setContactLists(lists);
    } catch (error) {
      console.error('Error fetching contact lists:', error);
    }
  };

  const fetchAvailableLists = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_lists')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableLists(data || []);
    } catch (error) {
      console.error('Error fetching available lists:', error);
    }
  };

  const addContactToList = async (listId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('contact_list_assignments')
        .insert({
          contact_id: contactId,
          contact_source: contactSource,
          list_id: listId
        });

      if (error) throw error;

      await fetchContactLists();
      await fetchAvailableLists();
      onListsChange?.();

      toast({
        title: "Éxito",
        description: "Contacto añadido a la lista"
      });
    } catch (error) {
      console.error('Error adding to list:', error);
      toast({
        title: "Error",
        description: "No se pudo añadir a la lista",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeContactFromList = async (listId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('contact_list_assignments')
        .delete()
        .eq('contact_id', contactId)
        .eq('contact_source', contactSource)
        .eq('list_id', listId);

      if (error) throw error;

      await fetchContactLists();
      await fetchAvailableLists();
      onListsChange?.();

      toast({
        title: "Éxito",
        description: "Contacto eliminado de la lista"
      });
    } catch (error) {
      console.error('Error removing from list:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar de la lista",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewList = async () => {
    if (!newListName.trim()) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contact_lists')
        .insert({
          name: newListName.trim(),
          description: newListDescription.trim() || null,
          list_type: newListType
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAvailableLists();
      setNewListName('');
      setNewListDescription('');
      setNewListType('static');
      setIsCreateDialogOpen(false);

      toast({
        title: "Éxito",
        description: "Nueva lista creada"
      });
    } catch (error) {
      console.error('Error creating list:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la lista",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unassignedLists = availableLists.filter(
    list => !contactLists.some(contactList => contactList.id === list.id)
  );

  return (
    <div className="space-y-3">
      {/* Current Lists */}
      <div className="flex flex-wrap gap-2">
        {contactLists.map(list => (
          <Badge
            key={list.id}
            variant="outline"
            className="flex items-center gap-1 px-2 py-1"
          >
            <List className="h-3 w-3" />
            {list.name}
            <span className="text-xs text-gray-500">({list.contact_count})</span>
            <button
              onClick={() => removeContactFromList(list.id)}
              disabled={isLoading}
              className="ml-1 hover:bg-black/10 rounded-sm p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Add to List Dropdown */}
      {unassignedLists.length > 0 && (
        <Select onValueChange={addContactToList} disabled={isLoading}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Añadir a lista existente..." />
          </SelectTrigger>
          <SelectContent>
            {unassignedLists.map(list => (
              <SelectItem key={list.id} value={list.id}>
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  {list.name}
                  <span className="text-xs text-gray-500">
                    ({list.contact_count} contactos)
                  </span>
                  {list.list_type === 'dynamic' && (
                    <Badge variant="secondary" className="text-xs">
                      Dinámico
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Create New List */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700">
            <Plus className="h-4 w-4 mr-1" />
            Crear nueva lista
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Lista</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Nombre de la lista"
                onKeyDown={(e) => e.key === 'Enter' && createNewList()}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción (opcional)</label>
              <Textarea
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Descripción de la lista"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select value={newListType} onValueChange={(value: string) => setNewListType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">
                    <div className="flex flex-col">
                      <span>Estática</span>
                      <span className="text-xs text-gray-500">Contactos añadidos manualmente</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dynamic">
                    <div className="flex flex-col">
                      <span>Dinámica</span>
                      <span className="text-xs text-gray-500">Basada en criterios automáticos</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={createNewList}
                disabled={!newListName.trim() || isLoading}
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