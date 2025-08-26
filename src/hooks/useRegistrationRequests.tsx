import { useRegistrationRequestsQuery, useApproveRegistrationMutation, useRejectRegistrationMutation } from '@/services/auth-queries.service';

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
  // Use centralized query
  const { data: requests = [], isLoading, error, refetch: fetchRequests } = useRegistrationRequestsQuery();
  const approveRequestMutation = useApproveRegistrationMutation();
  const rejectRequestMutation = useRejectRegistrationMutation();

  const approveRequest = async (requestId: string) => {
    await approveRequestMutation.mutateAsync(requestId);
  };

  const rejectRequest = async (requestId: string, reason?: string) => {
    await rejectRequestMutation.mutateAsync({ requestId, reason });
  };

  return {
    requests,
    isLoading,
    error: error?.message || null,
    fetchRequests,
    approveRequest,
    rejectRequest,
  };
};