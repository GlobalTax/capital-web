import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TimelineNode {
  id: string;
  version: string;
  title: string;
  createdAt: Date;
  activatedAt: Date | null;
  deactivatedAt: Date | null;
  isActive: boolean;
  totalDownloads: number;
  daysActive: number;
}

export const useRODTimeline = () => {
  return useQuery({
    queryKey: ['rod-timeline'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rod_documents')
        .select('id, version, title, created_at, activated_at, deactivated_at, is_active, total_downloads')
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const timeline: TimelineNode[] = data.map(doc => {
        const createdAt = new Date(doc.created_at);
        const activatedAt = doc.activated_at ? new Date(doc.activated_at) : null;
        const deactivatedAt = doc.deactivated_at ? new Date(doc.deactivated_at) : null;
        
        const daysActive = activatedAt && deactivatedAt
          ? Math.floor((deactivatedAt.getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24))
          : activatedAt
          ? Math.floor((new Date().getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          id: doc.id,
          version: doc.version,
          title: doc.title,
          createdAt,
          activatedAt,
          deactivatedAt,
          isActive: doc.is_active,
          totalDownloads: doc.total_downloads || 0,
          daysActive
        };
      });

      return timeline;
    }
  });
};
