// ============= EMPRESAS TABLE =============
// Tabla reutilizable para mostrar empresas

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Building2, 
  Edit, 
  Trash2, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { Empresa } from '@/hooks/useEmpresas';
import { EmpresaFavoriteButton } from './EmpresaFavoriteButton';
import { formatCompactCurrency } from '@/shared/utils/format';

interface EmpresasTableProps {
  empresas: Empresa[];
  isLoading: boolean;
  showFavorites?: boolean;
  emptyMessage?: string;
  emptyAction?: () => void;
  emptyActionLabel?: string;
  onEdit: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
}

export const EmpresasTable: React.FC<EmpresasTableProps> = ({
  empresas,
  isLoading,
  showFavorites = true,
  emptyMessage = 'No se encontraron empresas',
  emptyAction,
  emptyActionLabel = 'Crear empresa',
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  const calculateMargin = (empresa: Empresa) => {
    if (!empresa.ebitda || !empresa.facturacion) return null;
    return ((empresa.ebitda / empresa.facturacion) * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (empresas.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">{emptyMessage}</p>
        {emptyAction && (
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={emptyAction}
          >
            <Plus className="h-4 w-4 mr-2" />
            {emptyActionLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {showFavorites && <TableHead className="w-10"></TableHead>}
            <TableHead>Empresa</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead className="text-right">Facturación</TableHead>
            <TableHead className="text-right">EBITDA</TableHead>
            <TableHead className="text-right">Margen</TableHead>
            <TableHead className="text-center">Empleados</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empresas.map((empresa) => (
            <TableRow 
              key={empresa.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/admin/empresas/${empresa.id}`)}
            >
              {showFavorites && (
                <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                  <EmpresaFavoriteButton empresaId={empresa.id} />
                </TableCell>
              )}
              <TableCell>
                <div>
                  <div className="font-medium">{empresa.nombre}</div>
                  {empresa.cif && (
                    <div className="text-xs text-muted-foreground">
                      CIF: {empresa.cif}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="w-fit">
                    {empresa.sector}
                  </Badge>
                  {empresa.subsector && (
                    <span className="text-xs text-muted-foreground">
                      {empresa.subsector}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {empresa.ubicacion || '-'}
              </TableCell>
              <TableCell className="text-right font-medium">
                {empresa.facturacion 
                  ? formatCompactCurrency(empresa.facturacion) 
                  : '-'}
              </TableCell>
              <TableCell className="text-right font-medium">
                {empresa.ebitda 
                  ? formatCompactCurrency(empresa.ebitda) 
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                {calculateMargin(empresa) 
                  ? `${calculateMargin(empresa)}%` 
                  : '-'}
              </TableCell>
              <TableCell className="text-center">
                {empresa.empleados ?? '-'}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-wrap gap-1 justify-center">
                  {empresa.es_target && (
                    <Badge className="bg-green-100 text-green-800">
                      Target
                    </Badge>
                  )}
                  {empresa.potencial_search_fund && (
                    <Badge className="bg-purple-100 text-purple-800">
                      SF
                    </Badge>
                  )}
                  {!empresa.es_target && !empresa.potencial_search_fund && (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  {empresa.sitio_web && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          empresa.sitio_web?.startsWith('http') 
                            ? empresa.sitio_web 
                            : `https://${empresa.sitio_web}`,
                          '_blank'
                        );
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(empresa);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(empresa);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmpresasTable;
