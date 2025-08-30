import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calculator, 
  Building, 
  FileSignature, 
  Search, 
  Handshake, 
  GitMerge, 
  HelpCircle 
} from 'lucide-react';

export type MACategory = 
  | 'all' 
  | 'preparacion' 
  | 'valoracion' 
  | 'estructura' 
  | 'loi' 
  | 'due-diligence' 
  | 'cierre' 
  | 'integracion' 
  | 'faqs';

interface MAResourcesFilterProps {
  activeCategory: MACategory;
  onCategoryChange: (category: MACategory) => void;
}

const categories = [
  { 
    id: 'all' as MACategory, 
    label: 'Todos', 
    icon: FileText, 
    color: 'bg-primary/10 text-primary border-primary/20',
    count: 8 
  },
  { 
    id: 'preparacion' as MACategory, 
    label: 'Preparación', 
    icon: FileText, 
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    count: 4 
  },
  { 
    id: 'valoracion' as MACategory, 
    label: 'Valoración', 
    icon: Calculator, 
    color: 'bg-green-50 text-green-700 border-green-200',
    count: 6 
  },
  { 
    id: 'estructura' as MACategory, 
    label: 'Estructura del Deal', 
    icon: Building, 
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    count: 5 
  },
  { 
    id: 'loi' as MACategory, 
    label: 'LOI', 
    icon: FileSignature, 
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    count: 3 
  },
  { 
    id: 'due-diligence' as MACategory, 
    label: 'Due Diligence', 
    icon: Search, 
    color: 'bg-red-50 text-red-700 border-red-200',
    count: 8 
  },
  { 
    id: 'cierre' as MACategory, 
    label: 'Cierre', 
    icon: Handshake, 
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    count: 4 
  },
  { 
    id: 'integracion' as MACategory, 
    label: 'Integración', 
    icon: GitMerge, 
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    count: 6 
  },
  { 
    id: 'faqs' as MACategory, 
    label: 'FAQs / Glosario', 
    icon: HelpCircle, 
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    count: 12 
  }
];

export const MAResourcesFilter: React.FC<MAResourcesFilterProps> = ({
  activeCategory,
  onCategoryChange
}) => {
  return (
    <div className="sticky top-20 z-10 bg-background/95 backdrop-blur-sm border-b border-border py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Filtrar por categoría
        </h2>
        
        {/* Desktop filters */}
        <div className="hidden md:flex flex-wrap gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category.id)}
                className={`flex items-center gap-2 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
                <Badge 
                  variant="secondary" 
                  className={`ml-1 text-xs ${
                    isActive 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {category.count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Mobile filters - scrollable */}
        <div className="md:hidden overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              
              return (
                <Button
                  key={category.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange(category.id)}
                  className={`flex items-center gap-2 whitespace-nowrap ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.label}</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {category.count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};