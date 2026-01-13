import { useState } from 'react';
import { Plus, MoreHorizontal, Trash2, Pencil, FileText, ExternalLink } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDeleteMNABoutiqueDeal } from '@/hooks/useMNABoutiqueDeals';
import { MNADealForm } from './MNADealForm';
import type { MNABoutiqueDeal } from '@/types/mnaBoutique';
import { MNA_DEAL_TYPE_LABELS, MNA_ROLE_IN_DEAL_LABELS } from '@/types/mnaBoutique';

interface MNABoutiqueDealsPanelProps {
  boutiqueId: string;
  deals: MNABoutiqueDeal[];
}

export function MNABoutiqueDealsPanel({ boutiqueId, deals }: MNABoutiqueDealsPanelProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<MNABoutiqueDeal | null>(null);
  const deleteMutation = useDeleteMNABoutiqueDeal();

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este deal?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatValue = (value: number | null, currency: string = 'EUR') => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
      notation: value >= 1000000 ? 'compact' : 'standard',
    }).format(value);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-normal">Track Record ({deals.length})</h3>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Añadir deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Añadir deal</DialogTitle>
              </DialogHeader>
              <MNADealForm 
                boutiqueId={boutiqueId} 
                onSuccess={() => setIsAddOpen(false)}
                onCancel={() => setIsAddOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {deals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay deals registrados</p>
            <Button variant="link" onClick={() => setIsAddOpen(true)}>
              Añadir primer deal
            </Button>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Empresa</TableHead>
                  <TableHead className="min-w-[80px]">Año</TableHead>
                  <TableHead className="min-w-[100px]">Tipo</TableHead>
                  <TableHead className="min-w-[100px]">Rol</TableHead>
                  <TableHead className="min-w-[100px]">Valor</TableHead>
                  <TableHead className="min-w-[120px]">Sector</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-normal">{deal.company_name}</span>
                        {deal.source_url && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a 
                                href={deal.source_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>Ver fuente</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      {deal.acquirer_name && (
                        <p className="text-xs text-muted-foreground">→ {deal.acquirer_name}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {deal.deal_year || '-'}
                    </TableCell>
                    <TableCell>
                      {deal.deal_type ? (
                        <Badge variant="outline">
                          {MNA_DEAL_TYPE_LABELS[deal.deal_type]}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {deal.role_in_deal ? (
                        <span className="text-sm text-muted-foreground">
                          {MNA_ROLE_IN_DEAL_LABELS[deal.role_in_deal]}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatValue(deal.deal_value, deal.deal_value_currency)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {deal.sector || '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingDeal(deal)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(deal.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit modal */}
        <Dialog open={!!editingDeal} onOpenChange={(open) => !open && setEditingDeal(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar deal</DialogTitle>
            </DialogHeader>
            {editingDeal && (
              <MNADealForm 
                boutiqueId={boutiqueId}
                deal={editingDeal}
                onSuccess={() => setEditingDeal(null)}
                onCancel={() => setEditingDeal(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
