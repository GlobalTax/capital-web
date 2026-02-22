import React, { useState } from 'react';
import { Database } from 'lucide-react';
import { useSectorIntelligence, SectorIntelligenceRow } from '@/hooks/useSectorIntelligence';
import { SectorTable } from '@/components/admin/sector-intelligence/SectorTable';
import { SectorEditDialog } from '@/components/admin/sector-intelligence/SectorEditDialog';
import { SectorImportDialog } from '@/components/admin/sector-intelligence/SectorImportDialog';
import { SectorCoverageDashboard } from '@/components/admin/sector-intelligence/SectorCoverageDashboard';
import { PageLoadingSkeleton } from '@/components/LoadingStates';

const SectorIntelligencePage: React.FC = () => {
  const { rows, grouped, sectors, isLoading, updateRow, createRow, deleteRow, bulkCreateRows } = useSectorIntelligence();
  const [editRow, setEditRow] = useState<SectorIntelligenceRow | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const handleEdit = (row: SectorIntelligenceRow) => {
    setEditRow(row);
    setIsNew(false);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditRow(null);
    setIsNew(true);
    setDialogOpen(true);
  };

  const handleSave = (data: any) => {
    if (isNew) {
      const { id, created_at, updated_at, ...rest } = data;
      createRow.mutate(rest);
    } else {
      updateRow.mutate(data);
    }
  };

  const handleBulkImport = (rows: Record<string, any>[]) => {
    bulkCreateRows.mutate(rows as any, {
      onSuccess: () => setImportDialogOpen(false),
    });
  };

  if (isLoading) return <PageLoadingSkeleton />;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-[hsl(var(--linear-text-tertiary))]" />
        <h1 className="text-lg font-semibold text-[hsl(var(--linear-text-primary))]">
          Inteligencia PE Sectorial
        </h1>
      </div>
      <p className="text-xs text-[hsl(var(--linear-text-tertiary))]">
        Base de datos completa de subsectores de inversión PE con tesis, firmas activas, plataformas y múltiplos.
      </p>

      <SectorCoverageDashboard rows={rows} grouped={grouped} sectors={sectors} onEdit={handleEdit} />

      <SectorTable
        grouped={grouped}
        sectors={sectors}
        onEdit={handleEdit}
        onDelete={(id) => deleteRow.mutate(id)}
        onCreate={handleCreate}
        onImport={() => setImportDialogOpen(true)}
      />

      <SectorEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        row={editRow}
        onSave={handleSave}
        isNew={isNew}
      />

      <SectorImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleBulkImport}
        isImporting={bulkCreateRows.isPending}
      />
    </div>
  );
};

export default SectorIntelligencePage;
