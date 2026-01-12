// ============= CR PORTFOLIO DETAIL PAGE =============
// Página de detalle para empresas participadas de Capital Riesgo

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { CRPortfolioDetailHeader } from '@/components/admin/capital-riesgo/CRPortfolioDetailHeader';
import { CRPortfolioDetailSidebar } from '@/components/admin/capital-riesgo/CRPortfolioDetailSidebar';
import { CRPortfolioDetailContent } from '@/components/admin/capital-riesgo/CRPortfolioDetailContent';
import { CRPortfolioEditModal } from '@/components/admin/capital-riesgo/CRPortfolioEditModal';
import { useDeleteCRPortfolio } from '@/hooks/useCRPortfolio';
import { toast } from 'sonner';
import type { CRPortfolio } from '@/types/capitalRiesgo';

export default function CRPortfolioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const deletePortfolio = useDeleteCRPortfolio();

  // Fetch portfolio company with fund info
  const { data: company, isLoading, error, refetch } = useQuery({
    queryKey: ['cr-portfolio-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');
      
      const { data, error } = await supabase
        .from('cr_portfolio')
        .select(`
          *,
          fund:cr_funds(id, name, fund_type, website, status)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as CRPortfolio & { fund?: { id: string; name: string; fund_type: string; website?: string; status: string } };
    },
    enabled: !!id,
  });

  const handleDelete = async () => {
    if (!company) return;
    
    if (!confirm(`¿Estás seguro de eliminar "${company.company_name}"?`)) {
      return;
    }

    try {
      await deletePortfolio.mutateAsync(company.id);
      toast.success('Empresa eliminada correctamente');
      navigate(`/admin/cr-directory/${company.fund_id}`);
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Empresa no encontrada</p>
        <button 
          onClick={() => navigate('/admin/cr-directory')}
          className="text-primary hover:underline"
        >
          Volver al directorio
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* Header */}
      <CRPortfolioDetailHeader 
        company={company}
        fundName={company.fund?.name}
        onEdit={() => setIsEditModalOpen(true)}
        onDelete={handleDelete}
      />

      {/* Main content - 2 column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <CRPortfolioDetailSidebar company={company} />

        {/* Main content area with tabs */}
        <CRPortfolioDetailContent 
          company={company} 
          onRefresh={refetch}
        />
      </div>

      {/* Edit Modal */}
      <CRPortfolioEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        portfolio={company}
        defaultFundId={company.fund_id}
      />
    </div>
  );
}
