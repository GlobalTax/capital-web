import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { staticLandingPages } from '@/config/static-landing-pages';
import { StaticLandingCard } from './StaticLandingCard';
import LandingPagesManager from '@/components/admin/LandingPagesManager';

export const UnifiedLandingPagesManager = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStaticLandings = staticLandingPages.filter(landing =>
    landing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    landing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    landing.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Landing Pages</h1>
        <p className="text-muted-foreground">Gestiona todas las landing pages del sitio</p>
      </div>

      <Tabs defaultValue="static" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="static">
            Estáticas ({staticLandingPages.length})
          </TabsTrigger>
          <TabsTrigger value="dynamic">
            Dinámicas (BD)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="static" className="space-y-4 mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar landing pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaticLandings.map(landing => (
              <StaticLandingCard key={landing.id} landing={landing} />
            ))}
          </div>

          {filteredStaticLandings.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron landing pages
            </div>
          )}
        </TabsContent>

        <TabsContent value="dynamic" className="mt-6">
          <LandingPagesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
