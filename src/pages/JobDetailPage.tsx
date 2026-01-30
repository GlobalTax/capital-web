import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  TrendingUp, 
  Calendar,
  Building2,
  Euro,
  ArrowLeft
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useJobPost } from '@/hooks/useJobPosts';
import { JobApplicationDialog } from '@/components/jobs/JobApplicationDialog';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { sanitizeHtml } from '@/shared/utils/sanitize';

const JobDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: job, isLoading } = useJobPost(slug!);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p>Cargando...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Oferta no encontrada</h1>
            <Button asChild>
              <Link to="/oportunidades/empleo">Ver todas las ofertas</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/oportunidades/empleo">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a ofertas
            </Link>
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {job.is_featured && <Badge variant="default">Destacada</Badge>}
                  {job.is_urgent && <Badge variant="destructive">Urgente</Badge>}
                  {job.category && <Badge variant="outline">{job.category.name}</Badge>}
                </div>
                <h1 className="text-4xl font-bold mb-4">{job.title}</h1>
                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <span>{job.company_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    <span className="capitalize">{job.employment_type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Descripción del puesto</h2>
                <div 
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.description) }}
                />
              </Card>

              {job.requirements && job.requirements.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Requisitos</h2>
                  <ul className="space-y-2">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {job.responsibilities && job.responsibilities.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Responsabilidades</h2>
                  <ul className="space-y-2">
                    {job.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Beneficios</h2>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6 lg:sticky lg:top-24">
                <Button 
                  size="lg" 
                  className="w-full mb-6"
                  onClick={() => setIsApplicationOpen(true)}
                >
                  Aplicar a esta oferta
                </Button>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Tipo de contrato</h3>
                    <p className="text-muted-foreground capitalize">
                      {job.contract_type.replace('_', ' ')}
                    </p>
                  </div>

                  {job.is_salary_visible && job.salary_min && job.salary_max && (
                    <div>
                      <h3 className="font-semibold mb-2">Salario</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Euro className="h-4 w-4" />
                        <span>
                          {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} {job.salary_currency}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {job.salary_period === 'annual' ? 'Anual' : 'Mensual'}
                      </p>
                    </div>
                  )}

                  {job.experience_level && (
                    <div>
                      <h3 className="font-semibold mb-2">Nivel de experiencia</h3>
                      <p className="text-muted-foreground capitalize">{job.experience_level}</p>
                    </div>
                  )}

                  {job.required_languages && job.required_languages.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Idiomas requeridos</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.required_languages.map((lang, idx) => (
                          <Badge key={idx} variant="outline">{lang}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Publicado {formatDistanceToNow(new Date(job.published_at!), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                    {job.closes_at && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          Cierra {format(new Date(job.closes_at), "d 'de' MMMM", { locale: es })}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>{job.application_count} solicitudes</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Application Dialog */}
      <JobApplicationDialog 
        jobPostId={job.id}
        jobTitle={job.title}
        open={isApplicationOpen}
        onOpenChange={setIsApplicationOpen}
      />
    </>
  );
};

export default JobDetailPage;
