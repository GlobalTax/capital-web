// ============= OPTIMIZED DATA TABLE =============
// Componente de tabla optimizado con virtualización y filtros

import React, { useMemo, useState, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';

export interface Column<T = any> {
  key: string;
  label: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'badge';
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  height?: number;
  itemHeight?: number;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  searchable?: boolean;
  filterable?: boolean;
  title?: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  height = 600,
  itemHeight = 60,
  loading = false,
  error,
  onRefresh,
  onExport,
  searchable = true,
  filterable = true,
  title
}: DataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Filtrado y búsqueda optimizada
  const filteredData = useMemo(() => {
    let result = [...data];

    // Aplicar búsqueda
    if (searchTerm && searchable) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(item => String(item[key]) === value);
      }
    });

    // Aplicar ordenamiento
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === bVal) return 0;
        
        const comparison = aVal < bVal ? -1 : 1;
        return sortConfig.direction === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortConfig, searchable]);

  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const getUniqueValues = useCallback((key: string) => {
    const values = Array.from(new Set(data.map(item => String(item[key]))));
    return values.filter(Boolean).sort();
  }, [data]);

  const renderCell = useCallback((column: Column<T>, value: any, row: T) => {
    if (column.render) {
      return column.render(value, row);
    }

    switch (column.type) {
      case 'badge':
        return <Badge variant="secondary">{value}</Badge>;
      case 'boolean':
        return value ? '✅' : '❌';
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      default:
        return String(value || '');
    }
  }, []);

  // Componente de fila virtualizada
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = filteredData[index];
    
    return (
      <div 
        style={style} 
        className="flex items-center border-b border-border/50 hover:bg-muted/50 transition-colors"
      >
        {columns.map((column, colIndex) => (
          <div
            key={column.key}
            className="px-4 py-2 text-sm flex-shrink-0"
            style={{ width: column.width || 150 }}
          >
            {renderCell(column, item[column.key], item)}
          </div>
        ))}
      </div>
    );
  }, [filteredData, columns, renderCell]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p className="mb-4">Error al cargar los datos: {error}</p>
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      {title && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <div className="flex gap-2">
              {onExport && (
                <Button onClick={onExport} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              )}
              {onRefresh && (
                <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        {/* Controles de búsqueda y filtros */}
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex gap-4 flex-wrap">
            {searchable && (
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
            
            {filterable && columns.filter(c => c.filterable).map(column => (
              <Select 
                key={column.key}
                value={filters[column.key] || 'all'}
                onValueChange={(value) => handleFilterChange(column.key, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={`Filtrar ${column.label}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {getUniqueValues(column.key).map(value => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredData.length} de {data.length} registros
          </div>
        </div>

        {/* Encabezados */}
        <div className="flex bg-muted/30 border-b border-border font-medium text-sm">
          {columns.map(column => (
            <div
              key={column.key}
              className={`px-4 py-3 flex-shrink-0 ${
                column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''
              }`}
              style={{ width: column.width || 150 }}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <div className="flex items-center gap-2">
                {column.label}
                {column.sortable && sortConfig?.key === column.key && (
                  <span className="text-xs">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Contenido de la tabla */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          )}
          
          {filteredData.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm || Object.values(filters).some(f => f && f !== 'all') 
                ? 'No se encontraron resultados con los filtros aplicados'
                : 'No hay datos para mostrar'
              }
            </div>
          ) : (
            <List
              height={height}
              itemCount={filteredData.length}
              itemSize={itemHeight}
              width="100%"
            >
              {Row}
            </List>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataTable;