import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Copy, Trash2, Eye, Search, Filter, MoreHorizontal, X } from 'lucide-react';
import { useProfessionalValuations, useProfessionalValuationStats } from '@/hooks/useProfessionalValuations';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { ProfessionalValuationData } from '@/types/professionalValuation';
import { toast } from 'sonner';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  generated: { label: 'Generado', variant: 'outline' },
  sent: { label: 'Enviado', variant: 'default' },
  viewed: { label: 'Visto', variant: 'default' },
};

type StatusFilter = 'all' | 'draft' | 'generated' | 'sent' | 'viewed';

export default function ValoracionesPro() {
  const navigate = useNavigate();
  const { valuations, isLoading, deleteValuation, duplicateValuation, isDeleting } = useProfessionalValuations();
  const { data: stats } = useProfessionalValuationStats();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<StatusFilter[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [valuationToDelete, setValuationToDelete] = useState<string | null>(null);

  const toggleStatusFilter = (status: StatusFilter) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const filteredValuations = valuations.filter((v) => {
    const matchesSearch = !searchTerm ||
      v.clientCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.sector?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(v.status as StatusFilter);
    
    return matchesSearch && matchesStatus;
  });

  const hasActiveFilters = statusFilters.length > 0 || searchTerm !== '';

  const handleCreateNew = () => {
    navigate('/admin/valoraciones-pro/nueva');
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/valoraciones-pro/${id}`);
  };

  const handleDelete = async () => {
    if (!valuationToDelete) return;
    
    try {
      await deleteValuation(valuationToDelete);
      setDeleteDialogOpen(false);
      setValuationToDelete(null);
    } catch (error) {
      console.error('Error deleting valuation:', error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const newValuation = await duplicateValuation(id);
      if (newValuation?.id) {
        navigate(`/admin/valoraciones-pro/${newValuation.id}`);
      }
    } catch (error) {
      console.error('Error duplicating valuation:', error);
    }
  };

  const handleViewPdf = (valuation: ProfessionalValuationData) => {
    if (valuation.pdfUrl) {
      window.open(valuation.pdfUrl, '_blank');
    } else {
      toast.error('PDF no disponible. Genera el PDF primero.');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilters([]);
  };

  return (
    <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Valoraciones Pro</h1>
            <p className="text-muted-foreground">
              Sistema profesional de valoración empresarial
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Valoración
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Valoraciones</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Borradores</CardDescription>
                <CardTitle className="text-3xl text-amber-600">{stats.drafts}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Enviadas</CardDescription>
                <CardTitle className="text-3xl text-green-600">{stats.sent}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Valor Total Valorado</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(stats.totalValuation)}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Table Container - Following ContactsTable pattern */}
        <div className="relative rounded-md border overflow-hidden">
          {/* Toolbar */}
          <div className="bg-muted/30 border-b">
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empresa, contacto o sector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 bg-background"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Status Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    Estado
                    {statusFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-2 px-1 min-w-5 h-5">
                        {statusFilters.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={statusFilters.includes('draft')}
                    onCheckedChange={() => toggleStatusFilter('draft')}
                  >
                    Borrador
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilters.includes('generated')}
                    onCheckedChange={() => toggleStatusFilter('generated')}
                  >
                    Generado
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilters.includes('sent')}
                    onCheckedChange={() => toggleStatusFilter('sent')}
                  >
                    Enviado
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilters.includes('viewed')}
                    onCheckedChange={() => toggleStatusFilter('viewed')}
                  >
                    Visto
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* New Valuation Button */}
              <Button size="sm" className="h-9" onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva
              </Button>
            </div>

            {/* Results count and clear filters */}
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredValuations.length} de {valuations.length} valoración{valuations.length !== 1 ? 'es' : ''}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={clearFilters}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Table with scroll */}
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-450px)]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background border-b shadow-sm">
                <TableRow>
                  <TableHead className="w-48">Empresa</TableHead>
                  <TableHead className="w-36">Contacto</TableHead>
                  <TableHead className="w-28">Sector</TableHead>
                  <TableHead className="w-32 text-right">Valoración</TableHead>
                  <TableHead className="w-24">Estado</TableHead>
                  <TableHead className="w-28">Fecha</TableHead>
                  <TableHead className="text-right w-20">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-muted-foreground">Cargando valoraciones...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredValuations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="h-10 w-10 text-muted-foreground/40" />
                        <p className="text-muted-foreground">
                          {hasActiveFilters ? 'No hay valoraciones con estos filtros' : 'No hay valoraciones todavía'}
                        </p>
                        <Button variant="outline" size="sm" onClick={handleCreateNew}>
                          <Plus className="mr-2 h-4 w-4" />
                          Crear primera valoración
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredValuations.map((valuation) => {
                    const isNew = valuation.createdAt && 
                      new Date(valuation.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <TableRow 
                        key={valuation.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleEdit(valuation.id!)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[160px]">{valuation.clientCompany}</span>
                            {isNew && (
                              <Badge className="bg-green-500/10 text-green-600 border-green-200 text-[10px] px-1.5">
                                Nuevo
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="truncate block max-w-[120px]">{valuation.clientName}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{valuation.sector}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {valuation.valuationCentral ? formatCurrency(valuation.valuationCentral) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[valuation.status]?.variant || 'secondary'}>
                            {statusConfig[valuation.status]?.label || valuation.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {valuation.createdAt ? formatDate(valuation.createdAt) : '-'}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(valuation.id!)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver / Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleViewPdf(valuation)}
                                disabled={!valuation.pdfUrl}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Ver PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(valuation.id!)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setValuationToDelete(valuation.id!);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar valoración?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La valoración se eliminará permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}
