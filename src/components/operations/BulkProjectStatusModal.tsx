import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Calendar } from 'lucide-react';

interface BulkProjectStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: (status: string, expectedMarketText?: string) => void;
  isLoading?: boolean;
}

export const BulkProjectStatusModal: React.FC<BulkProjectStatusModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
  isLoading = false,
}) => {
  const [projectStatus, setProjectStatus] = useState<string>('active');
  const [expectedMarketText, setExpectedMarketText] = useState<string>('');

  const handleConfirm = () => {
    onConfirm(projectStatus, projectStatus === 'upcoming' ? expectedMarketText : undefined);
  };

  const handleClose = () => {
    setProjectStatus('active');
    setExpectedMarketText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Cambiar Estado del Proyecto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Se aplicará a <span className="font-semibold text-foreground">{selectedCount}</span> operaciones seleccionadas
          </p>

          <div className="space-y-2">
            <Label htmlFor="project_status">Estado del proyecto</Label>
            <Select
              value={projectStatus}
              onValueChange={setProjectStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">✓ Activo</SelectItem>
                <SelectItem value="upcoming">⏳ Próximamente</SelectItem>
                <SelectItem value="exclusive">⭐ En exclusividad</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {projectStatus === 'upcoming' && (
            <div className="space-y-2">
              <Label htmlFor="expected_market_text" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Disponible en
              </Label>
              <Input
                id="expected_market_text"
                value={expectedMarketText}
                onChange={(e) => setExpectedMarketText(e.target.value)}
                placeholder="Ej: Q1 2026, Marzo 2026, H2 2025"
              />
              <p className="text-xs text-muted-foreground">
                Este texto aparecerá junto al estado en las tarjetas
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Aplicando...' : 'Aplicar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
