import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Scale, Trash2 } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import { cn } from '@/lib/utils';

export const CompareBar: React.FC = () => {
  const { 
    compareList, 
    removeFromCompare, 
    clearCompare, 
    openCompareModal 
  } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Selected items */}
          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            <Scale className="h-5 w-5 text-primary shrink-0" />
            <span className="text-sm font-medium text-muted-foreground shrink-0">
              Comparar:
            </span>
            <div className="flex items-center gap-2">
              {compareList.map((op) => (
                <Badge
                  key={op.id}
                  variant="secondary"
                  className="flex items-center gap-1 py-1.5 px-3 max-w-[150px]"
                >
                  <span className="truncate text-xs">{op.company_name}</span>
                  <button
                    onClick={() => removeFromCompare(op.id)}
                    className="ml-1 hover:text-destructive transition-colors"
                    aria-label={`Quitar ${op.company_name} de comparación`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {compareList.length < 4 && (
                <span className="text-xs text-muted-foreground">
                  (+{4 - compareList.length} más)
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompare}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
            <Button
              onClick={openCompareModal}
              disabled={compareList.length < 2}
              className="gap-2"
            >
              <Scale className="h-4 w-4" />
              Comparar ({compareList.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
