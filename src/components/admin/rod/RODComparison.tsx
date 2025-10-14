import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRODComparison } from '@/hooks/useRODComparison';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface RODComparisonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentIds: string[];
}

export const RODComparison = ({ open, onOpenChange, documentIds }: RODComparisonProps) => {
  const { data: comparisons, isLoading } = useRODComparison(documentIds);

  const getTrend = (values: number[], index: number) => {
    if (index === 0 || values.length < 2) return 'neutral';
    const current = values[index];
    const previous = values[index - 1];
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
  };

  const exportComparison = () => {
    if (!comparisons) return;

    const csvContent = [
      ['Métrica', ...comparisons.map(c => c.version)].join(','),
      ['Título', ...comparisons.map(c => c.title)].join(','),
      ['Descargas', ...comparisons.map(c => c.stats.totalDownloads)].join(','),
      ['Leads', ...comparisons.map(c => c.stats.totalLeads)].join(','),
      ['Email open rate', ...comparisons.map(c => `${c.stats.emailOpenRate}%`)].join(','),
      ['Score promedio', ...comparisons.map(c => c.stats.avgLeadScore)].join(','),
      ['Leads score >70', ...comparisons.map(c => c.stats.highScoreLeads)].join(','),
      ['Días activa', ...comparisons.map(c => c.stats.daysActive)].join(','),
      ['Conversión', ...comparisons.map(c => c.stats.totalDownloads > 0 ? `${Math.round((c.stats.totalLeads / c.stats.totalDownloads) * 100)}%` : '0%')].join(','),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `comparativa_rod_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const metrics = [
    { key: 'totalDownloads', label: 'Descargas totales', isHigherBetter: true },
    { key: 'totalLeads', label: 'Leads generados', isHigherBetter: true },
    { key: 'emailOpenRate', label: 'Email open rate (%)', isHigherBetter: true },
    { key: 'avgLeadScore', label: 'Score promedio', isHigherBetter: true },
    { key: 'highScoreLeads', label: 'Leads score >70', isHigherBetter: true },
    { key: 'daysActive', label: 'Días activa', isHigherBetter: false }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comparativa de Versiones ROD</DialogTitle>
          <DialogDescription>
            Análisis comparativo de las versiones seleccionadas ({documentIds.length})
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : comparisons && comparisons.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={exportComparison}>
                <Download className="h-4 w-4 mr-2" />
                Exportar comparativa
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-muted font-bold">Métrica</TableHead>
                    {comparisons.map((comp) => (
                      <TableHead key={comp.documentId} className="bg-muted text-center">
                        <div className="font-bold">{comp.version}</div>
                        <div className="text-xs font-normal text-muted-foreground">
                          {comp.title}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => {
                    const values = comparisons.map(c => (c.stats as any)[metric.key]);
                    const maxValue = Math.max(...values);
                    const minValue = Math.min(...values);

                    return (
                      <TableRow key={metric.key}>
                        <TableCell className="font-medium">{metric.label}</TableCell>
                        {comparisons.map((comp, index) => {
                          const value = (comp.stats as any)[metric.key];
                          const isBest = metric.isHigherBetter ? value === maxValue : value === minValue;
                          const isWorst = metric.isHigherBetter ? value === minValue : value === maxValue;
                          const trend = getTrend(values, index);

                          return (
                            <TableCell key={comp.documentId} className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className={isBest ? 'font-bold text-green-600' : isWorst ? 'text-muted-foreground' : ''}>
                                  {metric.key.includes('Rate') || metric.key.includes('Percent') 
                                    ? `${value}%` 
                                    : value}
                                </span>
                                {isBest && <Badge variant="default" className="text-xs">MEJOR</Badge>}
                                {trend === 'up' && <ArrowUp className="h-3 w-3 text-green-600" />}
                                {trend === 'down' && <ArrowDown className="h-3 w-3 text-red-600" />}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}

                  {/* Conversion rate row */}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-medium">Conversión (descarga→lead)</TableCell>
                    {comparisons.map((comp) => {
                      const conversionRate = comp.stats.totalDownloads > 0
                        ? Math.round((comp.stats.totalLeads / comp.stats.totalDownloads) * 100)
                        : 0;
                      return (
                        <TableCell key={comp.documentId} className="text-center font-medium">
                          {conversionRate}%
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Selecciona al menos 2 versiones para comparar
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
