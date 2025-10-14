import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VersionStats {
  totalDownloads: number;
  downloadsLast7Days: number;
  downloadsLast30Days: number;
  avgDownloadsPerDay: number;
  totalLeads: number;
  leadsWithEmailOpened: number;
  emailOpenRate: number;
  avgLeadScore: number;
  highScoreLeads: number;
  daysActive: number;
  totalDaysInCatalog: number;
  formatPreference: { pdf: number; excel: number };
}

export const useRODVersionStats = (documentId: string) => {
  return useQuery({
    queryKey: ['rod-version-stats', documentId],
    queryFn: async () => {
      // Get document info
      const { data: document, error: docError } = await supabase
        .from('rod_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (docError) throw docError;

      // Get leads associated with this document
      const { data: leads, error: leadsError } = await supabase
        .from('investor_leads')
        .select('*')
        .eq('rod_document_id', documentId);

      if (leadsError) throw leadsError;

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const createdAt = new Date(document.created_at);
      const activatedAt = document.activated_at ? new Date(document.activated_at) : null;
      const deactivatedAt = document.deactivated_at ? new Date(document.deactivated_at) : null;

      // Calculate stats
      const totalLeads = leads?.length || 0;
      const leadsWithEmailOpened = leads?.filter(l => l.email_opened).length || 0;
      const leadScores = leads?.map(l => l.lead_score || 0).filter(s => s > 0) || [];
      const avgLeadScore = leadScores.length > 0 
        ? leadScores.reduce((sum, score) => sum + score, 0) / leadScores.length 
        : 0;
      const highScoreLeads = leadScores.filter(s => s > 70).length;

      const totalDaysInCatalog = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const daysActive = activatedAt && deactivatedAt
        ? Math.floor((deactivatedAt.getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24))
        : activatedAt
        ? Math.floor((now.getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const avgDownloadsPerDay = daysActive > 0 
        ? document.total_downloads / daysActive 
        : 0;

      const stats: VersionStats = {
        totalDownloads: document.total_downloads || 0,
        downloadsLast7Days: 0, // Would need download tracking table
        downloadsLast30Days: 0, // Would need download tracking table
        avgDownloadsPerDay: Math.round(avgDownloadsPerDay * 100) / 100,
        totalLeads,
        leadsWithEmailOpened,
        emailOpenRate: totalLeads > 0 ? Math.round((leadsWithEmailOpened / totalLeads) * 100) : 0,
        avgLeadScore: Math.round(avgLeadScore),
        highScoreLeads,
        daysActive,
        totalDaysInCatalog,
        formatPreference: {
          pdf: document.file_type === 'pdf' ? document.total_downloads : 0,
          excel: document.file_type === 'excel' ? document.total_downloads : 0
        }
      };

      return stats;
    },
    enabled: !!documentId
  });
};
