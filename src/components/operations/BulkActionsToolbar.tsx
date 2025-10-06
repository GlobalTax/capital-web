import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, X, Eye, EyeOff, Star, Download, MapPin, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onFeature: () => void;
  onUnfeature: () => void;
  onExport: () => void;
  onChangeDisplayLocations: () => void;
  onDelete: () => void;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onActivate,
  onDeactivate,
  onFeature,
  onUnfeature,
  onExport,
  onChangeDisplayLocations,
  onDelete,
}) => {
  return (
    <Card className="p-3 mb-4 bg-primary/5 border-primary/20 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">
            <Badge variant="secondary" className="mr-2">{selectedCount}</Badge>
            {selectedCount === 1 ? 'operación seleccionada' : 'operaciones seleccionadas'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Activate/Deactivate */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Eye className="h-4 w-4 mr-2" />
                Estado
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onActivate}>
                <Eye className="h-4 w-4 mr-2" />
                Activar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDeactivate}>
                <EyeOff className="h-4 w-4 mr-2" />
                Desactivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Feature/Unfeature */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Star className="h-4 w-4 mr-2" />
                Destacar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onFeature}>
                <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                Marcar Destacadas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onUnfeature}>
                <Star className="h-4 w-4 mr-2" />
                Quitar Destacadas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Display Locations */}
          <Button
            variant="outline"
            size="sm"
            onClick={onChangeDisplayLocations}
            className="h-8"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Ubicaciones
          </Button>

          <DropdownMenuSeparator />

          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-8"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="h-8"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>
    </Card>
  );
};
