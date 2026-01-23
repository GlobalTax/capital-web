// ============= CAMPAIGN ROW ACTIONS =============
// Dropdown de acciones por fila de campaña

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Calendar, 
  Pencil, 
  Copy, 
  Archive, 
  BarChart3,
  Pause,
  Play
} from 'lucide-react';
import { CampaignWithSnapshot } from '@/hooks/useCampaignRegistry';

interface CampaignRowActionsProps {
  campaign: CampaignWithSnapshot;
  onAddDate: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onToggleDelivery: () => void;
  onViewCharts?: () => void;
}

export const CampaignRowActions: React.FC<CampaignRowActionsProps> = ({
  campaign,
  onAddDate,
  onEdit,
  onDuplicate,
  onArchive,
  onToggleDelivery,
  onViewCharts
}) => {
  const [showArchiveDialog, setShowArchiveDialog] = React.useState(false);

  const handleArchiveConfirm = () => {
    onArchive();
    setShowArchiveDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Acciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onAddDate}>
            <Calendar className="mr-2 h-4 w-4" />
            Añadir fecha
          </DropdownMenuItem>
          
          {onViewCharts && (
            <DropdownMenuItem onClick={onViewCharts}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Ver gráficos
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar campaña
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={onToggleDelivery}>
            {campaign.delivery_status === 'active' ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pausar
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Activar
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicar
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowArchiveDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Archive className="mr-2 h-4 w-4" />
            Archivar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Archivar campaña?</AlertDialogTitle>
            <AlertDialogDescription>
              La campaña "{campaign.name}" se archivará y dejará de aparecer en la lista principal.
              Los registros históricos se mantendrán para análisis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveConfirm}>
              Archivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
