
import React, { useCallback, useState } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  id: string;
  name: string;
  position?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
}

// Enhanced Team Member Card
const TeamMemberCard = ({ member }: { member: TeamMember }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="text-center">
      <div className="relative overflow-hidden bg-gray-100 aspect-square mb-6 mx-auto w-48">
        {member.image_url && !imageError ? (
          <img
            src={member.image_url}
            alt={`${member.name} - ${member.position || 'Miembro del equipo'}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Users className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-medium text-black mb-2">
        {member.name}
      </h3>
      {member.position && (
        <p className="text-sm text-gray-600">
          {member.position}
        </p>
      )}
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
    <div className="py-32 bg-white">
      {/* Header */}
      <section className="mb-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-light text-black mb-8">
            Nuestro Equipo
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed mb-16">
            Expertos en M&A con trayectorias internacionales y resultados probados en las mejores firmas del mundo.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-light text-black mb-2">25+</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Años Experiencia</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-black mb-2">500+</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Transacciones</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-black mb-2">€5B+</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Valor Gestionado</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-black mb-2">95%</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Tasa Éxito</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="border-t border-gray-200 pt-24">
        <div className="max-w-4xl mx-auto px-4">
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
              <p className="text-black mb-4">Error al cargar el equipo</p>
              <button 
                onClick={fetchTeamMembers}
                className="bg-black text-white px-6 py-2 hover:bg-gray-800"
              >
                Reintentar
              </button>
            </div>
          ) : teamMembers && teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {teamMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-black">No hay miembros del equipo disponibles.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Team;
