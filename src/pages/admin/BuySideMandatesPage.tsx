import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Copy, ToggleLeft, ToggleRight, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useBuySideMandates, BuySideMandate, BuySideMandateInput } from '@/hooks/useBuySideMandates';
import { BuySideMandateModal } from '@/components/admin/buyside/BuySideMandateModal';

const formatCurrency = (value: number | null) => {
  if (value === null) return '-';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
};

const BuySideMandatesPage: React.FC = () => {
  const { mandates, isLoading, createMandate, updateMandate, deleteMandate, toggleActive } = useBuySideMandates();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMandate, setEditingMandate] = useState<BuySideMandate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mandateToDelete, setMandateToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  const handleCreate = () => {
    setEditingMandate(null);
    setModalOpen(true);
  };

  const handleEdit = (mandate: BuySideMandate) => {
    setEditingMandate(mandate);
    setModalOpen(true);
  };

  const handleDuplicate = (mandate: BuySideMandate) => {
    const duplicated: BuySideMandateInput = {
      title: `${mandate.title} (copia)`,
      description: mandate.description,
      sector: mandate.sector,
      subsector: mandate.subsector,
      geographic_scope: mandate.geographic_scope,
      revenue_min: mandate.revenue_min,
      revenue_max: mandate.revenue_max,
      ebitda_min: mandate.ebitda_min,
      ebitda_max: mandate.ebitda_max,
      requirements: mandate.requirements,
      is_active: false,
      is_new: true,
    };
    createMandate.mutate(duplicated);
  };

  const handleSave = (mandate: BuySideMandateInput) => {
    if (editingMandate) {
      updateMandate.mutate({ id: editingMandate.id, ...mandate });
    } else {
      createMandate.mutate(mandate);
    }
    setModalOpen(false);
    setEditingMandate(null);
  };

  const handleDelete = (id: string) => {
    setMandateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (mandateToDelete) {
      deleteMandate.mutate(mandateToDelete);
      setDeleteDialogOpen(false);
      setMandateToDelete(null);
    }
  };

  const handleToggleActive = (mandate: BuySideMandate) => {
    toggleActive.mutate({ id: mandate.id, is_active: !mandate.is_active });
  };

  // Get unique sectors for filter
  const sectors = Array.from(new Set(mandates?.map(m => m.sector) || []));

  // Filter mandates
  const filteredMandates = mandates?.filter(mandate => {
    const matchesSearch = mandate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mandate.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mandate.geographic_scope.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && mandate.is_active) ||
      (statusFilter === 'inactive' && !mandate.is_active);
    
    const matchesSector = sectorFilter === 'all' || mandate.sector === sectorFilter;

    return matchesSearch && matchesStatus && matchesSector;
  }) || [];

  const activeCount = mandates?.filter(m => m.is_active).length || 0;
  const totalCount = mandates?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mandatos de Compra</h1>
          <p className="text-muted-foreground">
            Gestiona los perfiles de empresas buscadas por inversores ({activeCount} activos de {totalCount})
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Mandato
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive')}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los sectores</SelectItem>
            {sectors.map(sector => (
              <SelectItem key={sector} value={sector}>{sector}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Título</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Geografía</TableHead>
              <TableHead>Facturación</TableHead>
              <TableHead>EBITDA</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Cargando mandatos...
                </TableCell>
              </TableRow>
            ) : filteredMandates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No se encontraron mandatos
                </TableCell>
              </TableRow>
            ) : (
              filteredMandates.map((mandate) => (
                <TableRow key={mandate.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{mandate.title}</span>
                      {mandate.is_new && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Nuevo
                        </Badge>
                      )}
                    </div>
                    {mandate.subsector && (
                      <span className="text-sm text-muted-foreground">{mandate.subsector}</span>
                    )}
                  </TableCell>
                  <TableCell>{mandate.sector}</TableCell>
                  <TableCell>{mandate.geographic_scope}</TableCell>
                  <TableCell>
                    {mandate.revenue_min || mandate.revenue_max ? (
                      <span className="text-sm">
                        {formatCurrency(mandate.revenue_min)} - {formatCurrency(mandate.revenue_max)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {mandate.ebitda_min || mandate.ebitda_max ? (
                      <span className="text-sm">
                        {formatCurrency(mandate.ebitda_min)} - {formatCurrency(mandate.ebitda_max)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={mandate.is_active ? 'default' : 'secondary'}>
                      {mandate.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(mandate)}
                        title={mandate.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {mandate.is_active ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(mandate)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicate(mandate)}
                        title="Duplicar"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(mandate.id)}
                        title="Eliminar"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      <BuySideMandateModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mandate={editingMandate}
        onSave={handleSave}
        isLoading={createMandate.isPending || updateMandate.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar mandato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El mandato será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BuySideMandatesPage;
