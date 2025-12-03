// =============================================
// HOOK: useProfessionalValuations
// CRUD y operaciones para Valoraciones Pro
// =============================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ProfessionalValuationData,
  mapDbToProfessionalValuation,
  mapProfessionalValuationToDb,
} from '@/types/professionalValuation';

const QUERY_KEY = 'professional-valuations';

/**
 * Sincroniza los datos del cliente a contact_leads con deduplicación por email
 */
async function syncToContactLeads(data: Partial<ProfessionalValuationData>): Promise<string | null> {
  if (!data.clientEmail) return null;

  // Buscar contacto existente por email (deduplicación)
  const { data: existingContact } = await supabase
    .from('contact_leads')
    .select('id')
    .eq('email', data.clientEmail)
    .or('is_deleted.is.null,is_deleted.eq.false')
    .maybeSingle();

  if (existingContact) {
    // Contacto ya existe, retornar su ID para vincular
    console.log('Contact already exists, linking to:', existingContact.id);
    return existingContact.id;
  }

  // Crear nuevo contacto
  const contactData = {
    full_name: data.clientName || 'Sin nombre',
    company: data.clientCompany || 'Sin empresa',
    email: data.clientEmail,
    phone: data.clientPhone || null,
    service_type: data.serviceType || 'vender',
    referral: 'Valoración Pro',
    status: 'new',
  };

  const { data: newContact, error } = await supabase
    .from('contact_leads')
    .insert([contactData])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating contact lead:', error);
    throw error;
  }

  console.log('New contact created:', newContact.id);
  return newContact.id;
}

/**
 * Hook principal para gestionar valoraciones profesionales
 */
export function useProfessionalValuations() {
  const queryClient = useQueryClient();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Obtener todas las valoraciones
  const {
    data: valuations,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_valuations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapDbToProfessionalValuation);
    },
  });

  // Obtener una valoración por ID
  const getValuationById = async (id: string): Promise<ProfessionalValuationData | null> => {
    const { data, error } = await supabase
      .from('professional_valuations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching valuation:', error);
      return null;
    }

    return mapDbToProfessionalValuation(data);
  };

  // Crear nueva valoración
  const createMutation = useMutation({
    mutationFn: async (data: Partial<ProfessionalValuationData>) => {
      const dbData = mapProfessionalValuationToDb(data);
      
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        dbData.created_by = user.id;
      }

      // Si syncToContacts está activo, crear/vincular contacto primero
      if (data.syncToContacts !== false && data.clientEmail) {
        try {
          const linkedLeadId = await syncToContactLeads(data);
          if (linkedLeadId) {
            dbData.linked_lead_id = linkedLeadId;
            dbData.linked_lead_type = 'contact';
          }
        } catch (syncError) {
          console.error('Error syncing to contacts:', syncError);
          // Continuar con la creación aunque falle el sync
        }
      }

      const { data: result, error } = await supabase
        .from('professional_valuations')
        .insert([dbData] as any)
        .select()
        .single();

      if (error) throw error;
      return mapDbToProfessionalValuation(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Valoración creada correctamente');
    },
    onError: (error: Error) => {
      console.error('Error creating valuation:', error);
      toast.error('Error al crear la valoración');
    },
  });

  // Actualizar valoración existente
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProfessionalValuationData> }) => {
      const dbData = mapProfessionalValuationToDb(data);

      const { data: result, error } = await supabase
        .from('professional_valuations')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapDbToProfessionalValuation(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Valoración actualizada');
    },
    onError: (error: Error) => {
      console.error('Error updating valuation:', error);
      toast.error('Error al actualizar la valoración');
    },
  });

  // Eliminar valoración
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('professional_valuations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Valoración eliminada');
    },
    onError: (error: Error) => {
      console.error('Error deleting valuation:', error);
      toast.error('Error al eliminar la valoración');
    },
  });

  // Duplicar valoración (crear nueva versión)
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      // Obtener valoración original
      const original = await getValuationById(id);
      if (!original) throw new Error('Valoración no encontrada');

      // Crear copia
      const copyData: Partial<ProfessionalValuationData> = {
        ...original,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        status: 'draft',
        pdfUrl: undefined,
        sentAt: undefined,
        sentTo: undefined,
        emailOpened: false,
        emailOpenedAt: undefined,
        version: (original.version || 1) + 1,
        parentId: original.id,
      };

      const dbData = mapProfessionalValuationToDb(copyData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        dbData.created_by = user.id;
      }

      const { data: result, error } = await supabase
        .from('professional_valuations')
        .insert([dbData] as any)
        .select()
        .single();

      if (error) throw error;
      return mapDbToProfessionalValuation(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Valoración duplicada');
    },
    onError: (error: Error) => {
      console.error('Error duplicating valuation:', error);
      toast.error('Error al duplicar la valoración');
    },
  });

  // Actualizar estado
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProfessionalValuationData['status'] }) => {
      const { error } = await supabase
        .from('professional_valuations')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // Guardar URL del PDF
  const savePdfUrl = async (id: string, pdfUrl: string) => {
    const { error } = await supabase
      .from('professional_valuations')
      .update({ pdf_url: pdfUrl, status: 'generated' })
      .eq('id', id);

    if (error) {
      console.error('Error saving PDF URL:', error);
      throw error;
    }

    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
  };

  // Marcar como enviado
  const markAsSent = async (id: string, email: string) => {
    const { error } = await supabase
      .from('professional_valuations')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_to: email,
      })
      .eq('id', id);

    if (error) {
      console.error('Error marking as sent:', error);
      throw error;
    }

    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    toast.success('Valoración enviada correctamente');
  };

  return {
    // Data
    valuations: valuations || [],
    isLoading,
    error,

    // Queries
    refetch,
    getValuationById,

    // Mutations
    createValuation: createMutation.mutateAsync,
    updateValuation: updateMutation.mutateAsync,
    deleteValuation: deleteMutation.mutateAsync,
    duplicateValuation: duplicateMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,

    // PDF
    isGeneratingPdf,
    setIsGeneratingPdf,
    savePdfUrl,

    // Email
    markAsSent,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
  };
}

/**
 * Hook para obtener una valoración específica
 */
export function useProfessionalValuation(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('professional_valuations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return mapDbToProfessionalValuation(data);
    },
    enabled: !!id,
  });
}

/**
 * Hook para estadísticas de valoraciones
 */
export function useProfessionalValuationStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_valuations')
        .select('status, valuation_central, created_at');

      if (error) throw error;

      const stats = {
        total: data.length,
        drafts: data.filter(v => v.status === 'draft').length,
        generated: data.filter(v => v.status === 'generated').length,
        sent: data.filter(v => v.status === 'sent').length,
        viewed: data.filter(v => v.status === 'viewed').length,
        totalValuation: data.reduce((sum, v) => sum + (v.valuation_central || 0), 0),
        avgValuation: data.length > 0 
          ? data.reduce((sum, v) => sum + (v.valuation_central || 0), 0) / data.length 
          : 0,
      };

      return stats;
    },
  });
}
