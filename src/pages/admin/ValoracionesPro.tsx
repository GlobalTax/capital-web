import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Send, Copy, Trash2, Eye, Search, Filter, MoreHorizontal } from 'lucide-react';
import AdminLayout from '@/features/admin/components/AdminLayout';
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
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
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

export default function ValoracionesPro() {
  const navigate = useNavigate();
  const handleLogout = () => navigate('/admin/login');
  const { valuations, isLoading, deleteValuation, duplicateValuation, isDeleting, isDuplicating } = useProfessionalValuations();
  const { data: stats } = useProfessionalValuationStats();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [valuationToDelete, setValuationToDelete] = useState<string | null>(null);

  // Filter valuations
  const filteredValuations = valuations.filter((v) => {
    const matchesSearch = 
      v.clientCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.sector?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  return (
    <AdminLayout onLogout={handleLogout}>
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

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por empresa, contacto o sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="generated">Generado</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="viewed">Visto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table - Premium Experience */}
        <Card className="overflow-hidden border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="max-h-[calc(100vh-420px)] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-muted/30 backdrop-blur-sm">
                    <TableRow className="border-b-2 border-border/50 hover:bg-transparent">
                      <TableHead className="min-w-[200px] whitespace-nowrap font-semibold text-foreground">Empresa</TableHead>
                      <TableHead className="min-w-[150px] whitespace-nowrap font-semibold text-foreground">Contacto</TableHead>
                      <TableHead className="min-w-[120px] whitespace-nowrap font-semibold text-foreground">Sector</TableHead>
                      <TableHead className="min-w-[140px] whitespace-nowrap font-semibold text-foreground text-right">Valoración</TableHead>
                      <TableHead className="min-w-[110px] whitespace-nowrap font-semibold text-foreground">Estado</TableHead>
                      <TableHead className="min-w-[110px] whitespace-nowrap font-semibold text-foreground">Fecha</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            <span className="text-muted-foreground">Cargando valoraciones...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredValuations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-12 w-12 text-muted-foreground/50" />
                            <span className="text-muted-foreground">No se encontraron valoraciones</span>
                            <Button variant="outline" size="sm" onClick={handleCreateNew} className="mt-2">
                              <Plus className="mr-2 h-4 w-4" />
                              Crear primera valoración
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredValuations.map((valuation, index) => {
                        const isNew = valuation.createdAt && 
                          new Date(valuation.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                        
                        return (
                          <TableRow 
                            key={valuation.id} 
                            className="cursor-pointer transition-colors hover:bg-muted/40 group"
                            onClick={() => handleEdit(valuation.id!)}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <TableCell className="font-medium whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="truncate max-w-[180px]" title={valuation.clientCompany}>
                                  {valuation.clientCompany}
                                </span>
                                {isNew && (
                                  <Badge variant="default" className="bg-success text-success-foreground text-[10px] px-1.5 py-0">
                                    Nuevo
                                  </Badge>
                                )}
                                {valuation.version && valuation.version > 1 && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    v{valuation.version}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <span className="truncate max-w-[140px] block" title={valuation.clientName}>
                                {valuation.clientName}
                              </span>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge variant="secondary" className="font-normal text-xs">
                                {valuation.sector}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold whitespace-nowrap tabular-nums">
                              {valuation.valuationCentral ? formatCurrency(valuation.valuationCentral) : '-'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge variant={statusConfig[valuation.status]?.variant || 'secondary'}>
                                {statusConfig[valuation.status]?.label || valuation.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap tabular-nums">
                              {valuation.createdAt ? formatDate(valuation.createdAt) : '-'}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()} className="whitespace-nowrap">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
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
                                    className="text-destructive focus:text-destructive"
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
          </CardContent>
        </Card>

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
    </AdminLayout>
  );
}
