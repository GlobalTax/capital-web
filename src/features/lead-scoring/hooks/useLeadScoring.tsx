// ============= LEAD SCORING HOOK =============
// Hook consolidado para lead scoring

export { useAdvancedLeadScoring } from '@/hooks/useAdvancedLeadScoring';
export { useLeadScoringCore } from '@/hooks/useLeadScoringCore';

// Re-exportar para mantener compatibilidad
export const useLeadScoring = () => {
  // Por ahora usar el hook avanzado como principal
  return require('@/hooks/useAdvancedLeadScoring').useAdvancedLeadScoring();
};