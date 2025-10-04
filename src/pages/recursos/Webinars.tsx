
import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Calendar, TrendingUp, Users, Play } from 'lucide-react';
import { useWebinars, Webinar } from '@/hooks/useWebinars';
import { WebinarCard } from '@/components/webinars/WebinarCard';
import { WebinarRegistrationForm } from '@/components/webinars/WebinarRegistrationForm';

const Webinars = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  // Fetch webinars
  const { webinars, isLoading } = useWebinars();

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'Todos los Webinars', icon: Calendar },
    { value: 'Fundamentos M&A', label: 'Fundamentos M&A', icon: Calendar },
    { value: 'Sectores Específicos', label: 'Sectores Específicos', icon: TrendingUp },
    { value: 'Estrategia y Preparación', label: 'Estrategia y Preparación', icon: Users },
    { value: 'Mercado y Tendencias', label: 'Mercado y Tendencias', icon: Play },
  ];

  // Filter and search webinars
  const filteredWebinars = useMemo(() => {
    if (!webinars) return [];

    let filtered = webinars;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(webinar => webinar.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(webinar =>
        webinar.title.toLowerCase().includes(term) ||
        webinar.description.toLowerCase().includes(term) ||
        webinar.speaker_name.toLowerCase().includes(term) ||
        webinar.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [webinars, selectedCategory, searchTerm]);

  // Get featured webinars
  const featuredWebinars = useMemo(() => {
    return webinars?.filter(webinar => webinar.is_featured) || [];
  }, [webinars]);

  // Get completed and scheduled webinars
  const completedWebinars = useMemo(() => {
    return filteredWebinars.filter(webinar => webinar.status === 'completed');
  }, [filteredWebinars]);

  const scheduledWebinars = useMemo(() => {
    return filteredWebinars.filter(webinar => webinar.status === 'scheduled');
  }, [filteredWebinars]);

  const handleViewDetails = (webinar: Webinar) => {
    // For now, scroll to webinar card - later can implement detailed view
    const element = document.getElementById(`webinar-${webinar.id}`);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRegister = (webinar: Webinar) => {
    setSelectedWebinar(webinar);
    setIsRegistrationOpen(true);
  };

  const getStats = () => {
    if (!webinars) return { total: 0, attendees: 0, categories: 0 };
    
    return {
      total: webinars.length,
      attendees: webinars.reduce((sum, w) => sum + w.attendee_count, 0),
      categories: [...new Set(webinars.map(w => w.category))].length
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Webinars de M&A
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Biblioteca completa de seminarios online con expertos en M&A. 
              Aprende de casos reales, mejores prácticas y tendencias del mercado.
            </p>
            
            {/* Stats */}
            <div className="flex justify-center items-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Webinars</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.attendees.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Asistentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.categories}</div>
                <div className="text-sm text-muted-foreground">Categorías</div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar webinars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Webinars */}
      {featuredWebinars.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Webinars Destacados
              </h2>
              <p className="text-muted-foreground">
                Los webinars más populares y con mayor impacto
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredWebinars.slice(0, 3).map((webinar) => (
                <div key={webinar.id} id={`webinar-${webinar.id}`}>
                  <WebinarCard
                    webinar={webinar}
                    onViewDetails={handleViewDetails}
                    onRegister={handleRegister}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="completed" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-12">
              <TabsTrigger value="completed">
                Webinars Pasados ({completedWebinars.length})
              </TabsTrigger>
              <TabsTrigger value="scheduled">
                Próximos ({scheduledWebinars.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="completed" className="space-y-8">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Cargando webinars...</p>
                </div>
              ) : completedWebinars.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No se encontraron webinars con los criterios seleccionados.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedWebinars.map((webinar) => (
                    <div key={webinar.id} id={`webinar-${webinar.id}`}>
                      <WebinarCard
                        webinar={webinar}
                        onViewDetails={handleViewDetails}
                        onRegister={handleRegister}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-8">
              {scheduledWebinars.length === 0 ? (
                <Card className="text-center py-16">
                  <CardContent className="space-y-4">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto" />
                    <CardTitle>Próximamente</CardTitle>
                    <CardDescription className="max-w-md mx-auto">
                      Estamos preparando nuevos webinars. Suscríbete a nuestro newsletter 
                      para ser el primero en enterarte de las próximas fechas.
                    </CardDescription>
                    <Button className="mt-4">
                      Notificarme de Nuevos Webinars
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scheduledWebinars.map((webinar) => (
                    <div key={webinar.id} id={`webinar-${webinar.id}`}>
                      <WebinarCard
                        webinar={webinar}
                        onViewDetails={handleViewDetails}
                        onRegister={handleRegister}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />

      {/* Registration Modal */}
      <WebinarRegistrationForm
        webinar={selectedWebinar}
        isOpen={isRegistrationOpen}
        onClose={() => {
          setIsRegistrationOpen(false);
          setSelectedWebinar(null);
        }}
      />
    </div>
  );
};

export default Webinars;
