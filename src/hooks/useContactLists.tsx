import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContactList {
  id: string;
  name: string;
  description?: string;
  list_type: 'static' | 'dynamic';
  contact_count: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

export interface ContactSegment {
  id: string;
  name: string;
  description?: string;
  criteria: any;
  contact_count: number;
  is_active: boolean;
  auto_update: boolean;
  created_at: string;
}

export const useContactLists = () => {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [tags, setTags] = useState<ContactTag[]>([]);
  const [segments, setSegments] = useState<ContactSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all lists
  const fetchLists = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_lists')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLists((data || []) as ContactList[]);
    } catch (error) {
      console.error('Error fetching lists:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las listas",
        variant: "destructive"
      });
    }
  };

  // Fetch all tags
  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_tags')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las etiquetas",
        variant: "destructive"
      });
    }
  };

  // Fetch all segments
  const fetchSegments = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_segments')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSegments(data || []);
    } catch (error) {
      console.error('Error fetching segments:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los segmentos",
        variant: "destructive"
      });
    }
  };

  // Create new list
  const createList = async (listData: Omit<ContactList, 'id' | 'created_at' | 'updated_at' | 'contact_count'>) => {
    try {
      const { data, error } = await supabase
        .from('contact_lists')
        .insert([listData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchLists();
      toast({
        title: "Lista creada",
        description: "La lista se ha creado correctamente"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating list:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la lista",
        variant: "destructive"
      });
    }
  };

  // Create new tag
  const createTag = async (tagData: Omit<ContactTag, 'id' | 'created_at' | 'usage_count'>) => {
    try {
      const { data, error } = await supabase
        .from('contact_tags')
        .insert([tagData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchTags();
      toast({
        title: "Etiqueta creada",
        description: "La etiqueta se ha creado correctamente"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la etiqueta",
        variant: "destructive"
      });
    }
  };

  // Create new segment
  const createSegment = async (segmentData: Omit<ContactSegment, 'id' | 'created_at' | 'contact_count'>) => {
    try {
      const { data, error } = await supabase
        .from('contact_segments')
        .insert([segmentData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchSegments();
      toast({
        title: "Segmento creado",
        description: "El segmento se ha creado correctamente"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating segment:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el segmento",
        variant: "destructive"
      });
    }
  };

  // Add contacts to list
  const addContactsToList = async (listId: string, contactIds: Array<{id: string, source: string}>) => {
    try {
      const assignments = contactIds.map(contact => ({
        contact_id: contact.id,
        contact_source: contact.source,
        list_id: listId
      }));

      const { error } = await supabase
        .from('contact_list_assignments')
        .insert(assignments);

      if (error) throw error;
      
      await fetchLists();
      toast({
        title: "Contactos añadidos",
        description: `${contactIds.length} contactos añadidos a la lista`
      });
    } catch (error) {
      console.error('Error adding contacts to list:', error);
      toast({
        title: "Error",
        description: "No se pudieron añadir los contactos a la lista",
        variant: "destructive"
      });
    }
  };

  // Add tag to contacts
  const addTagToContacts = async (tagId: string, contactIds: Array<{id: string, source: string}>) => {
    try {
      const assignments = contactIds.map(contact => ({
        contact_id: contact.id,
        contact_source: contact.source,
        tag_id: tagId
      }));

      const { error } = await supabase
        .from('contact_tag_assignments')
        .insert(assignments);

      if (error) throw error;
      
      await fetchTags();
      toast({
        title: "Etiqueta asignada",
        description: `Etiqueta asignada a ${contactIds.length} contactos`
      });
    } catch (error) {
      console.error('Error adding tag to contacts:', error);
      toast({
        title: "Error",
        description: "No se pudo asignar la etiqueta",
        variant: "destructive"
      });
    }
  };

  // Get contacts in a list
  const getListContacts = async (listId: string) => {
    try {
      const { data, error } = await supabase
        .from('contact_list_assignments')
        .select('contact_id, contact_source')
        .eq('list_id', listId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching list contacts:', error);
      return [];
    }
  };

  // Get contact tags
  const getContactTags = async (contactId: string, contactSource: string) => {
    try {
      const { data, error } = await supabase
        .from('contact_tag_assignments')
        .select(`
          tag_id,
          contact_tags (
            id,
            name,
            color
          )
        `)
        .eq('contact_id', contactId)
        .eq('contact_source', contactSource);

      if (error) throw error;
      return data?.map(item => item.contact_tags).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching contact tags:', error);
      return [];
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchLists(),
        fetchTags(),
        fetchSegments()
      ]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  return {
    lists,
    tags,
    segments,
    isLoading,
    createList,
    createTag,
    createSegment,
    addContactsToList,
    addTagToContacts,
    getListContacts,
    getContactTags,
    refetch: async () => {
      await Promise.all([fetchLists(), fetchTags(), fetchSegments()]);
    }
  };
};