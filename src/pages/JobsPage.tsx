import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, TrendingUp, Search } from 'lucide-react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJobPosts } from '@/hooks/useJobPosts';
import { useJobCategories } from '@/hooks/useJobCategories';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const JobsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const { jobPosts, isLoading } = useJobPosts({ status: 'published' });
  const { categories } = useJobCategories();

  const filteredJobs = jobPosts?.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.short_description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || job.category_id === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || 
      job.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <UnifiedLayout mainClassName="min-h-screen bg-background">
      {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold">
                Únete a Capittal
              </h1>
              <p className="text-xl text-muted-foreground">
                Construye tu carrera en el mundo de las fusiones y adquisiciones.
                Trabajamos con las empresas más innovadoras de España.
              </p>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="container mx-auto px-4 -mt-8">
          <Card className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ofertas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ubicaciones</SelectItem>
                  <SelectItem value="madrid">Madrid</SelectItem>
                  <SelectItem value="barcelona">Barcelona</SelectItem>
                  <SelectItem value="remoto">Remoto</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </section>

        {/* Jobs List */}
        <section className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="text-center py-12">Cargando ofertas...</div>
          ) : filteredJobs && filteredJobs.length > 0 ? (
            <div className="grid gap-6">
              {filteredJobs.map((job) => (
                <Link key={job.id} to={`/oportunidades/empleo/${job.slug}`}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-semibold">{job.title}</h3>
                          {job.is_featured && (
                            <Badge variant="default">Destacada</Badge>
                          )}
                          {job.is_urgent && (
                            <Badge variant="destructive">Urgente</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-4">
                          {job.short_description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                            {job.is_remote && <Badge variant="outline">Remoto</Badge>}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            <span className="capitalize">
                              {job.employment_type.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              Publicado {formatDistanceToNow(new Date(job.published_at!), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </span>
                          </div>
                          {job.category && (
                            <Badge variant="outline">{job.category.name}</Badge>
                          )}
                        </div>
                      </div>
                      <Button>
                        Ver oferta
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No se encontraron ofertas con los filtros seleccionados.
              </p>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="bg-primary/5 py-16">
          <div className="container mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl font-bold">¿No encuentras lo que buscas?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Envíanos tu candidatura espontánea y te contactaremos cuando tengamos
              una posición que se ajuste a tu perfil.
            </p>
            <Button size="lg" asChild>
              <Link to="/contacto">Enviar candidatura espontánea</Link>
            </Button>
          </div>
        </section>
    </UnifiedLayout>
  );
};

export default JobsPage;
