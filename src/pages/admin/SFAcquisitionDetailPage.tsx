import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SFAcquisition, SFFund } from '@/types/searchFunds';
import { SFAcquisitionDetailHeader } from '@/components/admin/search-funds/SFAcquisitionDetailHeader';
import { SFAcquisitionDetailSidebar } from '@/components/admin/search-funds/SFAcquisitionDetailSidebar';
import { SFAcquisitionDetailContent } from '@/components/admin/search-funds/SFAcquisitionDetailContent';
import { SFAcquisitionEditModal } from '@/components/admin/search-funds/SFAcquisitionEditModal';
import { useDeleteSFAcquisition } from '@/hooks/useSFAcquisitions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AcquisitionWithFund extends SFAcquisition {
  fund?: SFFund;
}

export default function SFAcquisitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteAcquisition = useDeleteSFAcquisition();

  const { data: acquisition, isLoading, error, refetch } = useQuery({
    queryKey: ['sf-acquisition', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');
      
      const { data, error } = await supabase
        .from('sf_acquisitions')
        .select(`
          *,
          fund:sf_funds(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as unknown as AcquisitionWithFund;
    },
    enabled: !!id,
  });

  const handleDelete = async () => {
    if (!id) return;
    await deleteAcquisition.mutateAsync(id);
    navigate('/admin/sf-directory');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !acquisition) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-destructive">Error al cargar la adquisición</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <SFAcquisitionDetailHeader
        acquisition={acquisition}
        fund={acquisition.fund}
        onEdit={() => setIsEditing(true)}
        onDelete={() => setShowDeleteDialog(true)}
      />

      {/* Main content: Sidebar + Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <SFAcquisitionDetailSidebar 
          acquisition={acquisition} 
          fund={acquisition.fund}
        />

        {/* Right Panel */}
        <SFAcquisitionDetailContent 
          acquisition={acquisition}
          fund={acquisition.fund}
        />
      </div>

      {/* Edit Modal */}
      <SFAcquisitionEditModal
        open={isEditing}
        onOpenChange={setIsEditing}
        acquisition={acquisition}
        defaultFundId={acquisition.fund_id}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar adquisición?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente "{acquisition.company_name}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
