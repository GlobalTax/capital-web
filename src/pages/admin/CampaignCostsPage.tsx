// ============= CAMPAIGN COSTS PAGE =============
// Página de análisis de costes de campañas vs leads

import React, { useState } from 'react';
import { Plus, RefreshCw, TrendingUp, Euro, Target, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCampaignCosts, CampaignCost, CampaignCostInput } from '@/hooks/useCampaignCosts';
import CostEntryForm from '@/components/admin/campaigns/CostEntryForm';
import ChannelCACCards from '@/components/admin/campaigns/ChannelCACCards';
import CostVsLeadsChart from '@/components/admin/campaigns/CostVsLeadsChart';
import CostsTable from '@/components/admin/campaigns/CostsTable';

const CampaignCostsPage: React.FC = () => {
  const {
    costs,
    channelAnalytics,
    monthlyAnalytics,
    totalSpend,
    currentMonthSpend,
    isLoadingCosts,
    isLoadingAnalytics,
    addCost,
    updateCost,
    deleteCost,
    isAdding,
    isUpdating
  } = useCampaignCosts();

  const [showForm, setShowForm] = useState(false);
  const [editingCost, setEditingCost] = useState<CampaignCost | null>(null);

  const handleAddCost = (data: CampaignCostInput) => {
    addCost(data);
    setShowForm(false);
  };

  const handleUpdateCost = (data: CampaignCostInput) => {
    if (editingCost) {
      updateCost({ ...data, id: editingCost.id });
      setEditingCost(null);
    }
  };

  const handleEdit = (cost: CampaignCost) => {
    setEditingCost(cost);
  };

  const handleDelete = (id: string) => {
    deleteCost(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Euro className="h-6 w-6 text-primary" />
            Análisis de Costes de Campañas
          </h1>
          <p className="text-muted-foreground">
            Registra gastos publicitarios y analiza el CAC por canal
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Gasto
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <ChannelCACCards 
        analytics={channelAnalytics} 
        isLoading={isLoadingAnalytics}
      />

      {/* Chart */}
      <CostVsLeadsChart 
        data={monthlyAnalytics}
        isLoading={isLoadingCosts}
      />

      {/* Costs Table */}
      <CostsTable 
        costs={costs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoadingCosts}
      />

      {/* Add Form Modal */}
      <CostEntryForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleAddCost}
        isSubmitting={isAdding}
        mode="create"
      />

      {/* Edit Form Modal */}
      {editingCost && (
        <CostEntryForm
          open={!!editingCost}
          onClose={() => setEditingCost(null)}
          onSubmit={handleUpdateCost}
          isSubmitting={isUpdating}
          mode="edit"
          defaultValues={{
            channel: editingCost.channel,
            campaign_name: editingCost.campaign_name || undefined,
            period_start: editingCost.period_start,
            period_end: editingCost.period_end,
            amount: Number(editingCost.amount),
            impressions: editingCost.impressions || undefined,
            clicks: editingCost.clicks || undefined,
            ctr: editingCost.ctr || undefined,
            cpc: editingCost.cpc || undefined,
            notes: editingCost.notes || undefined
          }}
        />
      )}
    </div>
  );
};

export default CampaignCostsPage;
