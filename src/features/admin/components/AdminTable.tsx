// ============= ADMIN TABLE COMPONENT =============
// Standardized table component for admin data display

import React from 'react';
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
import { Card } from '@/components/ui/card';
import { Loader2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableAction<T> {
  label: string;
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive';
  hidden?: (item: T) => boolean;
}

interface AdminTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function AdminTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  emptyMessage = "No hay datos disponibles",
  onRowClick,
  className
}: AdminTableProps<T>) {
  
  const renderCell = (item: T, column: TableColumn<T>) => {
    if (column.render) {
      return column.render(item);
    }
    
    const value = item[column.key as keyof T];
    
    // Handle common data types
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Sí' : 'No'}
        </Badge>
      );
    }
    
    // Check if it's a valid date
    if (value && (
      (typeof value === 'object' && typeof (value as any).getTime === 'function') ||
      (typeof value === 'string' && !isNaN(Date.parse(value)))
    )) {
      const dateValue = new Date(value as any);
      if (!isNaN(dateValue.getTime())) {
        return new Intl.DateTimeFormat('es-ES').format(dateValue);
      }
    }
    
    if (typeof value === 'string' && value.includes('@')) {
      return <span className="font-mono text-sm">{value}</span>;
    }
    
    return String(value || '-');
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando datos...</span>
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          {emptyMessage}
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={String(column.key)} 
                style={{ width: column.width }}
              >
                {column.label}
              </TableHead>
            ))}
            {actions.length > 0 && (
              <TableHead className="w-12"></TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow 
              key={item.id || index}
              className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <TableCell key={String(column.key)}>
                  {renderCell(item, column)}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {actions
                        .filter(action => !action.hidden?.(item))
                        .map((action, actionIndex) => (
                        <DropdownMenuItem
                          key={actionIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(item);
                          }}
                          className={action.variant === 'destructive' ? 'text-destructive' : ''}
                        >
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}