import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

interface BlogFiltersProps {
  selectedCategory: string;
  selectedTags: string[];
  availableCategories: string[];
  availableTags: string[];
  onCategoryChange: (category: string) => void;
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
}

const BlogFilters: React.FC<BlogFiltersProps> = ({
  selectedCategory,
  selectedTags,
  availableCategories,
  availableTags,
  onCategoryChange,
  onTagToggle,
  onClearFilters
}) => {
  const hasActiveFilters = selectedCategory !== 'all' || selectedTags.length > 0;

  return (
    <div className="bg-white border rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Categorías */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Categorías</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange('all')}
            className="text-sm"
          >
            Todas
          </Button>
          {availableCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className="text-sm capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Tags</h4>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <Badge
                key={tag}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                }`}
                onClick={() => onTagToggle(tag)}
              >
                {tag}
                {isSelected && <X className="w-3 h-3 ml-1" />}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Filtros activos:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Categoría: {selectedCategory}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => onCategoryChange('all')}
                />
              </Badge>
            )}
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => onTagToggle(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogFilters;