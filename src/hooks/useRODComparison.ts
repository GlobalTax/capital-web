import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VersionStats } from './useRODVersionStats';

export interface ComparisonData {
  documentId: string;
  version: string;
  title: string;
  stats: VersionStats;
}

export const useRODComparison = (documentIds: string[]) => {
  return useQuery({
    queryKey: ['rod-comparison', documentIds],
    queryFn: async () => {
      if (documentIds.length === 0) return [];

      const comparisons: ComparisonData[] = [];

      for (const docId of documentIds) {
        // Get document
        const { data: document, error: docError } = await supabase
          .from('rod_documents')
          .select('*')
          .eq('id', docId)
          .single();

        if (docError) continue;

        // Get leads
        const { data: leads } = await supabase
          .from('investor_leads')
          .select('*')
          .eq('rod_document_id', docId);

        const now = new Date();
        const createdAt = new Date(document.created_at);
        const activatedAt = document.activated_at ? new Date(document.activated_at) : null;
        const deactivatedAt = document.deactivated_at ? new Date(document.deactivated_at) : null;

        const totalLeads = leads?.length || 0;
        const leadsWithEmailOpened = leads?.filter(l => l.email_opened).length || 0;
        const leadScores = leads?.map(l => l.lead_score || 0).filter(s => s > 0) || [];
        const avgLeadScore = leadScores.length > 0 
          ? leadScores.reduce((sum, score) => sum + score, 0) / leadScores.length 
          : 0;

        const totalDaysInCatalog = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const daysActive = activatedAt && deactivatedAt
          ? Math.floor((deactivatedAt.getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24))
          : activatedAt
          ? Math.floor((now.getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        const stats: VersionStats = {
          totalDownloads: document.total_downloads || 0,
          downloadsLast7Days: 0,
          downloadsLast30Days: 0,
          avgDownloadsPerDay: daysActive > 0 ? document.total_downloads / daysActive : 0,
          totalLeads,
          leadsWithEmailOpened,
          emailOpenRate: totalLeads > 0 ? Math.round((leadsWithEmailOpened / totalLeads) * 100) : 0,
          avgLeadScore: Math.round(avgLeadScore),
          highScoreLeads: leadScores.filter(s => s > 70).length,
          daysActive,
          totalDaysInCatalog,
          formatPreference: {
            pdf: document.file_type === 'pdf' ? document.total_downloads : 0,
            excel: document.file_type === 'excel' ? document.total_downloads : 0
          }
        };

        comparisons.push({
          documentId: docId,
          version: document.version,
          title: document.title,
          stats
        });
      }

      return comparisons;
    },
    enabled: documentIds.length > 0
  });
};
