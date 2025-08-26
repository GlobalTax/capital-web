import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RegistrationRequest {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at?: string;
  processed_by?: string;
  rejection_reason?: string;
  user_agent?: string;
  ip_address?: string;
}

export const useRegistrationRequests = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRequests = async () => {
    if (isLoading) return; // Prevent concurrent calls
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_registration_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRequests(data as RegistrationRequest[] || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching registration requests:', err);
      setError('Error al cargar las solicitudes de registro');
    } finally {
      setIsLoading(false);
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.rpc('approve_user_registration', {
        request_id: requestId
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Solicitud aprobada",
        description: "El usuario ha sido aprobado y puede acceder al sistema",
      });

      await fetchRequests();
    } catch (err: any) {
      console.error('Error approving request:', err);
      toast({
        title: "Error",
        description: err.message || "Error al aprobar la solicitud",
        variant: "destructive",
      });
    }
  };

  const rejectRequest = async (requestId: string, reason?: string) => {
    try {
      const { error } = await supabase.rpc('reject_user_registration', {
        request_id: requestId,
        reason: reason
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Solicitud rechazada",
        description: "El usuario ha sido notificado del rechazo",
      });

      await fetchRequests();
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      toast({
        title: "Error",
        description: err.message || "Error al rechazar la solicitud",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    isLoading,
    error,
    fetchRequests,
    approveRequest,
    rejectRequest,
  };
};