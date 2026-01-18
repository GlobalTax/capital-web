// ============= MNA FAVORITES TABLE =============
// Tabla de boutiques favoritas M&A

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Globe, Linkedin, Users, MapPin, MoreHorizontal, Trash2, ExternalLink } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavoriteMNABoutiques } from '@/hooks/useMNABoutiqueFavorites';
import { useDeleteMNABoutique } from '@/hooks/useMNABoutiques';
import { MNABoutiqueFavoriteButton } from './MNABoutiqueFavoriteButton';
import type { MNABoutique, MNABoutiqueStatus, MNABoutiqueTier } from '@/types/mnaBoutique';
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

export function MNAFavoritesTable() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data: boutiques, isLoading } = useFavoriteMNABoutiques();
  const deleteMutation = useDeleteMNABoutique();

  // Filter by search
  const filteredBoutiques = boutiques?.filter(b => {
    if (!search) return true;
    const s = search.toLowerCase();
    return b.name?.toLowerCase().includes(s) || 
           b.country_base?.toLowerCase().includes(s);
  }) || [];

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
        <Skeleton className="h-10 w-64" />
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
        {/* Search */}
        <Input
          placeholder="Buscar en favoritos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {filteredBoutiques.length} boutiques favoritas
        </p>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
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
              {filteredBoutiques.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No hay boutiques favoritas
                  </TableCell>
                </TableRow>
              ) : (
                filteredBoutiques.map((boutique) => (
                  <TableRow 
                    key={boutique.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(boutique)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <MNABoutiqueFavoriteButton boutiqueId={boutique.id} />
                    </TableCell>
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
