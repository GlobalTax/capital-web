import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSectors } from '@/hooks/useSectors';
import { SectorForm } from './SectorForm';
import { Sector } from '@/types/sectors';

const SectorManagement: React.FC = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  
  const { 
    sectors, 
    isLoading, 
    toggleSectorStatus, 
    deleteSector,
    isDeleting 
  } = useSectors(showInactive);

  const handleEdit = (sector: Sector) => {
    setEditingSector(sector);
  };

  const handleDelete = (sector: Sector) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el sector "${sector.name_es}"?`)) {
      deleteSector(sector.id);
    }
  };

  const closeForm = () => {
    setIsCreateFormOpen(false);
    setEditingSector(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Sectores</h1>
          <p className="text-muted-foreground mt-2">
            Administra los sectores empresariales disponibles en la plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            {showInactive ? 'Solo activos' : 'Ver inactivos'}
          </Button>
          <Button onClick={() => setIsCreateFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Sector
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sectores ({sectors.length})</span>
            <Badge variant="secondary">
              {sectors.filter(s => s.is_active).length} activos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sectors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay sectores disponibles
              </div>
            ) : (
              sectors.map((sector) => (
                <div
                  key={sector.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    sector.is_active 
                      ? 'bg-background hover:bg-muted/50' 
                      : 'bg-muted/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sector.name_es}</span>
                        {sector.name_en && (
                          <span className="text-sm text-muted-foreground">
                            ({sector.name_en})
                          </span>
                        )}
                        <Badge 
                          variant={sector.is_active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {sector.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Slug: {sector.slug}</span>
                        {sector.usage_count > 0 && (
                          <span>• {sector.usage_count} usos</span>
                        )}
                        <span>• Orden: {sector.display_order}</span>
                      </div>
                      {sector.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {sector.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSectorStatus(sector.id, sector.is_active)}
                    >
                      {sector.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(sector)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(sector)}
                      disabled={isDeleting || sector.usage_count > 0}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {(isCreateFormOpen || editingSector) && (
        <SectorForm
          sector={editingSector}
          onClose={closeForm}
          isOpen={isCreateFormOpen || !!editingSector}
        />
      )}
    </div>
  );
};

export default SectorManagement;