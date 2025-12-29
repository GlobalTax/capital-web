import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Download
} from 'lucide-react';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface RowAction<T> {
  label: string;
  onClick: (item: T) => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

export interface BulkAction<T> {
  label: string;
  onClick: (items: T[]) => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  rowActions?: RowAction<T>[];
  bulkActions?: BulkAction<T>[];
  enableSelection?: boolean;
  enableSearch?: boolean;
  enableExport?: boolean;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  isLoading = false,
  searchPlaceholder = 'Buscar...',
  searchFields = [],
  rowActions = [],
  bulkActions = [],
  enableSelection = false,
  enableSearch = true,
  enableExport = false,
  pageSize = 10,
  emptyTitle,
  emptyDescription,
  onRowClick,
  className
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!search || searchFields.length === 0) return data;
    
    const searchLower = search.toLowerCase();
    return data.filter(item => 
      searchFields.some(field => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(searchLower);
      })
    );
  }, [data, search, searchFields]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Selection handlers
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map(item => String(item[keyField]))));
    }
  };

  const selectedItems = data.filter(item => selectedIds.has(String(item[keyField])));

  // Sort handler
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc');
      if (sortDirection === 'desc') setSortKey(null);
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Export handler
  const handleExport = () => {
    const headers = columns.map(col => col.header).join(',');
    const rows = sortedData.map(item => 
      columns.map(col => {
        const value = item[col.key];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value ?? '';
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <LoadingState variant="table" rows={pageSize} columns={columns.length} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState 
        preset="no-data"
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          {enableSearch && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
          )}
          
          {selectedIds.size > 0 && bulkActions.length > 0 && (
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} seleccionados
              </span>
              {bulkActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => action.onClick(selectedItems)}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {enableExport && (
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              {enableSelection && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.size === paginatedData.length && paginatedData.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
              )}
              {columns.map(column => (
                <TableHead 
                  key={column.key}
                  className={cn(
                    column.sortable && "cursor-pointer select-none hover:bg-muted/50",
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortKey === column.key && (
                      sortDirection === 'asc' 
                        ? <ChevronUp className="h-4 w-4" />
                        : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
              ))}
              {rowActions.length > 0 && (
                <TableHead className="w-12" />
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (enableSelection ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)}
                  className="h-32"
                >
                  <EmptyState preset="no-results" />
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map(item => {
                const id = String(item[keyField]);
                return (
                  <TableRow 
                    key={id}
                    className={cn(
                      onRowClick && "cursor-pointer hover:bg-muted/50",
                      selectedIds.has(id) && "bg-muted/30"
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {enableSelection && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(id)}
                          onCheckedChange={() => toggleSelect(id)}
                        />
                      </TableCell>
                    )}
                    {columns.map(column => (
                      <TableCell key={column.key} className={column.className}>
                        {column.render 
                          ? column.render(item) 
                          : item[column.key] ?? '-'
                        }
                      </TableCell>
                    ))}
                    {rowActions.length > 0 && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {rowActions.map((action, index) => (
                              <DropdownMenuItem
                                key={index}
                                onClick={() => action.onClick(item)}
                                className={action.variant === 'destructive' ? 'text-destructive' : ''}
                              >
                                {action.icon}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
