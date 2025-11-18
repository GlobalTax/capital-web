import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminUsers } from '@/hooks/useAdminUsers';

interface KanbanFiltersProps {
  filters: {
    assigned_to?: string;
    sector?: string;
    search?: string;
  };
  onFiltersChange: (filters: any) => void;
  sectors: string[];
}

export const KanbanFilters: React.FC<KanbanFiltersProps> = ({
  filters,
  onFiltersChange,
  sectors,
}) => {
  const { users: adminUsers } = useAdminUsers();

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.assigned_to || filters.sector || filters.search;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-end gap-4">
          {/* Búsqueda */}
          <div className="flex-1 space-y-2">
            <Label className="text-xs text-muted-foreground">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={filters.search || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, search: e.target.value })
                }
                placeholder="Buscar por empresa..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Usuario asignado */}
          <div className="w-48 space-y-2">
            <Label className="text-xs text-muted-foreground">Asignado a</Label>
            <Select
              value={filters.assigned_to || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  assigned_to: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {adminUsers.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sector */}
          <div className="w-48 space-y-2">
            <Label className="text-xs text-muted-foreground">Sector</Label>
            <Select
              value={filters.sector || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  sector: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botón limpiar filtros */}
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="outline"
              size="icon"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
