import React from 'react';
import { Award, BookOpen, Users } from 'lucide-react';

const PlanificacionFiscalTeam = () => {
  const teamMembers = [
    {
      name: "Director Fiscal Senior",
      role: "Especialista en M&A Fiscal", 
      experience: "15+ años en fiscalidad corporativa",
      specialties: ["Estructuras M&A", "Diferimiento fiscal", "Régimenes especiales"],
      credentials: "AEDAF, Colegio de Economistas"
    },
    {
      name: "Manager Fiscal",
      role: "Experto en Tributación Internacional",
      experience: "12+ años en asesoramiento fiscal", 
      specialties: ["Doble imposición", "Precios transferencia", "Planificación internacional"],
      credentials: "IFA, ICAEW"
    },
    {
      name: "Senior Fiscal",
      role: "Especialista en Due Diligence",
      experience: "8+ años en análisis fiscal",
      specialties: ["Contingencias fiscales", "Compliance", "Auditoría fiscal"],
      credentials: "ICJCE, Registro ROAC"
    }
  ];

  const teamHighlights = [
    {
      icon: Award,
      title: "Experiencia Acreditada",
      description: "Más de 40 años de experiencia combinada en fiscalidad corporativa y operaciones M&A"
    },
    {
      icon: BookOpen,
      title: "Formación Especializada", 
      description: "Certificaciones profesionales en las principales asociaciones fiscales nacionales e internacionales"
    },
    {
      icon: Users,
      title: "Equipo Multidisciplinar",
      description: "Colaboración estrecha con abogados, auditores y asesores financieros para soluciones integrales"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Equipo de Expertos Fiscales
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nuestro equipo combina experiencia en fiscalidad corporativa, M&A y 
            reestructuraciones para ofrecerte el mejor asesoramiento fiscal.
          </p>
        </div>

        {/* Team highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {teamHighlights.map((highlight, index) => (
            <div key={index} className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <highlight.icon className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-bold text-black mb-3">
                {highlight.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>

        {/* Team members */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
              {/* Avatar placeholder */}
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-bold text-black mb-1">
                  {member.name}
                </h3>
                <p className="text-gray-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  {member.experience}
                </p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-black mb-2">Especialidades:</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.specialties.map((specialty, specialtyIndex) => (
                      <span key={specialtyIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  {member.credentials}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white border border-gray-300 rounded-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-black mb-4">
              Enfoque Colaborativo
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Trabajamos de forma coordinada con tu equipo interno y otros asesores 
              (legales, financieros, auditores) para asegurar una planificación fiscal 
              integral y alineada con tus objetivos empresariales.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-xl font-bold text-black mb-1">100%</div>
                <div className="text-gray-600 text-sm">Operaciones compliance</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-black mb-1">48h</div>
                <div className="text-gray-600 text-sm">Tiempo respuesta</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-black mb-1">15+</div>
                <div className="text-gray-600 text-sm">Años experiencia</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-black mb-1">€180M</div>
                <div className="text-gray-600 text-sm">Ahorro generado</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanificacionFiscalTeam;