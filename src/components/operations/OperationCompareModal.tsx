import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Building2, MapPin, Users, Calendar, TrendingUp, Scale } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import { formatCurrency, normalizeValuationAmount } from '@/shared/utils/format';

interface CompareRow {
  label: string;
  icon?: React.ReactNode;
  getValue: (op: any) => React.ReactNode;
}

const compareRows: CompareRow[] = [
  {
    label: 'Sector',
    icon: <Building2 className="h-4 w-4" />,
    getValue: (op) => (
      <Badge variant="outline" className="font-normal">
        {op.sector}
      </Badge>
    ),
  },
  {
    label: 'Facturación',
    icon: <TrendingUp className="h-4 w-4 text-green-600" />,
    getValue: (op) =>
      op.revenue_amount ? (
        <span className="font-semibold text-green-600">
          {formatCurrency(normalizeValuationAmount(op.revenue_amount), op.valuation_currency || 'EUR')}
        </span>
      ) : (
        <span className="text-muted-foreground">Consultar</span>
      ),
  },
  {
    label: 'EBITDA',
    icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
    getValue: (op) =>
      op.ebitda_amount ? (
        <span className="font-semibold text-blue-600">
          {formatCurrency(normalizeValuationAmount(op.ebitda_amount), op.valuation_currency || 'EUR')}
        </span>
      ) : (
        <span className="text-muted-foreground">Consultar</span>
      ),
  },
  {
    label: 'Año',
    icon: <Calendar className="h-4 w-4" />,
    getValue: (op) => <span className="font-medium">{op.year}</span>,
  },
  {
    label: 'Empleados',
    icon: <Users className="h-4 w-4" />,
    getValue: (op) =>
      op.company_size_employees || op.company_size ? (
        <span>{op.company_size_employees || op.company_size}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    label: 'Ubicación',
    icon: <MapPin className="h-4 w-4" />,
    getValue: (op) =>
      op.geographic_location ? (
        <span>{op.geographic_location}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    label: 'Tipo',
    getValue: (op) =>
      op.deal_type ? (
        <Badge
          variant="outline"
          className={
            op.deal_type === 'sale'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-orange-50 text-orange-700 border-orange-200'
          }
        >
          {op.deal_type === 'sale' ? 'Venta' : 'Adquisición'}
        </Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    label: 'Destacado',
    getValue: (op) =>
      op.is_featured ? (
        <Badge className="bg-yellow-100 text-yellow-800">Sí</Badge>
      ) : (
        <span className="text-muted-foreground">No</span>
      ),
  },
];

export const OperationCompareModal: React.FC = () => {
  const { compareList, removeFromCompare, isCompareModalOpen, closeCompareModal } = useCompare();

  return (
    <Dialog open={isCompareModalOpen} onOpenChange={(open) => !open && closeCompareModal()}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Comparar Operaciones ({compareList.length})
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6 pt-4">
            {compareList.length < 2 ? (
              <div className="text-center py-12 text-muted-foreground">
                Selecciona al menos 2 operaciones para comparar
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-3 bg-muted/50 border-b font-medium text-sm w-32">
                        Característica
                      </th>
                      {compareList.map((op) => (
                        <th
                          key={op.id}
                          className="text-left p-3 bg-muted/50 border-b min-w-[180px]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {op.logo_url ? (
                                <img
                                  src={op.logo_url}
                                  alt={op.company_name}
                                  className="w-8 h-8 rounded object-contain bg-white p-1"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                                  <span className="text-primary font-bold text-xs">
                                    {op.company_name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <span className="font-semibold text-sm truncate">
                                {op.company_name}
                              </span>
                            </div>
                            <button
                              onClick={() => removeFromCompare(op.id)}
                              className="p-1 hover:bg-destructive/10 rounded transition-colors shrink-0"
                              aria-label={`Quitar ${op.company_name}`}
                            >
                              <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compareRows.map((row, idx) => (
                      <tr key={row.label} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                        <td className="p-3 border-b font-medium text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {row.icon}
                            {row.label}
                          </div>
                        </td>
                        {compareList.map((op) => (
                          <td key={op.id} className="p-3 border-b text-sm">
                            {row.getValue(op)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/30 flex justify-end">
          <Button variant="outline" onClick={closeCompareModal}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
