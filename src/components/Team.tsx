
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, TrendingUp, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCountAnimation } from '@/hooks/useCountAnimation';
import LazyImage from '@/components/LazyImage';
import LazySection from '@/components/LazySection';

interface TeamMember {
  id: string;
  name: string;
  position?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
}

// Team Stats Component
const TeamStats = () => {
  const { count: experienceCount, ref: experienceRef } = useCountAnimation(15, 2000, '+');
  const { count: transactionCount, ref: transactionRef } = useCountAnimation(200, 2500, '+');
  const { count: clientCount, ref: clientRef } = useCountAnimation(150, 2000, '+');

  return (
    <LazySection className="py-16 bg-gradient-to-br from-secondary to-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div ref={experienceRef} className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {experienceCount}
            </div>
            <p className="text-muted-foreground text-lg">Años de Experiencia</p>
          </div>
          <div ref={transactionRef} className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {transactionCount}
            </div>
            <p className="text-muted-foreground text-lg">Transacciones Completadas</p>
          </div>
          <div ref={clientRef} className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {clientCount}
            </div>
            <p className="text-muted-foreground text-lg">Clientes Asesorados</p>
          </div>
        </div>
      </div>
    </LazySection>
  );
};

// Team Member Card Component
const TeamMemberCard = ({ member }: { member: TeamMember }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group bg-card border border-gray-300 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-[4/5] overflow-hidden">
        {member.image_url && !imageError ? (
          <img
            src={member.image_url}
            alt={member.name}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Users className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
          {member.name}
        </h3>
        {member.position && (
          <p className="text-muted-foreground text-sm mb-4 font-medium">
            {member.position}
          </p>
        )}
        
        <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>Ver perfil completo</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <LazySection className="relative py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 animate-fade-in-up">
              Nuestro Equipo
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8 animate-fade-in-up">
              Profesionales con trayectorias excepcionales en las principales firmas 
              de inversión y consultoría del mundo, unidos por la pasión de crear valor.
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
              <div className="flex items-center gap-2 text-primary font-medium">
                <Award className="w-5 h-5" />
                <span>Experiencia Global</span>
              </div>
              <div className="flex items-center gap-2 text-primary font-medium">
                <TrendingUp className="w-5 h-5" />
                <span>Resultados Probados</span>
              </div>
              <div className="flex items-center gap-2 text-primary font-medium">
                <Users className="w-5 h-5" />
                <span>Enfoque Colaborativo</span>
              </div>
            </div>
          </div>
        </div>
      </LazySection>

      {/* Team Stats */}
      <TeamStats />

      {/* Team Members Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card border border-gray-300 rounded-xl overflow-hidden shadow-sm">
                  <div className="aspect-[4/5] bg-muted animate-pulse" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                    <div className="space-y-2">
                      <div className="h-2 bg-muted rounded animate-pulse" />
                      <div className="h-2 bg-muted rounded animate-pulse w-4/5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
                <Users className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-destructive mb-2">Error al cargar el equipo</h3>
                <p className="text-destructive/80 text-sm mb-4">{error}</p>
                <button 
                  onClick={fetchTeamMembers}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : teamMembers && teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div 
                  key={member.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <TeamMemberCard member={member} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No hay miembros del equipo disponibles.</p>
            </div>
          )}
        </div>
      </section>

      {/* Team Philosophy */}
      <LazySection className="py-20 bg-gradient-to-br from-muted/30 to-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8">
              Nuestra Filosofía de Equipo
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12">
              Creemos que el éxito en M&A no solo requiere expertise técnico, sino también la capacidad 
              de entender las particularidades de cada sector y las necesidades específicas de nuestros clientes. 
              Nuestro enfoque colaborativo garantiza que cada transacción cuente con la perspectiva integral 
              de especialistas dedicados.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Excelencia</h3>
                <p className="text-muted-foreground">Búsqueda constante de la perfección en cada detalle</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Colaboración</h3>
                <p className="text-muted-foreground">Trabajo en equipo para maximizar el valor</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Innovación</h3>
                <p className="text-muted-foreground">Soluciones creativas para desafíos complejos</p>
              </div>
            </div>
          </div>
        </div>
      </LazySection>

      {/* CTA Section */}
      <LazySection className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              ¿Interesado en unirte a nuestro equipo?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Siempre estamos buscando talento excepcional para expandir nuestro equipo. 
              Si compartes nuestra pasión por la excelencia en M&A, nos encantaría conocerte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/contacto"
                className="inline-flex items-center px-8 py-4 bg-primary-foreground text-primary rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contactar con Nosotros
              </Link>
              <Link 
                to="/colabora"
                className="inline-flex items-center px-8 py-4 border-2 border-primary-foreground text-primary-foreground rounded-lg hover:bg-primary-foreground hover:text-primary transition-all duration-300 font-medium"
              >
                Ver Oportunidades
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </LazySection>
    </div>
  );
};

export default Team;
