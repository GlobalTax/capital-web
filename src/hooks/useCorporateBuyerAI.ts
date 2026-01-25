// =============================================
// CORPORATE BUYER AI HOOK
// =============================================

import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SuggestedTarget {
  empresa_id: string;
  nombre: string;
  sector: string | null;
  ubicacion: string | null;
  revenue: number | null;
  ebitda: number | null;
  descripcion: string | null;
  fit_score: number;
  fit_reasons: string[];
  risks: string[];
  ai_score?: number;
  ai_reasoning?: string;
  strategic_fit?: 'alto' | 'medio' | 'bajo';
  combined_score?: number;
}

export interface SuggestTargetsResult {
  matches: SuggestedTarget[];
  total_candidates_analyzed: number;
  buyer_criteria?: {
    sectors: string[] | null;
    geography: string[] | null;
    revenue_range: string;
  };
  error?: string;
  message?: string;
}

export interface ImproveDescriptionResult {
  improved_description: string;
  key_highlights: string[];
  suggested_keywords: string[];
}

export interface GenerateThesisResult {
  thesis: {
    strategic_objective: string;
    ideal_target_profile: string;
    exclusion_criteria: string[];
    synergies_sought: string[];
    evaluation_process: string;
  };
  summary: string;
  investment_thesis_text: string;
}

export interface MatchedOperation {
  mandate_id: string;
  title: string;
  sector: string | null;
  subsector: string | null;
  geographic_scope: string | null;
  revenue_range: string;
  description: string | null;
  fit_score: number;
  fit_reasons: string[];
}

export interface MatchOperationsResult {
  matches: MatchedOperation[];
  total_operations_analyzed: number;
  buyer_criteria?: {
    sectors: string[] | null;
    geography: string[] | null;
  };
  message?: string;
  suggestion?: string;
}

type AIAction = 'suggest_targets' | 'improve_description' | 'generate_thesis' | 'match_operations';

async function callCorporateBuyerAI<T>(buyerId: string, action: AIAction): Promise<T> {
  const { data, error } = await supabase.functions.invoke('corporate-buyer-ai', {
    body: { buyer_id: buyerId, action }
  });

  if (error) {
    console.error(`AI ${action} error:`, error);
    throw new Error(error.message || `Error en ${action}`);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as T;
}

export function useCorporateBuyerAI(buyerId: string | undefined) {
  // Suggest target companies
  const suggestTargets = useMutation({
    mutationFn: async () => {
      if (!buyerId) throw new Error('No buyer ID');
      return callCorporateBuyerAI<SuggestTargetsResult>(buyerId, 'suggest_targets');
    },
    onError: (error: Error) => {
      toast.error('Error al sugerir empresas', {
        description: error.message
      });
    }
  });

  // Improve description
  const improveDescription = useMutation({
    mutationFn: async () => {
      if (!buyerId) throw new Error('No buyer ID');
      return callCorporateBuyerAI<ImproveDescriptionResult>(buyerId, 'improve_description');
    },
    onError: (error: Error) => {
      toast.error('Error al mejorar descripción', {
        description: error.message
      });
    }
  });

  // Generate investment thesis
  const generateThesis = useMutation({
    mutationFn: async () => {
      if (!buyerId) throw new Error('No buyer ID');
      return callCorporateBuyerAI<GenerateThesisResult>(buyerId, 'generate_thesis');
    },
    onError: (error: Error) => {
      toast.error('Error al generar tesis', {
        description: error.message
      });
    }
  });

  // Match with active operations
  const matchOperations = useMutation({
    mutationFn: async () => {
      if (!buyerId) throw new Error('No buyer ID');
      return callCorporateBuyerAI<MatchOperationsResult>(buyerId, 'match_operations');
    },
    onError: (error: Error) => {
      toast.error('Error al buscar operaciones', {
        description: error.message
      });
    }
  });

  return {
    suggestTargets,
    improveDescription,
    generateThesis,
    matchOperations,
    isAnyLoading: 
      suggestTargets.isPending || 
      improveDescription.isPending || 
      generateThesis.isPending || 
      matchOperations.isPending
  };
}
