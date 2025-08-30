
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
    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="w-56 h-56 mx-auto mb-6 rounded-full overflow-hidden bg-gray-100 shadow-lg">
        {member.image_url && !imageError ? (
          <img
            src={member.image_url}
            alt={`${member.name} - ${member.position || 'Miembro del equipo'}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Users className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {member.name}
      </h3>
      {member.position && (
        <p className="text-base text-gray-600 font-medium mb-4">
          {member.position}
        </p>
      )}
      
      {/* Add experience badges if available */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
          M&A Expert
        </span>
        <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm font-medium">
          Investment Banking
        </span>
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
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <section className="pt-24 pb-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Nuestro Equipo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Profesionales especializados en M&A con experiencia en las principales firmas de inversión globales.
          </p>
          
          {/* Team Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">15+</div>
              <div className="text-sm text-gray-600">Años de Experiencia</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">100+</div>
              <div className="text-sm text-gray-600">Transacciones</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">€2B+</div>
              <div className="text-sm text-gray-600">Valor Gestionado</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
              <div className="text-sm text-gray-600">Tasa de Éxito</div>
            </div>
          </div>
        </div>
      </section>


      {/* Team Members */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                  <div className="w-56 h-56 mx-auto mb-6 rounded-full bg-gray-100 animate-pulse" />
                  <div className="h-6 bg-gray-100 rounded animate-pulse mb-3 mx-auto max-w-40" />
                  <div className="h-5 bg-gray-100 rounded animate-pulse mb-4 mx-auto max-w-32" />
                  <div className="flex justify-center gap-2">
                    <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                    <div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Error al cargar el equipo</p>
              <button 
                onClick={fetchTeamMembers}
                className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Reintentar
              </button>
            </div>
          ) : teamMembers && teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No hay miembros del equipo disponibles.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Team;
