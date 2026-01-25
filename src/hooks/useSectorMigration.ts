import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompanyMigrationDetail {
  id: string;
  name: string;
  originalSector: string | null;
  newSectorPe: string | null;
  method: 'direct' | 'ai' | 'skipped' | 'error';
  confidence?: number;
  error?: string;
}

interface FundMigrationDetail {
  id: string;
  name: string;
  originalSectors: string[];
  newSectorsPe: string[];
  method: 'direct' | 'skipped' | 'error';
  error?: string;
}

interface CRPortfolioMigrationDetail {
  id: string;
  name: string;
  originalSector: string | null;
  newSectorPe: string | null;
  method: 'direct' | 'ai' | 'skipped' | 'error';
  confidence?: number;
  error?: string;
}

interface MigrationResult {
  companiesProcessed: number;
  companiesMigrated: number;
  companiesSkipped: number;
  companiesErrors: number;
  fundsProcessed: number;
  fundsMigrated: number;
  fundsSkipped: number;
  fundsErrors: number;
  crPortfolioProcessed: number;
  crPortfolioMigrated: number;
  crPortfolioSkipped: number;
  crPortfolioErrors: number;
  details: {
    companies: CompanyMigrationDetail[];
    funds: FundMigrationDetail[];
    crPortfolio: CRPortfolioMigrationDetail[];
  };
}

interface MigrationResponse {
  success: boolean;
  mode: 'preview' | 'execute';
  result: MigrationResult;
  sectorDistribution: Record<string, number>;
  summary: {
    companies: string;
    funds: string;
    crPortfolio: string;
  };
  error?: string;
}

export const useSectorMigration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<MigrationResponse | null>(null);
  const [executeResult, setExecuteResult] = useState<MigrationResponse | null>(null);
  const { toast } = useToast();

  const previewMigration = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('migrate-sectors-to-pe', {
        body: { mode: 'preview' },
      });

      if (error) throw error;

      setPreviewResult(data as MigrationResponse);
      toast({
        title: 'Vista previa completada',
        description: data.summary?.companies || 'Migración simulada correctamente',
      });
      return data as MigrationResponse;
    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: 'Error en vista previa',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const executeMigration = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('migrate-sectors-to-pe', {
        body: { mode: 'execute' },
      });

      if (error) throw error;

      setExecuteResult(data as MigrationResponse);
      toast({
        title: 'Migración completada',
        description: data.summary?.companies || 'Datos migrados correctamente',
      });
      return data as MigrationResponse;
    } catch (error) {
      console.error('Execute error:', error);
      toast({
        title: 'Error en migración',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setPreviewResult(null);
    setExecuteResult(null);
  };

  return {
    isLoading,
    previewResult,
    executeResult,
    previewMigration,
    executeMigration,
    clearResults,
  };
};
