
import { subMonths, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { DateRange, ContentAnalytics, BlogPost } from '@/types/dashboard';

export const fetchContentMetrics = async (dateRange: DateRange): Promise<ContentAnalytics[]> => {
  const { data, error } = await supabase
    .from('content_analytics')
    .select('*')
    .gte('period_date', format(dateRange.start, 'yyyy-MM-dd'))
    .lte('period_date', format(dateRange.end, 'yyyy-MM-dd'))
    .order('period_date', { ascending: false });

  if (error) {
    console.error('Error fetching content metrics:', error);
    return [];
  }

  return data || [];
};

export const fetchHistoricalContentMetrics = async (): Promise<ContentAnalytics[]> => {
  const endDate = new Date();
  const startDate = subMonths(endDate, 6);
  
  const { data, error } = await supabase
    .from('content_analytics')
    .select('*')
    .gte('period_date', format(startDate, 'yyyy-MM-dd'))
    .lte('period_date', format(endDate, 'yyyy-MM-dd'))
    .order('period_date', { ascending: true });

  if (error) {
    console.error('Error fetching historical content metrics:', error);
    return [];
  }

  return data || [];
};

export const fetchTopPerformingPosts = async (): Promise<BlogPost[]> => {
  const { data: contentData, error: contentError } = await supabase
    .from('content_analytics')
    .select(`
      blog_post_id,
      page_views,
      engagement_score,
      blog_posts (
        id,
        title,
        slug
      )
    `)
    .not('blog_post_id', 'is', null)
    .order('page_views', { ascending: false })
    .limit(5);

  if (contentError) {
    console.error('Error fetching top performing posts:', contentError);
    return [];
  }

  return contentData?.map(item => ({
    id: item.blog_post_id!,
    title: (item.blog_posts as any)?.title || 'Unknown',
    slug: (item.blog_posts as any)?.slug || '',
    views: item.page_views,
    engagement_score: item.engagement_score
  })) || [];
};
