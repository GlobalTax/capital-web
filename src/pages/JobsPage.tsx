import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, TrendingUp, Search, Building2, Euro, Users, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                <Briefcase className="h-4 w-4" />
                <span>Carreras en M&A</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Únete al equipo de <span className="text-blue-400">Capittal</span>
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Construye tu carrera en el mundo de las fusiones y adquisiciones. 
                Trabajamos con las empresas más innovadoras de España.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">+50</div>
                  <div className="text-sm text-slate-400">Operaciones anuales</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">15+</div>
                  <div className="text-sm text-slate-400">Años de experiencia</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">7</div>
                  <div className="text-sm text-slate-400">Oficinas en España</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">30+</div>
                  <div className="text-sm text-slate-400">Profesionales</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="container mx-auto px-4 -mt-12">
          <Card className="p-6 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar ofertas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Todas las categorías" />
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
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Todas las ubicaciones" />
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
        <section className="container mx-auto px-4 py-16">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando ofertas...</p>
            </div>
          ) : filteredJobs && filteredJobs.length > 0 ? (
            <div className="grid gap-6">
              {filteredJobs.map((job) => (
                <Link key={job.id} to={`/oportunidades/empleo/${job.slug}`}>
                  <Card className="group p-8 hover:shadow-2xl hover:border-primary/50 transition-all duration-300 cursor-pointer border-2">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                            <Briefcase className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                                {job.title}
                              </h3>
                              {job.is_featured && (
                                <Badge className="bg-blue-500 hover:bg-blue-600">
                                  ⭐ Destacada
                                </Badge>
                              )}
                              {job.is_urgent && (
                                <Badge variant="destructive" className="animate-pulse">
                                  🔥 Urgente
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                              {job.short_description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-medium">{job.location}</span>
                            {job.is_remote && (
                              <Badge variant="secondary" className="ml-1">Remoto</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                            <Building2 className="h-4 w-4 text-primary" />
                            <span className="capitalize font-medium">
                              {job.employment_type.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                              {formatDistanceToNow(new Date(job.published_at!), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </span>
                          </div>
                          {job.category && (
                            <Badge variant="outline" className="px-3 py-1">
                              {job.category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button size="lg" className="shrink-0 group-hover:bg-primary group-hover:scale-105 transition-transform">
                        Ver oferta
                        <TrendingUp className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Briefcase className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold">No hay ofertas disponibles</h3>
                <p className="text-muted-foreground text-lg">
                  No se encontraron ofertas con los filtros seleccionados. 
                  Intenta ajustar tus criterios de búsqueda.
                </p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                }} variant="outline" size="lg">
                  Limpiar filtros
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold">
                  ¿No encuentras lo que buscas?
                </h2>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  Envíanos tu candidatura espontánea y te contactaremos cuando tengamos
                  una posición que se ajuste a tu perfil y experiencia.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 py-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3">
                  <Users className="h-10 w-10 text-blue-400 mx-auto" />
                  <h3 className="font-semibold text-lg">Equipo diverso</h3>
                  <p className="text-sm text-slate-300">
                    Profesionales con diferentes backgrounds y experiencias
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3">
                  <TrendingUp className="h-10 w-10 text-blue-400 mx-auto" />
                  <h3 className="font-semibold text-lg">Desarrollo continuo</h3>
                  <p className="text-sm text-slate-300">
                    Formación constante y oportunidades de crecimiento
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3">
                  <Building2 className="h-10 w-10 text-blue-400 mx-auto" />
                  <h3 className="font-semibold text-lg">Proyectos únicos</h3>
                  <p className="text-sm text-slate-300">
                    Participa en operaciones M&A de alto impacto
                  </p>
                </div>
              </div>
              
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100" asChild>
                <Link to="/contacto">
                  Enviar candidatura espontánea
                  <TrendingUp className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default JobsPage;
