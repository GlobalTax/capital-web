import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Settings, ExternalLink } from 'lucide-react';
import { useHighlights } from './useHighlights';
import { HighlightCard } from './HighlightCard';
import { HighlightsManager } from './HighlightsManager';
import { Skeleton } from '@/components/ui/skeleton';

export const HighlightsSidebar: React.FC = () => {
  const { data: highlights = [], isLoading } = useHighlights();
  const [managerOpen, setManagerOpen] = useState(false);

  return (
    <>
      <aside className="hidden xl:block w-64 flex-shrink-0">
        <div className="sticky top-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Destacados
              </CardTitle>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setManagerOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : highlights.length === 0 ? (
                <div className="text-center py-4">
                  <ExternalLink className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No hay destacados
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setManagerOpen(true)}
                    className="mt-1"
                  >
                    Añadir uno
                  </Button>
                </div>
              ) : (
                highlights.map((highlight) => (
                  <HighlightCard key={highlight.id} highlight={highlight} />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </aside>

      <HighlightsManager open={managerOpen} onOpenChange={setManagerOpen} />
    </>
  );
};
