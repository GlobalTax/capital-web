import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Statistic {
  id: string;
  metric_key: string;
  metric_value: string;
  metric_label: string;
  display_order: number;
  is_active: boolean;
  display_locations: string[];
}

export const useStatistics = (location?: string) => {
  return useQuery({
    queryKey: ['statistics', location],
    queryFn: async () => {
      console.log('🔍 Fetching statistics for location:', location);
      
      try {
        let query = supabase
          .from('key_statistics')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        // Filter by location if provided - simplified approach
        if (location) {
          console.log('📍 Filtering by location:', location);
          // Use a more robust filtering approach
          query = query.or(`display_locations.cs.{${location}},display_locations.is.null`);
        }

        const { data, error } = await query;
        
        console.log('📊 Statistics query result:', { data, error, location });

        if (error) {
          console.error('❌ Error fetching statistics:', error);
          // Don't throw error immediately, try fallback
          console.log('🔄 Trying fallback query without location filter...');
          
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('key_statistics')
            .select('*')
            .eq('is_active', true)
            .order('display_order');
            
          if (fallbackError) {
            console.error('❌ Fallback query also failed:', fallbackError);
            throw fallbackError;
          }
          
          console.log('✅ Fallback query successful:', fallbackData);
          return (fallbackData || []) as Statistic[];
        }

        return (data || []) as Statistic[];
      } catch (err) {
        console.error('💥 Statistics fetch completely failed:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Helper function to extract numeric value from metric_value for animations
export const extractNumericValue = (value: string): number => {
  // Extract number from strings like "100+", "€900M", "98.7%", "25+"
  const numericMatch = value.match(/[\d,]+\.?\d*/);
  if (!numericMatch) return 0;
  
  const numStr = numericMatch[0].replace(/,/g, '');
  let num = parseFloat(numStr);
  
  // Handle different scales
  if (value.includes('M')) {
    // For display in millions context, convert to actual number
    // 900M should animate to 900 for "M" suffix display, or 5 for "B+" display
    if (value.includes('€900M')) {
      // Special case: show as 5B+ in some contexts, 900M in others
      return 900; // Will be handled by component
    }
    return num;
  }
  
  return num;
};

// Helper function to get suffix from metric_value
export const extractSuffix = (value: string): string => {
  if (value.includes('%')) return '%';
  if (value.includes('+')) return '+';
  if (value.includes('M')) return 'M';
  if (value.includes('B')) return 'B+';
  return '';
};