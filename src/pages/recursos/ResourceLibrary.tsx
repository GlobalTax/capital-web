import React, { useState, useMemo } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { useLeadMagnets } from '@/hooks/useLeadMagnets';
import ResourceCard from '@/components/recursos/ResourceCard';
import { Library, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const TYPE_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'report', label: 'Informes' },
  { value: 'whitepaper', label: 'Whitepapers' },
  { value: 'checklist', label: 'Checklists' },
  { value: 'template', label: 'Plantillas' },
] as const;

const ResourceLibrary = () => {
  const { leadMagnets, isLoading } = useLeadMagnets();
  const [activeType, setActiveType] = useState<string>('all');
  const [search, setSearch] = useState('');

  const activeResources = useMemo(() => {
    return (leadMagnets || []).filter(r => r.status === 'active');
  }, [leadMagnets]);

  const sectors = useMemo(() => {
    const set = new Set(activeResources.map(r => r.sector).filter(Boolean));
    return Array.from(set).sort();
  }, [activeResources]);

  const [activeSector, setActiveSector] = useState<string>('all');

  const filtered = useMemo(() => {
    return activeResources.filter(r => {
      if (activeType !== 'all' && r.type !== activeType) return false;
      if (activeSector !== 'all' && r.sector !== activeSector) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activeResources, activeType, activeSector, search]);

  return (
    <UnifiedLayout>
      <SEOHead
        title="Biblioteca de Recursos M&A | Informes y Guías Gratuitas | Capittal"
        description="Accede gratis a informes, whitepapers, checklists y plantillas sobre M&A, valoración de empresas y operaciones corporativas."
        canonical="https://capittal.es/recursos/biblioteca"
      />

      {/* Hero */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-primary/[0.03] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/5 rounded-full px-4 py-1.5 mb-6">
            <Library className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Recursos gratuitos</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Biblioteca de Recursos M&A
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Informes sectoriales, guías prácticas y herramientas para tomar mejores decisiones en operaciones corporativas.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Type pills */}
            <div className="flex flex-wrap gap-2">
              {TYPE_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setActiveType(f.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeType === f.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              {/* Sector dropdown */}
              {sectors.length > 0 && (
                <select
                  value={activeSector}
                  onChange={(e) => setActiveSector(e.target.value)}
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                >
                  <option value="all">Todos los sectores</option>
                  {sectors.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}

              {/* Search */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar recurso..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border overflow-hidden">
                  <Skeleton className="aspect-[16/10] w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Library className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron recursos</h3>
              <p className="text-muted-foreground">Prueba con otros filtros o busca un término diferente.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-8">
                {filtered.length} recurso{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </UnifiedLayout>
  );
};

export default ResourceLibrary;
