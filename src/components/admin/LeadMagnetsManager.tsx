import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { LeadMagnet } from '@/types/leadMagnets';

const LeadMagnetsManager = () => {
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchLeadMagnets();
  }, []);

  const fetchLeadMagnets = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform landing pages data to lead magnets format
      const transformedData = data?.map(item => ({
        id: item.id,
        title: item.title,
        type: 'report' as const,
        sector: 'General',
        description: item.meta_description || '',
        download_count: 0,
        lead_conversion_count: 0,
        status: item.is_published ? 'active' as const : 'draft' as const,
        meta_title: item.meta_title,
        meta_description: item.meta_description,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];

      setLeadMagnets(transformedData);
    } catch (error) {
      console.error('Error fetching lead magnets:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los lead magnets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeadMagnets = leadMagnets.filter(magnet =>
    magnet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    magnet.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      report: 'bg-blue-100 text-blue-800',
      whitepaper: 'bg-purple-100 text-purple-800',
      checklist: 'bg-green-100 text-green-800',
      template: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando lead magnets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lead Magnets</h1>
          <p className="text-muted-foreground">
            Gestiona recursos descargables para capturar leads
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Lead Magnet
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar lead magnets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lead Magnets</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadMagnets.length}</div>
            <p className="text-xs text-muted-foreground">recursos disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descargas Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leadMagnets.reduce((sum, magnet) => sum + magnet.download_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">descargas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversiones</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leadMagnets.reduce((sum, magnet) => sum + magnet.lead_conversion_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">leads generados</p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Magnets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeadMagnets.map((magnet) => (
          <Card key={magnet.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{magnet.title}</CardTitle>
                  <CardDescription>{magnet.sector}</CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getTypeColor(magnet.type)}>
                    {magnet.type}
                  </Badge>
                  <Badge className={getStatusColor(magnet.status)}>
                    {magnet.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {magnet.description}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Descargas:</span>
                  <div className="text-lg font-bold">{magnet.download_count}</div>
                </div>
                <div>
                  <span className="font-medium">Conversiones:</span>
                  <div className="text-lg font-bold">{magnet.lead_conversion_count}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeadMagnets.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay lead magnets</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'Aún no has creado ningún lead magnet.'}
            </p>
            {!searchTerm && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear tu primer lead magnet
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeadMagnetsManager;