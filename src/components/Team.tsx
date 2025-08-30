
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

// Simple Team Member Card
const TeamMemberCard = ({ member }: { member: TeamMember }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="text-center">
      <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
        {member.image_url && !imageError ? (
          <img
            src={member.image_url}
            alt={member.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-medium text-black mb-1">
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
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <section className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-black mb-6">
            Equipo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Profesionales especializados en M&A con experiencia en las principales firmas de inversión.
          </p>
        </div>
      </section>

      {/* Team Members */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse" />
                  <div className="h-5 bg-gray-100 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Error al cargar el equipo</p>
              <button 
                onClick={fetchTeamMembers}
                className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : teamMembers && teamMembers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
              {teamMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No hay miembros del equipo disponibles.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Team;
