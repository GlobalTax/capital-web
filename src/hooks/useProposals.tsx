import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FeeProposal, FeeTemplate, ProposalSection, CreateProposalData, ProposalStats } from '@/types/proposals';
import { useToast } from '@/hooks/use-toast';

export const useProposals = () => {
  const [proposals, setProposals] = useState<FeeProposal[]>([]);
  const [templates, setTemplates] = useState<FeeTemplate[]>([]);
  const [sections, setSections] = useState<ProposalSection[]>([]);
  const [stats, setStats] = useState<ProposalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all proposals
  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data as FeeProposal[] || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las propuestas",
        variant: "destructive"
      });
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_templates')
        .select('*')
        .eq('is_active', true)
        .order('service_type');

      if (error) throw error;
      setTemplates(data as FeeTemplate[] || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  // Fetch sections
  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('proposal_sections')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  // Calculate stats
  const calculateStats = async () => {
    try {
      const { data: proposalsData, error } = await supabase
        .from('fee_proposals')
        .select('status, estimated_fee, created_at, viewed_at, approved_at');

      if (error) throw error;

      const proposals = proposalsData || [];
      const total = proposals.length;
      const sent = proposals.filter(p => ['sent', 'viewed', 'approved', 'rejected'].includes(p.status)).length;
      const viewed = proposals.filter(p => p.viewed_at).length;
      const approved = proposals.filter(p => p.status === 'approved').length;
      const totalValue = proposals
        .filter(p => p.status === 'approved' && p.estimated_fee)
        .reduce((sum, p) => sum + (p.estimated_fee || 0), 0);

      const conversionRate = sent > 0 ? (approved / sent) * 100 : 0;

      // Calculate average response time (from sent to approved)
      const approvedWithTimes = proposals.filter(p => p.approved_at && p.created_at);
      const avgResponseTime = approvedWithTimes.length > 0 
        ? approvedWithTimes.reduce((sum, p) => {
            const created = new Date(p.created_at).getTime();
            const approved = new Date(p.approved_at!).getTime();
            return sum + (approved - created);
          }, 0) / approvedWithTimes.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      setStats({
        total_proposals: total,
        sent_proposals: sent,
        viewed_proposals: viewed,
        approved_proposals: approved,
        total_value: totalValue,
        conversion_rate: conversionRate,
        avg_response_time: avgResponseTime
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  // Create new proposal
  const createProposal = async (data: CreateProposalData): Promise<FeeProposal | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const proposalData = {
        ...data,
        created_by: user.id,
        status: 'draft' as const
      };

      const { data: newProposal, error } = await supabase
        .from('fee_proposals')
        .insert(proposalData as any)
        .select()
        .single();

      if (error) throw error;

      await fetchProposals();
      await calculateStats();

      toast({
        title: "Éxito",
        description: "Propuesta creada correctamente"
      });

      return newProposal as FeeProposal;
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la propuesta",
        variant: "destructive"
      });
      return null;
    }
  };

  // Update proposal
  const updateProposal = async (id: string, data: Partial<FeeProposal>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('fee_proposals')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await fetchProposals();
      await calculateStats();

      toast({
        title: "Éxito",
        description: "Propuesta actualizada correctamente"
      });

      return true;
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la propuesta",
        variant: "destructive"
      });
      return false;
    }
  };

  // Send proposal
  const sendProposal = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('fee_proposals')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchProposals();
      await calculateStats();

      toast({
        title: "Éxito",
        description: "Propuesta enviada correctamente"
      });

      return true;
    } catch (error) {
      console.error('Error sending proposal:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la propuesta",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete proposal
  const deleteProposal = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('fee_proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProposals();
      await calculateStats();

      toast({
        title: "Éxito",
        description: "Propuesta eliminada correctamente"
      });

      return true;
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la propuesta",
        variant: "destructive"
      });
      return false;
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchProposals(),
        fetchTemplates(),
        fetchSections(),
        calculateStats()
      ]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  return {
    proposals,
    templates,
    sections,
    stats,
    isLoading,
    createProposal,
    updateProposal,
    sendProposal,
    deleteProposal,
    refetch: () => {
      fetchProposals();
      calculateStats();
    }
  };
};