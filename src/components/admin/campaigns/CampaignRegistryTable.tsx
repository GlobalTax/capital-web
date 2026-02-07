// ============= CAMPAIGN REGISTRY TABLE =============
// Tabla principal tipo Meta Ads para registro de campañas y snapshots

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { SpreadsheetCell, SelectOption } from './SpreadsheetCell';
import { AddSnapshotRow } from './AddSnapshotRow';
import { AddCampaignModal } from './AddCampaignModal';
import { CampaignRowActions } from './CampaignRowActions';
import { useSpreadsheetNavigation } from '@/hooks/useSpreadsheetNavigation';
import { 
  useCampaignRegistry, 
  CampaignWithSnapshot, 
  CreateCampaignInput, 
  SnapshotInput,
  CHANNEL_LABELS 
} from '@/hooks/useCampaignRegistry';
import { 
  Plus, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Target
} from 'lucide-react';

// ============= COLUMN DEFINITIONS =============

const COLUMNS = [
  { key: 'campaign_name', title: 'Campaña', width: 200, editable: false },
  { key: 'delivery_status', title: 'Entrega', width: 85, editable: true, type: 'campaign' },
  { key: 'snapshot_date', title: 'Fecha', width: 75, editable: false },
  { key: 'results', title: 'Resultados', width: 85, editable: true, type: 'snapshot' },
  { key: 'cost_per_result', title: 'CPR', width: 90, editable: false },
  { key: 'amount_spent', title: 'Gastado', width: 100, editable: true, type: 'snapshot' },
  { key: 'daily_budget', title: 'Ppto/Día', width: 95, editable: true, type: 'snapshot' },
  { key: 'monthly_budget', title: 'Ppto/Mes', width: 100, editable: true, type: 'snapshot' },
  { key: 'target_cpl', title: 'CPL Obj.', width: 85, editable: true, type: 'snapshot' },
  { key: 'internal_status', title: 'Estado', width: 90, editable: true, type: 'snapshot' },
  { key: 'notes', title: 'Notas', width: 180, editable: true, type: 'snapshot' },
  { key: 'actions', title: '', width: 50, editable: false },
] as const;

// ============= OPTIONS =============

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'ok', label: 'OK', color: 'text-green-700' },
  { value: 'watch', label: 'Vigilar', color: 'text-amber-700' },
  { value: 'stop', label: 'Parar', color: 'text-red-700' },
];

const DELIVERY_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Activa', color: 'text-green-700' },
  { value: 'paused', label: 'Pausada', color: 'text-muted-foreground' },
];

// ============= HELPERS =============

const calculateSuggestedStatus = (
  costPerResult: number | null,
  targetCpl: number | null
): 'ok' | 'watch' | 'stop' => {
  if (!targetCpl || targetCpl === 0 || !costPerResult) return 'ok';
  const ratio = costPerResult / targetCpl;
  if (ratio <= 1.0) return 'ok';
  if (ratio <= 1.2) return 'watch';
  return 'stop';
};

const getRowStatusClass = (status: string | null): string => {
  switch (status) {
    case 'ok': return 'bg-green-50/50';
    case 'watch': return 'bg-amber-50/50';
    case 'stop': return 'bg-red-50/50';
    default: return '';
  }
};

const getCplVariationIcon = (variation: number | null) => {
  if (variation === null) return null;
  if (variation <= 0) return <TrendingDown className="h-3 w-3 text-green-600" />;
  if (variation <= 20) return <Minus className="h-3 w-3 text-amber-600" />;
  return <TrendingUp className="h-3 w-3 text-red-600" />;
};

// ============= MAIN COMPONENT =============

interface CampaignRegistryTableProps {
  className?: string;
}

export const CampaignRegistryTable: React.FC<CampaignRegistryTableProps> = ({
  className
}) => {
  const {
    campaigns,
    isLoadingCampaigns,
    createCampaign,
    updateCampaign,
    archiveCampaign,
    duplicateCampaign,
    upsertSnapshotAsync,
    updateSnapshotCell,
    updateCampaignCell,
    isCreating,
    isSavingSnapshot
  } = useCampaignRegistry();

  const [showAddModal, setShowAddModal] = useState(false);
  const [addingSnapshotFor, setAddingSnapshotFor] = useState<string | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<CampaignWithSnapshot | null>(null);

  // Enhanced data with calculated fields
  const enhancedCampaigns = useMemo(() => {
    return campaigns.map(campaign => {
      const snap = campaign.latest_snapshot;
      const results = snap?.results || 0;
      const amountSpent = Number(snap?.amount_spent) || 0;
      const costPerResult = results > 0 ? amountSpent / results : null;
      const targetCpl = snap?.target_cpl ? Number(snap.target_cpl) : null;
      const cplVariation = costPerResult && targetCpl 
        ? ((costPerResult - targetCpl) / targetCpl) * 100 
        : null;
      const suggestedStatus = calculateSuggestedStatus(costPerResult, targetCpl);
      
      return {
        ...campaign,
        costPerResult,
        cplVariation,
        suggestedStatus,
        effectiveStatus: snap?.internal_status || suggestedStatus
      };
    });
  }, [campaigns]);

  // Navigation setup
  const editableColumnKeys = COLUMNS.filter(c => c.editable).map(c => c.key);
  const allColumnKeys = COLUMNS.map(c => c.key);
  
  const { focusCell, navigate, isCellFocused } = useSpreadsheetNavigation({
    rows: enhancedCampaigns,
    columns: allColumnKeys,
    editableColumns: editableColumnKeys
  });

  // Handle cell save for snapshot fields
  const handleSnapshotCellSave = useCallback(async (
    snapshotId: string | undefined,
    campaignId: string,
    field: string,
    value: any,
    source?: 'snapshot' | 'history'
  ) => {
    if (source === 'history') {
      // History data is read-only; create a real snapshot instead
      await upsertSnapshotAsync({
        campaign_id: campaignId,
        snapshot_date: format(new Date(), 'yyyy-MM-dd'),
        [field]: value
      });
      return;
    }
    if (snapshotId) {
      await updateSnapshotCell({ snapshotId, field, value });
    } else {
      // No snapshot exists, create one with this field
      await upsertSnapshotAsync({
        campaign_id: campaignId,
        snapshot_date: format(new Date(), 'yyyy-MM-dd'),
        [field]: value
      });
    }
  }, [updateSnapshotCell, upsertSnapshotAsync]);

  // Handle campaign field save
  const handleCampaignCellSave = useCallback(async (
    campaignId: string,
    field: string,
    value: any
  ) => {
    await updateCampaignCell({ campaignId, field, value });
  }, [updateCampaignCell]);

  // Handle navigation
  const handleNavigate = useCallback((
    rowIndex: number,
    columnKey: string,
    direction: 'up' | 'down' | 'left' | 'right' | 'tab'
  ) => {
    navigate(direction);
  }, [navigate]);

  // Handle add snapshot
  const handleAddSnapshot = useCallback(async (data: SnapshotInput) => {
    await upsertSnapshotAsync(data);
    setAddingSnapshotFor(null);
  }, [upsertSnapshotAsync]);

  // Handle create campaign
  const handleCreateCampaign = useCallback((data: CreateCampaignInput) => {
    createCampaign(data);
    setShowAddModal(false);
  }, [createCampaign]);

  // Render cell
  const renderCell = useCallback((
    campaign: typeof enhancedCampaigns[0],
    rowIndex: number,
    column: typeof COLUMNS[number]
  ) => {
    const isFocused = isCellFocused(rowIndex, column.key);
    const snap = campaign.latest_snapshot;
    const isHistorySource = snap?.source === 'history';
    const snapshotEditable = !isHistorySource;

    switch (column.key) {
      // Campaign name (non-editable in table, use modal)
      case 'campaign_name':
        return (
          <div className="px-3 py-2.5 flex items-center gap-2">
            <span className={cn(
              "w-2 h-2 rounded-full shrink-0",
              campaign.delivery_status === 'active' ? 'bg-green-500' : 'bg-muted-foreground'
            )} />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{campaign.name}</div>
              <div className="text-[10px] text-muted-foreground">
                {CHANNEL_LABELS[campaign.channel]}
              </div>
            </div>
          </div>
        );

      // Delivery status
      case 'delivery_status':
        return (
          <SpreadsheetCell
            value={campaign.delivery_status}
            type="select"
            options={DELIVERY_OPTIONS}
            editable
            isFocused={isFocused}
            onFocus={() => focusCell({ rowIndex, columnKey: column.key })}
            onNavigate={(dir) => handleNavigate(rowIndex, column.key, dir)}
            onSave={(val) => handleCampaignCellSave(campaign.id, 'delivery_status', val)}
          />
        );

      // Snapshot date
      case 'snapshot_date':
        return (
          <div className="px-2 py-2 text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {snap?.snapshot_date 
              ? format(new Date(snap.snapshot_date), "dd/MM", { locale: es })
              : '—'
            }
          </div>
        );

      // Results
      case 'results':
        return (
          <SpreadsheetCell
            value={snap?.results}
            type="number"
            editable={snapshotEditable}
            isFocused={isFocused}
            onFocus={() => focusCell({ rowIndex, columnKey: column.key })}
            onNavigate={(dir) => handleNavigate(rowIndex, column.key, dir)}
            onSave={(val) => handleSnapshotCellSave(snap?.id, campaign.id, 'results', val, snap?.source)}
            className="text-right tabular-nums"
            placeholder="0"
          />
        );

      // Cost per result (calculated)
      case 'cost_per_result':
        const cpr = campaign.costPerResult;
        const isOverBudget = snap?.target_cpl && cpr && cpr > Number(snap.target_cpl);
        return (
          <div className={cn(
            "px-2 py-2 text-sm text-right tabular-nums flex items-center justify-end gap-1",
            isOverBudget && "text-red-600 font-medium"
          )}>
            {getCplVariationIcon(campaign.cplVariation)}
            {cpr 
              ? new Intl.NumberFormat('es-ES', { 
                  style: 'currency', 
                  currency: 'EUR',
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1
                }).format(cpr)
              : '—'
            }
          </div>
        );

      // Amount spent
      case 'amount_spent':
        return (
          <SpreadsheetCell
            value={snap?.amount_spent}
            type="currency"
            editable={snapshotEditable}
            isFocused={isFocused}
            onFocus={() => focusCell({ rowIndex, columnKey: column.key })}
            onNavigate={(dir) => handleNavigate(rowIndex, column.key, dir)}
            onSave={(val) => handleSnapshotCellSave(snap?.id, campaign.id, 'amount_spent', val, snap?.source)}
            className="text-right tabular-nums"
          />
        );

      // Daily budget
      case 'daily_budget':
        return (
          <SpreadsheetCell
            value={snap?.daily_budget}
            type="currency"
            editable={snapshotEditable}
            isFocused={isFocused}
            onFocus={() => focusCell({ rowIndex, columnKey: column.key })}
            onNavigate={(dir) => handleNavigate(rowIndex, column.key, dir)}
            onSave={(val) => handleSnapshotCellSave(snap?.id, campaign.id, 'daily_budget', val, snap?.source)}
            className="text-right tabular-nums"
          />
        );

      // Monthly budget
      case 'monthly_budget':
        return (
          <SpreadsheetCell
            value={snap?.monthly_budget}
            type="currency"
            editable={snapshotEditable}
            isFocused={isFocused}
            onFocus={() => focusCell({ rowIndex, columnKey: column.key })}
            onNavigate={(dir) => handleNavigate(rowIndex, column.key, dir)}
            onSave={(val) => handleSnapshotCellSave(snap?.id, campaign.id, 'monthly_budget', val, snap?.source)}
            className="text-right tabular-nums"
          />
        );

      // Target CPL
      case 'target_cpl':
        return (
          <SpreadsheetCell
            value={snap?.target_cpl}
            type="currency"
            editable={snapshotEditable}
            isFocused={isFocused}
            onFocus={() => focusCell({ rowIndex, columnKey: column.key })}
            onNavigate={(dir) => handleNavigate(rowIndex, column.key, dir)}
            onSave={(val) => handleSnapshotCellSave(snap?.id, campaign.id, 'target_cpl', val, snap?.source)}
            className="text-right tabular-nums"
          />
        );

      // Internal status
      case 'internal_status':
        return (
          <SpreadsheetCell
            value={snap?.internal_status || campaign.suggestedStatus}
            type="select"
            options={STATUS_OPTIONS}
            editable={snapshotEditable}
            isFocused={isFocused}
            onFocus={() => focusCell({ rowIndex, columnKey: column.key })}
            onNavigate={(dir) => handleNavigate(rowIndex, column.key, dir)}
            onSave={(val) => handleSnapshotCellSave(snap?.id, campaign.id, 'internal_status', val, snap?.source)}
          />
        );

      // Notes
      case 'notes':
        return (
          <SpreadsheetCell
            value={snap?.notes}
            type="text"
            editable={snapshotEditable}
            isFocused={isFocused}
            onFocus={() => focusCell({ rowIndex, columnKey: column.key })}
            onNavigate={(dir) => handleNavigate(rowIndex, column.key, dir)}
            onSave={(val) => handleSnapshotCellSave(snap?.id, campaign.id, 'notes', val, snap?.source)}
            placeholder="Añadir nota..."
          />
        );

      // Actions
      case 'actions':
        return (
          <CampaignRowActions
            campaign={campaign}
            onAddDate={() => setAddingSnapshotFor(campaign.id)}
            onEdit={() => setEditingCampaign(campaign)}
            onDuplicate={() => duplicateCampaign(campaign.id)}
            onArchive={() => archiveCampaign(campaign.id)}
            onToggleDelivery={() => handleCampaignCellSave(
              campaign.id, 
              'delivery_status', 
              campaign.delivery_status === 'active' ? 'paused' : 'active'
            )}
          />
        );

      default:
        return null;
    }
  }, [isCellFocused, focusCell, handleNavigate, handleSnapshotCellSave, handleCampaignCellSave, duplicateCampaign, archiveCampaign]);

  // Loading state
  if (isLoadingCampaigns) {
    return (
      <div className="bg-background border rounded-lg overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Empty state
  if (campaigns.length === 0) {
    return (
      <>
        <div className={cn("bg-background border rounded-lg overflow-hidden", className)}>
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No hay campañas registradas</p>
            <p className="text-muted-foreground text-sm mt-1 mb-4 max-w-sm">
              Añade tu primera campaña para empezar a controlar los costes de adquisición.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear primera campaña
            </Button>
          </div>
        </div>

        <AddCampaignModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onSubmit={handleCreateCampaign}
          isLoading={isCreating}
        />
      </>
    );
  }

  return (
    <>
      <div className={cn("bg-background border rounded-lg overflow-hidden", className)}>
        {/* Header with add button */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
          <div className="text-sm font-medium text-muted-foreground">
            Registro de Campañas
          </div>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nueva campaña
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-max">
            {/* Header - NOT EDITABLE */}
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                {COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-2 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-r last:border-r-0",
                      "select-none"
                    )}
                    style={{ width: column.width, minWidth: column.width }}
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            
            {/* Body */}
            <tbody>
              {enhancedCampaigns.map((campaign, rowIndex) => (
                <React.Fragment key={campaign.id}>
                  {/* Main campaign row */}
                  <tr
                    className={cn(
                      "border-b transition-colors",
                      getRowStatusClass(campaign.effectiveStatus),
                      rowIndex % 2 === 1 && !campaign.latest_snapshot?.internal_status && "bg-muted/20"
                    )}
                  >
                    {COLUMNS.map((column) => (
                      <td
                        key={`${campaign.id}-${column.key}`}
                        className={cn(
                          "border-r last:border-r-0 p-0",
                          column.editable && "hover:bg-muted/30"
                        )}
                        style={{ width: column.width, minWidth: column.width }}
                      >
                        {renderCell(campaign, rowIndex, column)}
                      </td>
                    ))}
                  </tr>

                  {/* Add snapshot row (inline, shown when adding date) */}
                  {addingSnapshotFor === campaign.id && (
                    <AddSnapshotRow
                      campaignId={campaign.id}
                      onSave={handleAddSnapshot}
                      onCancel={() => setAddingSnapshotFor(null)}
                      isLoading={isSavingSnapshot}
                    />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer with keyboard hints */}
        <div className="px-3 py-2 bg-muted/30 border-t text-xs text-muted-foreground flex items-center gap-4">
          <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> Editar</span>
          <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Tab</kbd> Siguiente</span>
          <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> Cancelar</span>
          <span className="ml-auto text-muted-foreground/60">{campaigns.length} campaña{campaigns.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Modals */}
      <AddCampaignModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={handleCreateCampaign}
        isLoading={isCreating}
      />
    </>
  );
};

export default CampaignRegistryTable;
