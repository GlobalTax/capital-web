import React from 'react';
import { SimpleButton } from '@/components/ui/simple-button';
import { Badge } from '@/components/ui/badge';

// Fixed: Removed undefined variable reference that was causing crashes

export const EnhancedHeroSection = () => {
  const recentActivity = [
    { name: 'TechCorp Valuation', value: '€25M', status: 'Completado', color: 'bg-green-500', statusColor: 'text-green-600' },
    { name: 'Industrial M&A', value: '€45M', status: 'En Progreso', color: 'bg-blue-500', statusColor: 'text-blue-600' },
    { name: 'Retail DD', value: '€18M', status: 'Iniciado', color: 'bg-slate-800', statusColor: 'text-slate-600' }
  ];


  return (
    <div className="bg-background">
      {/* Main Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Content */}
            <div className="space-y-8">
              <Badge className="bg-primary text-primary-foreground px-4 py-1.5">
                ⭐ Programa Exclusivo
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold text-black leading-tight">
                Únete al equipo de expertos en M&A
              </h1>
              
              <p className="text-xl text-black leading-relaxed max-w-lg">
                Forma parte de nuestra red de profesionales y accede a oportunidades exclusivas de valoración y transacciones
              </p>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-6 py-8">
                <div>
                  <div className="text-3xl font-bold text-black">50+</div>
                  <div className="text-sm text-black">Colaboradores Activos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-black">€1.2B</div>
                  <div className="text-sm text-black">Valor Gestionado</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-black">98,7%</div>
                  <div className="text-sm text-black">Satisfacción</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <SimpleButton 
                  text="Aplicar Ahora"
                  variant="primary"
                  size="lg"
                />
                <SimpleButton 
                  text="Requisitos"
                  variant="outline"
                  size="lg"
                />
              </div>
            </div>

            {/* Right Collaborators Dashboard Panel */}
            <div className="bg-card border rounded-lg shadow-sm">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
                <h3 className="text-lg font-medium">Capital Collaborators - Network Dashboard</h3>
                <Badge className="bg-blue-600 text-white px-2 py-1 text-xs">+12 Nuevos</Badge>
              </div>
              
              {/* Top Stats */}
              <div className="p-6 border-b">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-2xl font-bold text-black">50+</div>
                    <div className="text-sm text-black">Colaboradores Activos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-black">€1.2B</div>
                    <div className="text-sm text-black">Valor Gestionado</div>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="p-6">
                <h4 className="text-sm font-medium text-black mb-4">Actividad Reciente</h4>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${activity.color}`}></div>
                        <div>
                          <div className="font-medium text-black text-sm">{activity.name}</div>
                          <div className="text-xs text-black">{activity.value}</div>
                        </div>
                      </div>
                      <div className={`font-medium text-xs ${activity.statusColor}`}>
                        {activity.status}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Footer Stats */}
                <div className="mt-6 pt-4 border-t flex justify-between text-sm">
                  <span className="text-black">98,7% Satisfacción</span>
                  <span className="text-black">23 activos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default EnhancedHeroSection;