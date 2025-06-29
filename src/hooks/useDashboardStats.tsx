
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  caseStudies: number;
  operations: number;
  blogPosts: number;
  testimonials: number;
  teamMembers: number;
  statistics: number;
  valuations: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    caseStudies: 0,
    operations: 0,
    blogPosts: 0,
    testimonials: 0,
    teamMembers: 0,
    statistics: 0,
    valuations: 0,
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
        statisticsResult,
        valuationsResult
      ] = await Promise.all([
        supabase.from('case_studies').select('id', { count: 'exact' }).then(res => res.count || 0),
        supabase.from('company_operations').select('id', { count: 'exact' }).then(res => res.count || 0),
        supabase.from('blog_posts').select('id', { count: 'exact' }).then(res => res.count || 0),
        supabase.from('testimonials').select('id', { count: 'exact' }).then(res => res.count || 0),
        supabase.from('team_members').select('id', { count: 'exact' }).then(res => res.count || 0),
        supabase.from('key_statistics').select('id', { count: 'exact' }).then(res => res.count || 0),
        supabase.from('company_valuations').select('id', { count: 'exact' }).then(res => res.count || 0)
      ]);

      setStats({
        caseStudies: caseStudiesResult,
        operations: operationsResult,
        blogPosts: blogPostsResult,
        testimonials: testimonialsResult,
        teamMembers: teamMembersResult,
        statistics: statisticsResult,
        valuations: valuationsResult,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Mantener stats en 0 en caso de error
      setStats({
        caseStudies: 0,
        operations: 0,
        blogPosts: 0,
        testimonials: 0,
        teamMembers: 0,
        statistics: 0,
        valuations: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { stats, isLoading, refetch: fetchStats };
};
