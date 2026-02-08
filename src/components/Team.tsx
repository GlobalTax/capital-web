import React, { useCallback, useState } from 'react';
import { Users, Phone, Mail, Linkedin, ArrowRight, Building2, Scale, Calculator, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useCountAnimation } from '@/hooks/useCountAnimation';
import StatisticCard from '@/components/StatisticCard';

interface TeamMember {
  id: string;
  name: string;
  position?: string;
  image_url?: string;
  phone?: string;
  email?: string;
  linkedin_url?: string;
  section?: string;
  is_active: boolean;
  display_order: number;
}

// Section config with display order and icons
const SECTION_CONFIG: Record<string, { label: string; subtitle: string; icon: React.ElementType; order: number }> = {
  'Socios': { label: 'Socios', subtitle: 'Dirección y liderazgo del grupo', icon: Building2, order: 0 },
  'M&A': { label: 'División M&A', subtitle: 'Fusiones, adquisiciones y venta de empresas', icon: Briefcase, order: 1 },
  'Fiscal y Contable': { label: 'División Fiscal y Contable', subtitle: 'Planificación fiscal y asesoría contable', icon: Calculator, order: 2 },
  'Laboral': { label: 'División Laboral', subtitle: 'Asesoría laboral y relaciones laborales', icon: Users, order: 3 },
  'Legal': { label: 'División Legal', subtitle: 'Asesoría jurídica y mercantil', icon: Scale, order: 4 },
};

// Partner card — larger, more prominent
const PartnerCard = ({ member }: { member: TeamMember }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 ease-out border border-border group">
      <div className="relative overflow-hidden bg-muted aspect-[3/4]">
        {member.image_url && !imageError ? (
          <img
            src={member.image_url}
            alt={`${member.name} - ${member.position || 'Socio'}`}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Users className="w-24 h-24 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="p-8 space-y-4">
        <div className="text-center">
          <h3 className="text-2xl font-serif text-foreground mb-1">{member.name}</h3>
          {member.position && (
            <p className="text-primary text-sm font-semibold uppercase tracking-wider">{member.position}</p>
          )}
        </div>
        {(member.phone || member.email || member.linkedin_url) && (
          <div className="space-y-2 pt-3 border-t border-border">
            {member.phone && (
              <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" /><span>{member.phone}</span>
              </a>
            )}
            {member.email && (
              <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" /><span className="truncate">{member.email}</span>
              </a>
            )}
            {member.linkedin_url && (
              <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-medium py-2.5 px-4 rounded-lg transition-colors mt-2">
                <Linkedin className="w-4 h-4" /><span>Connect</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Regular team member card — compact
const TeamMemberCard = ({ member }: { member: TeamMember }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-out border border-border group">
      <div className="relative overflow-hidden bg-muted aspect-[4/5]">
        {member.image_url && !imageError ? (
          <img
            src={member.image_url}
            alt={`${member.name} - ${member.position || 'Miembro del equipo'}`}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Users className="w-20 h-20 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="p-6 space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-normal text-foreground mb-1">{member.name}</h3>
          {member.position && (
            <p className="text-muted-foreground text-sm font-medium">{member.position}</p>
          )}
        </div>
        {(member.phone || member.email || member.linkedin_url) && (
          <div className="space-y-2 pt-2 border-t border-border">
            {member.phone && (
              <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" /><span>{member.phone}</span>
              </a>
            )}
            {member.email && (
              <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" /><span className="truncate">{member.email}</span>
              </a>
            )}
            {member.linkedin_url && (
              <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
                <Linkedin className="w-4 h-4" /><span>Connect</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Section header with icon
const SectionHeader = ({ sectionKey }: { sectionKey: string }) => {
  const config = SECTION_CONFIG[sectionKey];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center mb-10">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">{config.label}</span>
      </div>
      <p className="text-muted-foreground text-sm">{config.subtitle}</p>
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

  // Group members by section in the order defined
  const groupedSections = React.useMemo(() => {
    const groups: { key: string; members: TeamMember[] }[] = [];
    const sectionOrder = Object.keys(SECTION_CONFIG);

    for (const sKey of sectionOrder) {
      const members = teamMembers.filter(m => m.section === sKey);
      if (members.length > 0) {
        groups.push({ key: sKey, members });
      }
    }
    // Any uncategorized
    const uncategorized = teamMembers.filter(m => !m.section || !SECTION_CONFIG[m.section]);
    if (uncategorized.length > 0) {
      groups.push({ key: 'Equipo', members: uncategorized });
    }
    return groups;
  }, [teamMembers]);

  const totalMembers = teamMembers.length;
  const totalDivisions = groupedSections.length;

  return (
    <div className="py-20 md:py-32 bg-background">
      {/* Header */}
      <section className="mb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            Nuestro Equipo
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-6">
            Un equipo multidisciplinar
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-4">
            {totalMembers > 0 ? (
              <>
                <span className="text-foreground font-semibold">{totalMembers}+ profesionales</span> del Grupo Navarro especializados en M&A, fiscalidad, derecho laboral y asesoría legal.
              </>
            ) : (
              'Profesionales con trayectorias internacionales y resultados probados.'
            )}
          </p>

          <p className="text-sm text-muted-foreground mb-16">
            Norgestion, Arcano o las Big 4 son referentes. Nosotros somos tu equipo cercano con la misma ambición.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatisticCard label="Años Experiencia" numericValue={25} suffix="+" delay={0} />
            <StatisticCard label="Profesionales" numericValue={totalMembers > 0 ? totalMembers : 20} suffix="+" delay={200} />
            <StatisticCard label="Transacciones" numericValue={100} suffix="+" delay={400} />
            <StatisticCard label="Divisiones Especializadas" numericValue={totalDivisions > 0 ? totalDivisions : 3} suffix="" delay={600} />
          </div>
        </div>
      </section>

      {/* Team Members by Section */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted aspect-[4/5] mb-4 rounded-2xl"></div>
                  <div className="h-4 bg-muted rounded mb-2 w-32 mx-auto"></div>
                  <div className="h-3 bg-muted rounded w-24 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-foreground mb-4">Error al cargar el equipo</p>
              <Button onClick={fetchTeamMembers}>Reintentar</Button>
            </div>
          ) : teamMembers.length > 0 ? (
            <div className="space-y-24">
              {groupedSections.map(({ key, members }) => {
                const isPartners = key === 'Socios';

                return (
                  <div key={key}>
                    <SectionHeader sectionKey={key} />

                    {isPartners ? (
                      /* Partners: larger cards, 2 columns max */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                        {members.map(member => (
                          <PartnerCard key={member.id} member={member} />
                        ))}
                      </div>
                    ) : (
                      /* Regular team: 3 columns */
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {members.map(member => (
                          <TeamMemberCard key={member.id} member={member} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-foreground">No hay miembros del equipo disponibles.</p>
            </div>
          )}
        </div>
      </section>

      {/* Group Banner */}
      <section className="mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-foreground text-background rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-serif mb-4">
                Capittal es la división de M&A de Navarro Tax & Legal
              </h2>
              <p className="text-background/80 max-w-2xl mx-auto mb-8 leading-relaxed">
                Juntos ofrecemos un servicio integral: financiero, fiscal, laboral y legal.
                Un solo grupo, todas las respuestas que tu empresa necesita.
              </p>
              <a
                href="https://nrro.es"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-background text-foreground font-medium py-3 px-6 rounded-lg hover:bg-background/90 transition-colors"
              >
                Conoce Navarro Tax & Legal
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;
