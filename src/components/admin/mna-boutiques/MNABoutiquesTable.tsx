import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Globe, Linkedin, Users, MapPin, MoreHorizontal, Trash2, ExternalLink } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useMNABoutiques, useMNABoutiqueCountries, useDeleteMNABoutique } from '@/hooks/useMNABoutiques';
import type { MNABoutique, MNABoutiqueFilters, MNABoutiqueStatus, MNABoutiqueTier } from '@/types/mnaBoutique';
import { MNA_BOUTIQUE_STATUS_LABELS, MNA_TIER_LABELS } from '@/types/mnaBoutique';

const getTierBadgeVariant = (tier: MNABoutiqueTier | null) => {
  switch (tier) {
    case 'tier_1': return 'default';
    case 'tier_2': return 'secondary';
    case 'tier_3': return 'outline';
    case 'specialist': return 'default';
    default: return 'outline';
  }
};

const getStatusBadgeVariant = (status: MNABoutiqueStatus) => {
  switch (status) {
    case 'active': return 'default';
    case 'inactive': return 'secondary';
    case 'acquired': return 'outline';
    case 'closed': return 'destructive';
    default: return 'outline';
  }
};

export function MNABoutiquesTable() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<MNABoutiqueFilters>({});
  const { data: boutiques, isLoading } = useMNABoutiques(filters);
  const { data: countries } = useMNABoutiqueCountries();
  const deleteMutation = useDeleteMNABoutique();

  const handleRowClick = (boutique: MNABoutique) => {
    navigate(`/admin/mna-directory/${boutique.id}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta boutique?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Buscar boutique..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-64"
          />
          <Select
            value={filters.status || 'all'}
            onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? undefined : v as MNABoutiqueStatus })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(MNA_BOUTIQUE_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.tier || 'all'}
            onValueChange={(v) => setFilters({ ...filters, tier: v === 'all' ? undefined : v as MNABoutiqueTier })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(MNA_TIER_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.country || 'all'}
            onValueChange={(v) => setFilters({ ...filters, country: v === 'all' ? undefined : v })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="País" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {countries?.map((country) => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {boutiques?.length || 0} boutiques encontradas
        </p>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Boutique</TableHead>
                <TableHead className="min-w-[100px]">País</TableHead>
                <TableHead className="min-w-[100px]">Tier</TableHead>
                <TableHead className="min-w-[100px]">Empleados</TableHead>
                <TableHead className="min-w-[150px]">Especialización</TableHead>
                <TableHead className="min-w-[100px]">Estado</TableHead>
                <TableHead className="min-w-[100px]">Links</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boutiques?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay boutiques registradas
                  </TableCell>
                </TableRow>
              ) : (
                boutiques?.map((boutique) => (
                  <TableRow 
                    key={boutique.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(boutique)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-normal">{boutique.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{boutique.country_base || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {boutique.tier ? (
                        <Badge variant={getTierBadgeVariant(boutique.tier)}>
                          {MNA_TIER_LABELS[boutique.tier]}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{boutique.employee_count || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {boutique.specialization?.slice(0, 2).map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {(boutique.specialization?.length || 0) > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{boutique.specialization!.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(boutique.status)}>
                        {MNA_BOUTIQUE_STATUS_LABELS[boutique.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {boutique.website && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a href={boutique.website} target="_blank" rel="noopener noreferrer">
                                <Globe className="h-4 w-4 text-muted-foreground hover:text-primary" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>Web</TooltipContent>
                          </Tooltip>
                        )}
                        {boutique.linkedin_url && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a href={boutique.linkedin_url} target="_blank" rel="noopener noreferrer">
                                <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>LinkedIn</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/mna-directory/${boutique.id}`)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => handleDelete(e as any, boutique.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
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
        </div>
      </div>
    </TooltipProvider>
  );
}
