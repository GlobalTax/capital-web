// ============= CALCULATOR ERRORS TABLE =============
// Table component for displaying calculator errors

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, AlertTriangle, Send, AlertCircle, Wifi, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalculatorError, ErrorType } from '@/features/valuation/hooks/useCalculatorErrors';
import { TableSkeleton } from '@/components/admin/shared';

interface CalculatorErrorsTableProps {
  data: CalculatorError[];
  isLoading: boolean;
  onViewDetail: (error: CalculatorError) => void;
}

const errorTypeConfig: Record<ErrorType, { label: string; color: string; icon: React.ElementType }> = {
  calculation: { label: 'Cálculo', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
  submission: { label: 'Envío', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Send },
  validation: { label: 'Validación', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
  network: { label: 'Red', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Wifi },
  unknown: { label: 'Desconocido', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: HelpCircle },
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const CalculatorErrorsTable = ({ data, isLoading, onViewDetail }: CalculatorErrorsTableProps) => {
  if (isLoading) {
    return <TableSkeleton rows={5} columns={6} />;
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No hay errores registrados</p>
        <p className="text-sm">Los errores de la calculadora aparecerán aquí cuando ocurran.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">Tipo</TableHead>
            <TableHead className="min-w-[200px]">Mensaje</TableHead>
            <TableHead className="w-[120px]">Componente</TableHead>
            <TableHead className="w-[180px]">Lead</TableHead>
            <TableHead className="w-[140px]">Fecha</TableHead>
            <TableHead className="w-[80px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((error) => {
            const typeConfig = errorTypeConfig[error.error_type] || errorTypeConfig.unknown;
            const TypeIcon = typeConfig.icon;
            const leadInfo = error.company_data?.email || error.company_data?.contact_name || 'N/A';
            
            return (
              <TableRow key={error.id} className="hover:bg-muted/30">
                <TableCell>
                  <Badge variant="outline" className={`${typeConfig.color} flex items-center gap-1 w-fit`}>
                    <TypeIcon className="h-3 w-3" />
                    {typeConfig.label}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {truncateText(error.error_message, 60)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {error.component || 'N/A'}
                </TableCell>
                <TableCell className="text-sm">
                  <span className="truncate block max-w-[160px]" title={leadInfo}>
                    {truncateText(leadInfo, 25)}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(error.created_at), 'dd/MM/yy HH:mm', { locale: es })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail(error)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver detalle</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
