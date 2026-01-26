import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Pencil, Trash2, Building2, Mail, Phone, Globe, Loader2 } from 'lucide-react';
import { useLeadPotentialBuyers } from '@/hooks/useLeadPotentialBuyers';
import PotentialBuyerForm from './PotentialBuyerForm';
import { LeadPotentialBuyer, LeadPotentialBuyerFormData, BUYER_STATUS_OPTIONS } from '@/types/leadPotentialBuyers';
import { cn } from '@/lib/utils';

interface PotentialBuyersCardProps {
  leadId: string;
  leadOrigin: string;
}

const PotentialBuyersCard: React.FC<PotentialBuyersCardProps> = ({
  leadId,
  leadOrigin,
}) => {
  const {
    buyers,
    isLoading,
    createBuyer,
    updateBuyer,
    deleteBuyer,
    isCreating,
    isUpdating,
    isDeleting,
  } = useLeadPotentialBuyers(leadId, leadOrigin);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<LeadPotentialBuyer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [buyerToDelete, setBuyerToDelete] = useState<LeadPotentialBuyer | null>(null);

  const handleCreate = async (data: LeadPotentialBuyerFormData) => {
    await createBuyer(data);
  };

  const handleUpdate = async (data: LeadPotentialBuyerFormData) => {
    if (!editingBuyer) return;
    await updateBuyer({ id: editingBuyer.id, data });
    setEditingBuyer(null);
  };

  const handleDeleteConfirm = async () => {
    if (!buyerToDelete) return;
    await deleteBuyer(buyerToDelete.id);
    setBuyerToDelete(null);
    setDeleteDialogOpen(false);
  };

  const openEditForm = (buyer: LeadPotentialBuyer) => {
    setEditingBuyer(buyer);
    setFormOpen(true);
  };

  const openDeleteDialog = (buyer: LeadPotentialBuyer) => {
    setBuyerToDelete(buyer);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusOption = BUYER_STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Badge className={cn('text-xs', statusOption?.color || 'bg-muted')}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Compradores Potenciales
            {buyers.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {buyers.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingBuyer(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Añadir
          </Button>
        </CardHeader>

        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : buyers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay compradores potenciales</p>
              <p className="text-xs">Añade compradores para este lead</p>
            </div>
          ) : (
            <div className="space-y-3">
              {buyers.map((buyer) => (
                <div
                  key={buyer.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  {/* Avatar/Logo */}
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={buyer.logo_url || undefined} alt={buyer.name} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(buyer.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {buyer.name}
                      </span>
                      {getStatusBadge(buyer.status)}
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      {buyer.revenue_range && (
                        <span>Fact: {buyer.revenue_range}</span>
                      )}
                      {buyer.sector_focus?.length > 0 && (
                        <span>{buyer.sector_focus.join(', ')}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 text-xs">
                      {buyer.contact_email && (
                        <a
                          href={`mailto:${buyer.contact_email}`}
                          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <Mail className="h-3 w-3" />
                          {buyer.contact_email}
                        </a>
                      )}
                      {buyer.contact_phone && (
                        <a
                          href={`tel:${buyer.contact_phone}`}
                          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <Phone className="h-3 w-3" />
                          {buyer.contact_phone}
                        </a>
                      )}
                      {buyer.website && (
                        <a
                          href={buyer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <Globe className="h-3 w-3" />
                          Web
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditForm(buyer)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(buyer)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <PotentialBuyerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        buyer={editingBuyer}
        onSubmit={editingBuyer ? handleUpdate : handleCreate}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar comprador?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará a "{buyerToDelete?.name}" de la lista de compradores potenciales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PotentialBuyersCard;
