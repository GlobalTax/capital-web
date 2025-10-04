import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { X, Download, Mail, Trash2, UserPlus } from 'lucide-react';
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

interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkUpdateStatus: (ids: string[], status: string) => void;
  onExport: (format: 'excel' | 'csv' | 'crm' | 'email') => void;
  onClearSelection: () => void;
  selectedIds: string[];
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onBulkUpdateStatus,
  onExport,
  onClearSelection,
  selectedIds,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<string>('');

  const handleStatusUpdate = () => {
    if (selectedStatus) {
      onBulkUpdateStatus(selectedIds, selectedStatus);
      setSelectedStatus('');
    }
  };

  return (
    <>
      <Card className="p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedCount} contacto{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
            </span>
            
            {/* Change Status */}
            <div className="flex items-center gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Cambiar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nuevo</SelectItem>
                  <SelectItem value="contacted">Contactado</SelectItem>
                  <SelectItem value="qualified">Cualificado</SelectItem>
                  <SelectItem value="opportunity">Oportunidad</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                  <SelectItem value="lost">Perdido</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStatusUpdate}
                disabled={!selectedStatus}
              >
                Aplicar
              </Button>
            </div>

            {/* Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExport('excel')}>
                  Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('csv')}>
                  CSV (.csv)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('crm')}>
                  Formato CRM
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('email')}>
                  Lista de correos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Send Mass Email */}
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Enviar Email
            </Button>

            {/* Assign to Sales */}
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Asignar
            </Button>

            {/* Delete */}
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>

          {/* Clear Selection */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar selección
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar {selectedCount} contacto{selectedCount !== 1 ? 's' : ''}.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                // TODO: Implement delete functionality
                setShowDeleteDialog(false);
                onClearSelection();
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BulkActionsToolbar;
