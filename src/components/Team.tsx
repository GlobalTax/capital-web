
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  id: string;
  name: string;
  position?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
}

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error al cargar miembros del equipo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="equipo" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Nuestro Equipo
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Profesionales con trayectorias excepcionales en las principales firmas 
            de inversión y consultoría del mundo.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-0.5 border-black"></div>
          </div>
        ) : teamMembers.length > 0 ? (
          <div className="relative">
            <Carousel
              plugins={[
                Autoplay({
                  delay: 3000,
                  stopOnInteraction: true,
                }),
              ]}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                {teamMembers.map((member) => (
                  <CarouselItem key={member.id} className="pl-2 basis-auto">
                    <div className="w-64 h-64 overflow-hidden rounded-lg border-0.5 border-gray-300">
                      {member.image_url ? (
                        <img 
                          src={member.image_url} 
                          alt={member.name}
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-center font-medium">
                            {member.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="bg-white text-black border-0.5 border-gray-300 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 -left-12" />
              <CarouselNext className="bg-white text-black border-0.5 border-gray-300 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 -right-12" />
            </Carousel>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No hay miembros del equipo disponibles.</p>
          </div>
        )}

        <div className="text-center mt-20">
          <Link 
            to="/equipo"
            className="inline-flex items-center px-6 py-3 bg-white text-black border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out font-medium"
          >
            Ver Equipo Completo
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Team;
