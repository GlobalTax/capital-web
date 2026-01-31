/**
 * Hook for managing lead pipeline column configuration
 * @deprecated Use useContactStatuses from @/hooks/useContactStatuses instead.
 * This hook is now a wrapper that maps contact_statuses to the old API.
 */

import { useContactStatuses, type ContactStatus } from '@/hooks/useContactStatuses';

// Legacy type - now maps from ContactStatus
export interface LeadPipelineColumn {
  id: string;
  stage_key: string; // Maps to status_key
  label: string;
  color: string;
  icon: string;
  position: number;
  is_visible: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export type ColumnFormData = {
  stage_key: string;
  label: string;
  color: string;
  icon: string;
};

/**
 * Maps a ContactStatus to the legacy LeadPipelineColumn format
 */
const mapStatusToColumn = (status: ContactStatus): LeadPipelineColumn => ({
  id: status.id,
  stage_key: status.status_key,
  label: status.label,
  color: status.color,
  icon: status.icon,
  position: status.position,
  is_visible: status.is_visible,
  is_system: status.is_system,
  created_at: status.created_at,
  updated_at: status.updated_at,
});

/**
 * @deprecated Use useContactStatuses directly. This wrapper maintains backward compatibility
 * while the codebase migrates to the unified status system.
 */
export const useLeadPipelineColumns = () => {
  const {
    statuses,
    visibleStatuses,
    isLoading,
    refetch,
    updateStatus,
    isUpdating,
    addStatus,
    isAdding,
    deleteStatus,
    isDeleting,
    reorderStatuses,
    isReordering,
    toggleVisibility,
    isTogglingVisibility,
  } = useContactStatuses();

  // Map statuses to columns format
  const columns = statuses.map(mapStatusToColumn);
  const visibleColumns = visibleStatuses.map(mapStatusToColumn);

  // Adapter for updateColumn - maps to updateStatus
  const updateColumn = (
    { id, updates }: { id: string; updates: Partial<LeadPipelineColumn> },
    options?: { onSuccess?: () => void }
  ) => {
    const statusUpdates: Partial<ContactStatus> = {
      ...updates,
      status_key: updates.stage_key || undefined,
    };
    delete (statusUpdates as any).stage_key;
    updateStatus({ id, updates: statusUpdates }, options);
  };

  // Adapter for addColumn - maps to addStatus
  const addColumn = (
    columnData: ColumnFormData,
    options?: { onSuccess?: () => void }
  ) => {
    addStatus(
      {
        status_key: columnData.stage_key,
        label: columnData.label,
        color: columnData.color,
        icon: columnData.icon,
      },
      options
    );
  };

  return {
    columns,
    visibleColumns,
    isLoading,
    refetch,
    updateColumn,
    isUpdating,
    addColumn,
    isAdding,
    deleteColumn: deleteStatus,
    isDeleting,
    reorderColumns: reorderStatuses,
    isReordering,
    toggleVisibility,
    isTogglingVisibility,
  };
};
