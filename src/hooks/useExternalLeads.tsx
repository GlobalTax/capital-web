
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ExternalLeadType = 'contact' | 'collaborator' | 'lead_magnet_download' | 'company_valuation' | 'valuation_pdf' | string;

export interface ExternalLead {
  id?: string;
  lead_type?: ExternalLeadType;
  full_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  source?: string;
  created_at?: string;
  // Attribution
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  referrer?: string | null;
  // Valuation specific
  final_valuation?: number | null;
  ebitda?: number | null;
  revenue?: number | null;
  industry?: string | null;
  // Collaborator specific
  profession?: string | null;
  experience?: string | null;
  motivation?: string | null;
  // Misc
  [key: string]: any;
}

export const useExternalLeads = () => {
  const [leads, setLeads] = useState<ExternalLead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Nota: La tabla 'leads' no existe en este esquema.
      // Usar tablas existentes para consolidar leads.
      const { data, error } = await supabase
        .from('contact_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      setLeads(data as ExternalLead[]);
    } catch (e: any) {
      console.error('Error cargando leads externos:', e);
      setError(e?.message || 'Error desconocido');
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los leads externos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const stats = useMemo(() => {
    const total = leads.length;
    const byType = leads.reduce<Record<string, number>>((acc, l) => {
      const t = l.lead_type || 'desconocido';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    return { total, byType };
  }, [leads]);

  return { leads, isLoading, error, stats, refetch: fetchLeads };
};
