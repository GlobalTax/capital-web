/**
 * Hook for managing outbound lists (listas de contacto)
 * Tables: outbound_lists, outbound_list_companies, outbound_list_campaigns
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Paginate a Supabase query to fetch ALL rows (beyond the 1000-row default limit).
 * `buildQuery` receives (from, to) and must return a fresh query with .range() applied.
 */
async function fetchAllRows<T = any>(
  buildQuery: (from: number, to: number) => any,
  pageSize = 1000
): Promise<T[]> {
  const allData: T[] = [];
  const seenIds = new Set<string>();
  let from = 0;
  while (true) {
    const { data, error } = await buildQuery(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const row of data as any[]) {
      const id = row?.id;
      if (id && seenIds.has(id)) continue;
      if (id) seenIds.add(id);
      allData.push(row);
    }
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return allData;
}

export type ContactListTipo = 'compradores' | 'outbound' | 'madre' | 'otros';

export interface ContactList {
  id: string;
  name: string;
  description: string | null;
  sector: string | null;
  tipo: ContactListTipo;
  origen: string;
  estado: string;
  contact_count: number;
  created_at: string;
  updated_at: string;
  last_campaign_name?: string | null;
  lista_madre_id?: string | null;
  has_children: boolean;
  notes: string | null;
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
  num_trabajadores: number | null;
  director_ejecutivo: string | null;
  linkedin: string | null;
  comunidad_autonoma: string | null;
  posicion_contacto: string | null;
  cnae: string | null;
  descripcion_actividad: string | null;
  consolidador: boolean;
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

      // Compute which lists have children (are "madre")
      const parentIds = new Set(
        (data || []).map((l: any) => l.lista_madre_id).filter(Boolean)
      );

      return (data || []).map((l: any) => ({
        id: l.id,
        name: l.name,
        description: l.description,
        sector: l.sector,
        tipo: l.tipo || 'outbound',
        origen: l.origen || 'manual',
        estado: l.estado || 'borrador',
        contact_count: l.contact_count || 0,
        created_at: l.created_at,
        updated_at: l.updated_at,
        last_campaign_name: campaignMap[l.id] || null,
        lista_madre_id: l.lista_madre_id || null,
        has_children: parentIds.has(l.id),
        notes: l.notes || null,
      })) as ContactList[];
    },
  });

  const createList = useMutation({
    mutationFn: async (input: { nombre: string; descripcion?: string; sector?: string; tipo?: ContactListTipo }) => {
      const { data, error } = await supabase
        .from(TB_LISTS)
        .insert({ name: input.nombre, description: input.descripcion || null, sector: input.sector || null, tipo: input.tipo || 'outbound', origen: 'manual', estado: 'borrador' })
        .select('id')
        .single();
      if (error) throw error;
      return data as unknown as { id: string };
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contact-lists'] }); toast.success('Lista creada'); },
    onError: (e: Error) => toast.error('Error al crear lista', { description: e.message }),
  });

  const updateList = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from(TB_LISTS).update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contact-lists'] }); },
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
        .insert({ name: `${(original as any).name} (copia)`, description: (original as any).description, sector: (original as any).sector, origen: (original as any).origen, estado: 'borrador' })
        .select('id')
        .single();
      if (createErr || !newList) throw createErr || new Error('Error al duplicar');

      const companies = await fetchAllRows((from, to) =>
        supabase.from(TB_COMPANIES).select('*').eq('list_id', id).range(from, to)
      );
      if (companies.length > 0) {
        const copies = (companies as any[]).map(({ id: _, list_id, created_at, ...rest }) => ({ ...rest, list_id: (newList as any).id }));
        // Insert in batches of 100
        for (let i = 0; i < copies.length; i += 100) {
          const { error: insertErr } = await supabase.from(TB_COMPANIES).insert(copies.slice(i, i + 100));
          if (insertErr) throw insertErr;
        }
      }

      return newList as unknown as { id: string };
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contact-lists'] }); toast.success('Lista duplicada'); },
    onError: (e: Error) => toast.error('Error', { description: e.message }),
  });

  return { lists, isLoading, createList, updateList, deleteList, duplicateList };
};

// ===== LIST COMPANIES =====
export const useContactListCompanies = (listId: string | undefined, madreListId?: string | null) => {
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['contact-list-companies', listId],
    enabled: !!listId,
    queryFn: async () => {
      const data = await fetchAllRows<ContactListCompany>((from, to) =>
        supabase.from(TB_COMPANIES).select('*').eq('list_id', listId!).is('deleted_at', null).order('created_at', { ascending: false }).order('id').range(from, to)
      );
      return data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['contact-list-companies', listId] });
    queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
    // Si esta lista es sublista, invalidar cache de la madre
    if (madreListId) {
      queryClient.invalidateQueries({ queryKey: ['sublist-company-map', madreListId] });
      queryClient.invalidateQueries({ queryKey: ['contact-list-companies', madreListId] });
    }
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
    mutationFn: async ({ rows, onProgress }: { rows: Omit<ContactListCompany, 'id' | 'created_at'>[]; onProgress?: (done: number, total: number) => void }): Promise<{ inserted: number; failed: number; errors: Array<{ startIndex: number; count: number; message: string }> }> => {
      const BATCH_SIZE = 20;
      const SUB_BATCH_SIZE = 5;
      const DELAY_MS = 150;
      const total = rows.length;
      let inserted = 0;
      let failed = 0;
      const errors: Array<{ startIndex: number; count: number; message: string }> = [];

      const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from(TB_COMPANIES).insert(batch);

        if (error) {
          // Retry with smaller sub-batches
          for (let j = 0; j < batch.length; j += SUB_BATCH_SIZE) {
            const sub = batch.slice(j, j + SUB_BATCH_SIZE);
            const { error: subErr } = await supabase.from(TB_COMPANIES).insert(sub);
            if (subErr) {
              // Fallback: try each row individually so one bad row doesn't block the rest
              for (let k = 0; k < sub.length; k++) {
                const { error: rowErr } = await supabase.from(TB_COMPANIES).insert([sub[k]]);
                if (rowErr) {
                  const empresa = (sub[k] as any).empresa || '?';
                  console.error(`[Import] Row error (${empresa}):`, rowErr.message);
                  failed += 1;
                  errors.push({ startIndex: i + j + k, count: 1, message: `${empresa}: ${rowErr.message}` });
                } else {
                  inserted += 1;
                }
              }
            } else {
              inserted += sub.length;
            }
          }
        } else {
          inserted += batch.length;
        }

        onProgress?.(inserted + failed, total);

        // Pause between batches to avoid overwhelming the DB
        if (i + BATCH_SIZE < total) {
          await delay(DELAY_MS);
        }
      }

      return { inserted, failed, errors };
    },
    onSuccess: (result) => {
      invalidate();
      if (result.failed === 0) {
        toast.success(`${result.inserted} empresas importadas correctamente`);
      } else {
        toast.warning(`Importación parcial: ${result.inserted} insertadas, ${result.failed} con error`, { duration: 8000 });
      }
    },
    onError: (e: Error) => toast.error('Error en importación', { description: e.message }),
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
      const { error } = await supabase.from(TB_COMPANIES).update({ deleted_at: new Date().toISOString() } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Empresa eliminada del listado'); },
    onError: (e: Error) => toast.error('Error', { description: e.message }),
  });

  const deleteCompanies = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from(TB_COMPANIES).update({ deleted_at: new Date().toISOString() } as any).in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Empresas eliminadas del listado'); },
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
      return data as unknown as ContactListCampaign[];
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
      const { data: lists } = await supabase.from(TB_LISTS).select('id, name').in('id', listIds);
      const listMap: Record<string, string> = {};
      (lists || []).forEach((l: any) => { listMap[l.id] = l.name; });

      return (data || []).map((d: any) => ({
        lista: listMap[d.list_id] || 'Desconocida',
        fecha: d.created_at,
      })).sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    },
  });
};
