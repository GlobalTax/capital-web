import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CaseStudy {
  id: string;
  title: string;
  sector: string;
  company_size?: string;
  value_amount?: number;
  value_currency: string;
  description: string;
  highlights?: string[];
  year?: number;
  is_featured: boolean;
  is_active: boolean;
  is_value_confidential?: boolean;
  created_at: string;
  updated_at: string;
  featured_image_url?: string;
  logo_url?: string;
}

export const useCaseStudies = () => {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredCases, setFilteredCases] = useState<CaseStudy[]>([]);
  const { toast } = useToast();

  const fetchCaseStudies = async (featuredOnly = false) => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('case_studies')
        .select('*')
        .eq('is_active', true);
      
      if (featuredOnly) {
        query = query.eq('is_featured', true);
      }
      
      const { data, error } = await query
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .order('year', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const cases = data || [];
      setCaseStudies(cases);
      setFilteredCases(cases);
    } catch (error) {
      console.error('Error fetching case studies:', error);
      toast({
        title: "Error",
        description: "Error al cargar los casos de éxito.",
        variant: "destructive",
      });
      setCaseStudies([]);
      setFilteredCases([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCaseStudies = (filters: {
    sector?: string;
    year?: number;
    search?: string;
    featured?: boolean;
  }) => {
    let filtered = [...caseStudies];

    if (filters.sector) {
      filtered = filtered.filter(case_ => 
        case_.sector.toLowerCase().includes(filters.sector!.toLowerCase())
      );
    }

    if (filters.year) {
      filtered = filtered.filter(case_ => case_.year === filters.year);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(case_ => 
        case_.title.toLowerCase().includes(searchTerm) ||
        case_.description.toLowerCase().includes(searchTerm) ||
        case_.sector.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.featured !== undefined) {
      filtered = filtered.filter(case_ => case_.is_featured === filters.featured);
    }

    setFilteredCases(filtered);
  };

  const getUniqueSectors = () => {
    return [...new Set(caseStudies.map(case_ => case_.sector))].sort();
  };

  const getUniqueYears = () => {
    return [...new Set(caseStudies.map(case_ => case_.year).filter(Boolean))].sort((a, b) => b! - a!);
  };

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  return {
    caseStudies,
    filteredCases,
    isLoading,
    fetchCaseStudies,
    filterCaseStudies,
    getUniqueSectors,
    getUniqueYears,
  };
};