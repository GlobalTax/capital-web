import React, { useCallback, useState } from 'react';
import { Users, Phone, Mail, Linkedin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface TeamMember {
  id: string;
  name: string;
  position?: string;
  image_url?: string;
  phone?: string;
  email?: string;
  linkedin_url?: string;
  is_active: boolean;
  display_order: number;
}

// Enhanced Team Member Card with Contact Info
const TeamMemberCard = ({ member }: { member: TeamMember }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-out border border-border">
      {/* Photo - Larger rectangular format */}
      <div className="relative overflow-hidden bg-muted aspect-[4/5]">
        {member.image_url && !imageError ? (
          <img
            src={member.image_url}
            alt={`${member.name} - ${member.position || 'Miembro del equipo'}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Users className="w-20 h-20 text-muted-foreground/40" />
          </div>
        )}
      </div>
      
      {/* Info Section */}
      <div className="p-6 space-y-4">
        {/* Name & Position */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-1">
            {member.name}
          </h3>
          {member.position && (
            <p className="text-muted-foreground text-sm font-medium">
              {member.position}
            </p>
          )}
        </div>

        {/* Contact Information */}
        {(member.phone || member.email || member.linkedin_url) && (
          <div className="space-y-2 pt-2 border-t border-border">
            {/* Phone */}
            {member.phone && (
              <a 
                href={`tel:${member.phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{member.phone}</span>
              </a>
            )}

            {/* Email */}
            {member.email && (
              <a 
                href={`mailto:${member.email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="truncate">{member.email}</span>
              </a>
            )}

            {/* LinkedIn Connect Button */}
            {member.linkedin_url && (
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span>Connect</span>
              </a>
            )}
          </div>
        )}
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
    <div className="py-20 bg-white">
      {/* Header */}
      <section className="mb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium mb-6">
            Nuestro Equipo
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Expertos en M&A
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-16">
            Profesionales con trayectorias internacionales y resultados probados en las mejores firmas del mundo.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
              <div className="text-3xl font-bold text-foreground mb-2">25+</div>
              <div className="text-sm text-muted-foreground font-medium">Años Experiencia</div>
            </div>
            <div className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
              <div className="text-3xl font-bold text-foreground mb-2">100+</div>
              <div className="text-sm text-muted-foreground font-medium">Transacciones</div>
            </div>
            <div className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
              <div className="text-3xl font-bold text-foreground mb-2">€900M</div>
              <div className="text-sm text-muted-foreground font-medium">Valor Gestionado</div>
            </div>
            <div className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
              <div className="text-3xl font-bold text-foreground mb-2">98,7%</div>
              <div className="text-sm text-muted-foreground font-medium">Tasa Éxito</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse text-center">
                  <div className="bg-gray-200 aspect-square mb-6 mx-auto w-48"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 mx-auto w-32"></div>
                  <div className="h-3 bg-gray-200 rounded mx-auto w-24"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-foreground mb-4">Error al cargar el equipo</p>
              <Button onClick={fetchTeamMembers}>
                Reintentar
              </Button>
            </div>
          ) : teamMembers && teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {teamMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-foreground">No hay miembros del equipo disponibles.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Team;
