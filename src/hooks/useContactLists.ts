/**
 * Hook for managing outbound lists (listas de contacto)
 * Tables: outbound_lists, outbound_list_companies, outbound_list_campaigns
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ContactList {
  id: string;
  nombre: string;
  descripcion: string | null;
  sector: string | null;
  origen: 'excel' | 'manual' | 'filtro' | 'campana';
  estado: 'borrador' | 'activa' | 'archivada';
  total_empresas: number;
  created_at: string;
  updated_at: string;
  last_campaign_name?: string | null;
}

export interface ContactListCompany {
  id: string;
  list_id: string;
  empresa: string;
  contacto: string | null;
  email: string | null;
  telefono: string | null;
  cif: string | null;
  web: string | null;
  provincia: string | null;
  facturacion: number | null;
  ebitda: number | null;
  anios_datos: number;
  notas: string | null;
  created_at: string;
}

export interface ContactListCampaign {
  id: string;
  list_id: string;
  campaign_id: string | null;
  campaign_nombre: string | null;
  fecha_vinculacion: string;
  empresas_enviadas: number;
  notas: string | null;
}

// Use 'as any' for tables not yet in generated types
const TB_LISTS = 'outbound_lists' as any;
const TB_COMPANIES = 'outbound_list_companies' as any;
const TB_CAMPAIGNS = 'outbound_list_campaigns' as any;

// ===== LISTS =====
export const useContactLists = () => {
  const queryClient = useQueryClient();

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['contact-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TB_LISTS)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const listIds = (data || []).map((l: any) => l.id);
      let campaignMap: Record<string, string> = {};
      if (listIds.length > 0) {
        const { data: campaigns } = await supabase
          .from(TB_CAMPAIGNS)
          .select('list_id, campaign_nombre')
          .in('list_id', listIds)
          .order('fecha_vinculacion', { ascending: false });
        if (campaigns) {
          for (const c of campaigns as any[]) {
            if (!campaignMap[c.list_id]) campaignMap[c.list_id] = c.campaign_nombre || '—';
          }
        }
      }

      return (data || []).map((l: any) => ({
        ...l,
        last_campaign_name: campaignMap[l.id] || null,
      })) as ContactList[];
    },
  });

  const createList = useMutation({
    mutationFn: async (input: { nombre: string; descripcion?: string; sector?: string }) => {
      const { data, error } = await supabase
        .from(TB_LISTS)
        .insert({ nombre: input.nombre, descripcion: input.descripcion || null, sector: input.sector || null, origen: 'manual', estado: 'borrador' })
        .select('id')
        .single();
      if (error) throw error;
      return data as { id: string };
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contact-lists'] }); toast.success('Lista creada'); },
    onError: (e: Error) => toast.error('Error al crear lista', { description: e.message }),
  });

  const updateList = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContactList> & { id: string }) => {
      const { error } = await supabase.from(TB_LISTS).update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contact-lists'] }); toast.success('Lista actualizada'); },
    onError: (e: Error) => toast.error('Error', { description: e.message }),
  });

  const deleteList = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TB_LISTS).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contact-lists'] }); toast.success('Lista eliminada'); },
    onError: (e: Error) => toast.error('Error', { description: e.message }),
  });

  const duplicateList = useMutation({
    mutationFn: async (id: string) => {
      const { data: original, error: fetchErr } = await supabase.from(TB_LISTS).select('*').eq('id', id).single();
      if (fetchErr || !original) throw fetchErr || new Error('Lista no encontrada');

      const { data: newList, error: createErr } = await supabase
        .from(TB_LISTS)
        .insert({ nombre: `${(original as any).nombre} (copia)`, descripcion: (original as any).descripcion, sector: (original as any).sector, origen: (original as any).origen, estado: 'borrador' })
        .select('id')
        .single();
      if (createErr || !newList) throw createErr || new Error('Error al duplicar');

      const { data: companies } = await supabase.from(TB_COMPANIES).select('*').eq('list_id', id);
      if (companies && companies.length > 0) {
        const copies = (companies as any[]).map(({ id: _, list_id, created_at, ...rest }) => ({ ...rest, list_id: (newList as any).id }));
        const { error: insertErr } = await supabase.from(TB_COMPANIES).insert(copies);
        if (insertErr) throw insertErr;
      }

      return newList as { id: string };
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contact-lists'] }); toast.success('Lista duplicada'); },
    onError: (e: Error) => toast.error('Error', { description: e.message }),
  });

  return { lists, isLoading, createList, updateList, deleteList, duplicateList };
};

// ===== LIST COMPANIES =====
export const useContactListCompanies = (listId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['contact-list-companies', listId],
    enabled: !!listId,
    queryFn: async () => {
      const { data, error } = await supabase.from(TB_COMPANIES).select('*').eq('list_id', listId!).order('created_at', { ascending: false });
      if (error) throw error;
      return data as ContactListCompany[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['contact-list-companies', listId] });
    queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
  };

  const addCompany = useMutation({
    mutationFn: async (input: Omit<ContactListCompany, 'id' | 'created_at'>) => {
      const { error } = await supabase.from(TB_COMPANIES).insert(input);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error('Error', { description: e.message }),
  });

  const addCompanies = useMutation({
    mutationFn: async (inputs: Omit<ContactListCompany, 'id' | 'created_at'>[]) => {
      const { error } = await supabase.from(TB_COMPANIES).insert(inputs);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Empresas añadidas'); },
    onError: (e: Error) => toast.error('Error', { description: e.message }),
  });

  const updateCompany = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContactListCompany> & { id: string }) => {
      const { error } = await supabase.from(TB_COMPANIES).update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Empresa actualizada'); },
    onError: (e: Error) => toast.error('Error', { description: e.message }),
  });

  const deleteCompany = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TB_COMPANIES).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error('Error', { description: e.message }),
  });

  const deleteCompanies = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from(TB_COMPANIES).delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Empresas eliminadas'); },
    onError: (e: Error) => toast.error('Error', { description: e.message }),
  });

  return { companies, isLoading, addCompany, addCompanies, updateCompany, deleteCompany, deleteCompanies };
};

// ===== LIST CAMPAIGNS =====
export const useContactListCampaigns = (listId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['contact-list-campaigns', listId],
    enabled: !!listId,
    queryFn: async () => {
      const { data, error } = await supabase.from(TB_CAMPAIGNS).select('*').eq('list_id', listId!).order('fecha_vinculacion', { ascending: false });
      if (error) throw error;
      return data as ContactListCampaign[];
    },
  });

  const linkCampaign = useMutation({
    mutationFn: async (input: { list_id: string; campaign_id: string; campaign_nombre: string; notas?: string; empresas_enviadas?: number }) => {
      const { error } = await supabase.from(TB_CAMPAIGNS).insert(input);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-list-campaigns', listId] });
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      toast.success('Campaña vinculada');
    },
    onError: (e: Error) => toast.error('Error', { description: e.message }),
  });

  return { campaigns, isLoading, linkCampaign };
};

// ===== COMPANY HISTORY =====
export const useCompanyListHistory = (empresaName: string | undefined) => {
  return useQuery({
    queryKey: ['company-list-history', empresaName],
    enabled: !!empresaName,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TB_COMPANIES)
        .select('created_at, list_id')
        .eq('empresa', empresaName!);
      if (error) throw error;

      // Fetch list names
      const listIds = [...new Set((data || []).map((d: any) => d.list_id))];
      const { data: lists } = await supabase.from(TB_LISTS).select('id, nombre').in('id', listIds);
      const listMap: Record<string, string> = {};
      (lists || []).forEach((l: any) => { listMap[l.id] = l.nombre; });

      return (data || []).map((d: any) => ({
        lista: listMap[d.list_id] || 'Desconocida',
        fecha: d.created_at,
      })).sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    },
  });
};
