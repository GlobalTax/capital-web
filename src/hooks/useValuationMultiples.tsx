
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ValuationMultiple {
  id: string;
  sector_name: string;
  multiple_range: string;
  median_multiple: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export const useValuationMultiples = () => {
  const [multiples, setMultiples] = useState<ValuationMultiple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMultiples();
  }, []);

  const fetchMultiples = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sector_valuation_multiples')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('Error fetching multiples:', error);
        setError('Error al cargar los múltiplos');
        return;
      }

      setMultiples(data || []);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar los múltiplos');
    } finally {
      setIsLoading(false);
    }
  };

  const getMultipleBySector = (sector: string): ValuationMultiple | null => {
    return multiples.find(
      m => m.sector_name.toLowerCase() === sector.toLowerCase()
    ) || null;
  };

  const getDefaultMultiple = (): number => {
    // Si no hay múltiplos en la base de datos, usar un valor por defecto
    if (multiples.length === 0) return 5.0;
    
    // Intentar extraer el número de la mediana del primer múltiplo
    const firstMultiple = multiples[0];
    const medianValue = parseFloat(firstMultiple.median_multiple.replace(/[^\d.]/g, ''));
    return isNaN(medianValue) ? 5.0 : medianValue;
  };

  return {
    multiples,
    isLoading,
    error,
    getMultipleBySector,
    getDefaultMultiple,
    refetch: fetchMultiples
  };
};
