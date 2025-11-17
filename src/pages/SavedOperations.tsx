import React, { useState } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { useSavedOperations } from '@/hooks/useSavedOperations';
import { useAuth } from '@/contexts/AuthContext';
import OperationCard from '@/components/operations/OperationCard';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight, Grid, List } from 'lucide-react';
import { SEOHead } from '@/components/seo';

const SavedOperations = () => {
  const { user } = useAuth();
  const { savedOperations, isLoading } = useSavedOperations();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (!user) {
    return (
      <UnifiedLayout variant="home">
        <div className="min-h-screen bg-background py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Operaciones Guardadas</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Inicia sesión para ver tus operaciones favoritas
            </p>
            <Button asChild size="lg">
              <a href="/auth">
                Iniciar Sesión
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <>
      <SEOHead 
        title="Mis Operaciones Guardadas - Capittal"
        description="Gestiona tus operaciones favoritas"
        noindex
      />
      <UnifiedLayout variant="home">
        <div className="min-h-screen bg-background py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                    <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                    Mis Favoritos
                  </h1>
                  <p className="text-muted-foreground">
                    {savedOperations?.length || 0} operaciones guardadas
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">Cargando...</div>
            ) : savedOperations && savedOperations.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {savedOperations.map(saved => (
                  <OperationCard
                    key={saved.id}
                    operation={saved.operation}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">
                  No tienes operaciones guardadas
                </p>
                <Button asChild>
                  <a href="/oportunidades">
                    Explorar Oportunidades
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </UnifiedLayout>
    </>
  );
};

export default SavedOperations;
