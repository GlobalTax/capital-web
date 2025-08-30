import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBlogCategories = () => {
  const { data: existingCategories = [], isLoading } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('category')
        .not('category', 'is', null)
        .order('category');
      
      if (error) throw error;
      
      // Get unique categories from existing posts
      const uniqueCategories = [...new Set(data?.map(post => post.category) || [])];
      return uniqueCategories.filter(Boolean);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Common predefined categories that should always be available
  const predefinedCategories = ['M&A', 'Valoración', 'Due Diligence', 'Análisis', 'Estrategia', 'Financiación', 'Legal', 'Fiscal'];
  
  // Combine and deduplicate categories
  const allCategories = [...new Set([...predefinedCategories, ...existingCategories])];

  return {
    categories: allCategories,
    existingCategories,
    predefinedCategories,
    isLoading
  };
};