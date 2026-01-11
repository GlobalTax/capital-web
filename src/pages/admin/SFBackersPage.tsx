// ============= SF BACKERS PAGE =============
// Gestión de Backers e Inversores

import React, { useState } from 'react';
import { Plus, Search, Users, Building, Wallet, MoreHorizontal, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSFBackers, useCreateSFBacker, useDeleteSFBacker } from '@/hooks/useSFBackers';
import { Skeleton } from '@/components/ui/skeleton';
import { SFBackerType, SFBackerFormData } from '@/types/searchFunds';

const backerTypeLabels: Record<SFBackerType, string> = {
  fund: 'Fondo',
  family_office: 'Family Office',
  angel: 'Ángel Inversor',
  bank: 'Banco',
  accelerator: 'Aceleradora',
  other: 'Otro',
};

const backerTypeColors: Record<SFBackerType, string> = {
  fund: 'bg-blue-100 text-blue-800',
  family_office: 'bg-purple-100 text-purple-800',
  angel: 'bg-green-100 text-green-800',
  bank: 'bg-orange-100 text-orange-800',
  accelerator: 'bg-yellow-100 text-yellow-800',
  other: 'bg-slate-100 text-slate-800',
};

export const SFBackersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<SFBackerFormData>>({
    type: 'fund',
  });

  const { data: backers, isLoading } = useSFBackers();
  const createMutation = useCreateSFBacker();
  const deleteMutation = useDeleteSFBacker();

  const filteredBackers = React.useMemo(() => {
    if (!backers) return [];
    if (!search) return backers;
    const searchLower = search.toLowerCase();
    return backers.filter(b => 
      b.name.toLowerCase().includes(searchLower) ||
      b.type.toLowerCase().includes(searchLower)
    );
  }, [backers, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) return;
    
    await createMutation.mutateAsync(formData as SFBackerFormData);
    setIsDialogOpen(false);
    setFormData({ type: 'fund' });
  };

  // Stats by type
  const statsByType = React.useMemo(() => {
    if (!backers) return {};
    return backers.reduce((acc, b) => {
      acc[b.type] = (acc[b.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [backers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Backers</h1>
          <p className="text-muted-foreground">
            Gestiona los backers e inversores de Search Funds
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Backer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Backer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del backer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => setFormData({ ...formData, type: v as SFBackerType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(backerTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sitio Web</Label>
                <Input
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionales..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backers?.length || 0}</div>
          </CardContent>
        </Card>
        {Object.entries(backerTypeLabels).slice(0, 4).map(([type, label]) => (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              {type === 'fund' && <Wallet className="h-4 w-4 text-blue-500" />}
              {type === 'family_office' && <Building className="h-4 w-4 text-purple-500" />}
              {type === 'angel' && <Users className="h-4 w-4 text-green-500" />}
              {type === 'bank' && <Building className="h-4 w-4 text-orange-500" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsByType[type] || 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar backers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBackers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No se encontraron backers
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBackers.map((backer) => (
                    <TableRow key={backer.id}>
                      <TableCell className="font-medium">{backer.name}</TableCell>
                      <TableCell>
                        <Badge className={backerTypeColors[backer.type]}>
                          {backerTypeLabels[backer.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {backer.website ? (
                          <a 
                            href={backer.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Visitar
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                          {backer.notes || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                if (confirm('¿Eliminar este backer?')) {
                                  deleteMutation.mutate(backer.id);
                                }
                              }}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SFBackersPage;
