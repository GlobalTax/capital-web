import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BlogFiltersProps {
  search: string;
  category: string;
  tag: string;
  sortBy: string;
  sortOrder: string;
  categories: string[];
  tags: string[];
  totalResults: number;
  hasActiveFilters: boolean;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onTagChange: (tag: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onClearFilters: () => void;
}

const BlogFilters = ({
  search,
  category,
  tag,
  sortBy,
  sortOrder,
  categories,
  tags,
  totalResults,
  hasActiveFilters,
  onSearchChange,
  onCategoryChange,
  onTagChange,
  onSortChange,
  onClearFilters
}: BlogFiltersProps) => {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar artículos..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-12"
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filtros y ordenación */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Filtro por categoría */}
            <div className="flex-1 min-w-48">
              <Select value={category} onValueChange={onCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por tag */}
            <div className="flex-1 min-w-48">
              <Select value={tag} onValueChange={onTagChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tags</SelectItem>
                  {tags.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ordenación */}
            <div className="flex gap-2">
              <Select 
                value={sortBy} 
                onValueChange={(value) => onSortChange(value, sortOrder)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Fecha</SelectItem>
                  <SelectItem value="title">Título</SelectItem>
                  <SelectItem value="reading_time">Tiempo de lectura</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>

            {/* Limpiar filtros */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>

          {/* Filtros activos */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Búsqueda: "{search}"
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onSearchChange('')}
                  />
                </Badge>
              )}
              {category && category !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Categoría: {category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onCategoryChange('all')}
                  />
                </Badge>
              )}
              {tag && tag !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tag: {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onTagChange('all')}
                  />
                </Badge>
              )}
            </div>
          )}

          {/* Contador de resultados */}
          <div className="text-sm text-muted-foreground">
            {totalResults === 1 
              ? '1 artículo encontrado' 
              : `${totalResults} artículos encontrados`
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogFilters;