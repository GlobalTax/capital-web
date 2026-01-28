// ============= CALCULATOR ERRORS PAGE =============
// Admin dashboard for monitoring calculator errors

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Bug } from 'lucide-react';
import { useCalculatorErrors, type CalculatorErrorFilters, type CalculatorError, type DateRange, type ErrorType } from '@/features/valuation/hooks/useCalculatorErrors';
import { CalculatorErrorsKPIs } from './components/CalculatorErrorsKPIs';
import { CalculatorErrorsTable } from './components/CalculatorErrorsTable';
import { CalculatorErrorDetailModal } from './components/CalculatorErrorDetailModal';

const CalculatorErrorsPage = () => {
  const [filters, setFilters] = useState<CalculatorErrorFilters>({
    dateRange: '7d',
    errorType: 'all',
  });
  const [selectedError, setSelectedError] = useState<CalculatorError | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, stats, isLoading, refetch } = useCalculatorErrors(filters);

  const handleViewDetail = (error: CalculatorError) => {
    setSelectedError(error);
    setModalOpen(true);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <Bug className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Errores de Calculadora</h1>
            <p className="text-sm text-muted-foreground">
              Monitoreo de errores y recuperación de leads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Range Filter */}
          <Select
            value={filters.dateRange}
            onValueChange={(value: DateRange) => setFilters((prev) => ({ ...prev, dateRange: value }))}
          >
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="all">Todo</SelectItem>
            </SelectContent>
          </Select>

          {/* Error Type Filter */}
          <Select
            value={filters.errorType}
            onValueChange={(value: 'all' | ErrorType) => setFilters((prev) => ({ ...prev, errorType: value }))}
          >
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="calculation">Cálculo</SelectItem>
              <SelectItem value="submission">Envío</SelectItem>
              <SelectItem value="validation">Validación</SelectItem>
              <SelectItem value="network">Red</SelectItem>
              <SelectItem value="unknown">Desconocido</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <CalculatorErrorsKPIs stats={stats} isLoading={isLoading} />

      {/* Table */}
      <div className="bg-background rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Errores Recientes</h2>
          <p className="text-sm text-muted-foreground">
            {data.length} error{data.length !== 1 ? 'es' : ''} encontrado{data.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="p-4">
          <CalculatorErrorsTable
            data={data}
            isLoading={isLoading}
            onViewDetail={handleViewDetail}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <CalculatorErrorDetailModal
        error={selectedError}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default CalculatorErrorsPage;
