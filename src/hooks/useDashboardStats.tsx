
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  caseStudies: number;
  operations: number;
  blogPosts: number;
  testimonials: number;
  teamMembers: number;
  statistics: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    caseStudies: 0,
    operations: 0,
    blogPosts: 0,
    testimonials: 0,
    teamMembers: 0,
    statistics: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      const [
        caseStudiesResult,
        operationsResult,
        blogPostsResult,
        testimonialsResult,
        teamMembersResult,
        statisticsResult
      ] = await Promise.all([
        supabase.from('case_studies').select('id', { count: 'exact' }),
        supabase.from('company_operations').select('id', { count: 'exact' }),
        (supabase as any).from('blog_posts').select('id', { count: 'exact' }),
        supabase.from('testimonials').select('id', { count: 'exact' }),
        supabase.from('team_members').select('id', { count: 'exact' }),
        supabase.from('key_statistics').select('id', { count: 'exact' })
      ]);

      setStats({
        caseStudies: caseStudiesResult.count || 0,
        operations: operationsResult.count || 0,
        blogPosts: blogPostsResult.count || 0,
        testimonials: testimonialsResult.count || 0,
        teamMembers: teamMembersResult.count || 0,
        statistics: statisticsResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { stats, isLoading, refetch: fetchStats };
};
