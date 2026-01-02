/**
 * useFase0WorkflowValidation - Hook for validating Fase 0 workflow rules
 * Handles NDA blocking, status transitions, and smart suggestions
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFase0DocumentsByLead } from './useFase0Documents';
import { Fase0LeadType, Fase0DocumentType } from '../types';
import { LeadStatus } from '@/features/leads-pipeline/types';

interface WorkflowRule {
  id: string;
  rule_name: string;
  rule_type: 'block_status' | 'require_document' | 'auto_suggest';
  condition: {
    required_document?: Fase0DocumentType;
    required_status?: string;
    lead_type?: string;
  };
  action: {
    blocked_lead_status?: string;
    message?: string;
    suggested_document?: Fase0DocumentType;
    highlight?: boolean;
  };
  is_active: boolean;
  description: string | null;
}

interface ValidationResult {
  canAdvance: boolean;
  blockedReasons: string[];
  requiredDocuments: Fase0DocumentType[];
  suggestedDocument: Fase0DocumentType | null;
}

export const useFase0WorkflowRules = () => {
  return useQuery({
    queryKey: ['fase0-workflow-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fase0_workflow_rules')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as WorkflowRule[];
    }
  });
};

export const useFase0WorkflowValidation = (
  leadId: string | undefined,
  leadType: Fase0LeadType,
  leadOperationType?: 'sell-side' | 'buy-side' | null
) => {
  const { data: rules } = useFase0WorkflowRules();
  const { data: documents } = useFase0DocumentsByLead(leadId, leadType);

  const isDocumentSigned = (docType: Fase0DocumentType): boolean => {
    if (!documents) return false;
    return documents.some(
      doc => doc.document_type === docType && doc.status === 'signed'
    );
  };

  const isDocumentGenerated = (docType: Fase0DocumentType): boolean => {
    if (!documents) return false;
    return documents.some(
      doc => doc.document_type === docType && 
        ['generated', 'sent', 'viewed', 'signed'].includes(doc.status)
    );
  };

  const canAdvanceToStatus = (targetStatus: LeadStatus): ValidationResult => {
    const result: ValidationResult = {
      canAdvance: true,
      blockedReasons: [],
      requiredDocuments: [],
      suggestedDocument: null
    };

    if (!rules) return result;

    // Check blocking rules
    const blockingRules = rules.filter(r => r.rule_type === 'block_status');
    
    for (const rule of blockingRules) {
      if (rule.action.blocked_lead_status === targetStatus) {
        // Check if the required document is in the required status
        const requiredDoc = rule.condition.required_document;
        const requiredStatus = rule.condition.required_status;

        if (requiredDoc && requiredStatus === 'signed') {
          if (!isDocumentSigned(requiredDoc)) {
            result.canAdvance = false;
            result.blockedReasons.push(rule.action.message || `Se requiere ${requiredDoc} firmado`);
            result.requiredDocuments.push(requiredDoc);
          }
        }
      }
    }

    return result;
  };

  const getSuggestedDocument = (): Fase0DocumentType | null => {
    if (!rules) return null;

    // First check if NDA is needed
    if (!isDocumentSigned('nda')) {
      return 'nda';
    }

    // Then check auto-suggest rules based on lead type
    const suggestionRules = rules.filter(r => r.rule_type === 'auto_suggest');
    
    for (const rule of suggestionRules) {
      if (rule.condition.lead_type === leadOperationType) {
        const suggestedDoc = rule.action.suggested_document;
        if (suggestedDoc && !isDocumentGenerated(suggestedDoc)) {
          return suggestedDoc;
        }
      }
    }

    return null;
  };

  const getPhase0Status = (): 'pending' | 'active' | 'blocked' | 'complete' => {
    if (!documents || documents.length === 0) {
      return 'pending';
    }

    const ndaSigned = isDocumentSigned('nda');
    const hasMandatoVenta = isDocumentSigned('propuesta_mandato_venta');
    const hasMandatoCompra = isDocumentSigned('propuesta_mandato_compra');

    // Check if any mandate is signed
    if (ndaSigned && (hasMandatoVenta || hasMandatoCompra)) {
      return 'complete';
    }

    // Check if NDA is blocking progress
    if (!ndaSigned) {
      const hasPendingMandato = documents.some(
        doc => ['propuesta_mandato_venta', 'propuesta_mandato_compra'].includes(doc.document_type) &&
          doc.status !== 'cancelled'
      );
      if (hasPendingMandato) {
        return 'blocked';
      }
    }

    return 'active';
  };

  const getProgressPercentage = (): number => {
    if (!documents) return 0;

    const ndaSigned = isDocumentSigned('nda');
    const ndaGenerated = isDocumentGenerated('nda');
    
    // Determine which mandate applies
    const mandatoType: Fase0DocumentType = leadOperationType === 'buy-side' 
      ? 'mandato_compra' 
      : 'mandato_venta';
    
    const mandatoSigned = isDocumentSigned(mandatoType);
    const mandatoGenerated = isDocumentGenerated(mandatoType);

    let progress = 0;

    // NDA stages: 0-50%
    if (ndaSigned) {
      progress += 50;
    } else if (ndaGenerated) {
      progress += 25;
    }

    // Mandate stages: 50-100%
    if (mandatoSigned) {
      progress += 50;
    } else if (mandatoGenerated) {
      progress += 25;
    }

    return progress;
  };

  return {
    canAdvanceToStatus,
    getSuggestedDocument,
    getPhase0Status,
    getProgressPercentage,
    isDocumentSigned,
    isDocumentGenerated,
    isNdaSigned: () => isDocumentSigned('nda'),
    rules
  };
};
