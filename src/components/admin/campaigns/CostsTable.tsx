// ============= COSTS TABLE =============
// Tabla de historial de gastos de campañas

import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  FileText,
  Calendar,
  Euro
} from 'lucide-react';
import { CampaignCost } from '@/hooks/useCampaignCosts';
import { cn } from '@/lib/utils';

interface CostsTableProps {
  costs: CampaignCost[];
  onEdit?: (cost: CampaignCost) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

const CHANNEL_CONFIG: Record<string, { label: string; color: string }> = {
  meta_ads: { label: 'Meta Ads', color: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  google_ads: { label: 'Google Ads', color: 'bg-green-100 text-green-800 hover:bg-green-100' },
  linkedin_ads: { label: 'LinkedIn Ads', color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100' },
  other: { label: 'Otro', color: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const formatDate = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), 'd MMM', { locale: es });
  } catch {
    return dateStr;
  }
};

const CostsTable: React.FC<CostsTableProps> = ({ 
  costs, 
  onEdit, 
  onDelete,
  isLoading 
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteConfirm && onDelete) {
      onDelete(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Gastos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!costs || costs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Gastos
          </CardTitle>
          <CardDescription>
            Aquí aparecerán los gastos que registres
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Euro className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No hay gastos registrados</p>
            <p className="text-muted-foreground text-sm">
              Haz clic en "Añadir Gasto" para empezar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Gastos
          </CardTitle>
          <CardDescription>
            {costs.length} registro{costs.length !== 1 ? 's' : ''} de gastos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Campaña</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                  <TableHead className="text-right">Impresiones</TableHead>
                  <TableHead className="text-right">Clics</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="text-right">CPC</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.map((cost) => {
                  const channelConfig = CHANNEL_CONFIG[cost.channel] || CHANNEL_CONFIG.other;
                  
                  return (
                    <TableRow key={cost.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(cost.period_start)}
                            {cost.period_start !== cost.period_end && (
                              <> - {formatDate(cost.period_end)}</>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={cn('font-normal', channelConfig.color)}
                        >
                          {channelConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {cost.campaign_name || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(cost.amount))}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {cost.impressions?.toLocaleString('es-ES') || '-'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {cost.clicks?.toLocaleString('es-ES') || '-'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {cost.ctr ? `${cost.ctr.toFixed(2)}%` : '-'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {cost.cpc ? formatCurrency(Number(cost.cpc)) : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit?.(cost)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setDeleteConfirm(cost.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro de gasto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CostsTable;
